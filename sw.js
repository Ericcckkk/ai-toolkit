// Service Worker - 离线缓存
const CACHE_NAME = 'ai-toolkit-v8';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './knowledge-data.js',
    './data/fundamentals.js',
    './data/llm.js',
    './data/applications.js',
    './data/business.js',
    './data/tools.js',
    './data/frontier.js',
    './data/news.js',
    './data/cases.js',
    './data/lab.js',
    './data/ideas.js',
    './manifest.json'
];

// 安装：缓存所有静态资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// 激活：清除旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// 拦截请求：网络优先，回退缓存（确保能获取最新文件）
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.pathname.endsWith('/data/news.js')) {
        event.respondWith(fetch(event.request, { cache: 'no-store' }));
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // 成功从网络获取，更新缓存
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => {
                // 网络失败，回退缓存
                return caches.match(event.request);
            })
    );
});
