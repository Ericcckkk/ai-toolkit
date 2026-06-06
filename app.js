// ========== 数据持久化 ==========
const STORAGE_KEY = 'ai-toolkit-data';
const CHECKIN_KEY = 'ai-toolkit-checkin';

function loadUserData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function saveUserData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadCheckinData() {
    try {
        const data = localStorage.getItem(CHECKIN_KEY);
        return data ? JSON.parse(data) : {
            streak: 0,
            xp: 0,
            lastCheckin: null,
            history: [],
            todayTasks: [],
            todayCompleted: []
        };
    } catch (e) {
        return { streak: 0, xp: 0, lastCheckin: null, history: [], todayTasks: [], todayCompleted: [] };
    }
}

function saveCheckinData(data) {
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(data));
}

let userData = loadUserData();
let checkinData = loadCheckinData();

// ========== 等级系统 ==========
const LEVELS = [
    { name: 'AI 小白', minXP: 0 },
    { name: 'AI 入门', minXP: 50 },
    { name: 'AI 学徒', minXP: 150 },
    { name: 'AI 进阶', minXP: 300 },
    { name: 'AI 达人', minXP: 600 },
    { name: 'AI 专家', minXP: 1000 },
    { name: 'AI 大神', minXP: 1800 },
    { name: 'AI 宗师', minXP: 3000 }
];

function getLevel(xp) {
    let level = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXP) {
            level = LEVELS[i];
            break;
        }
    }
    return level;
}

// ========== 工具函数 ==========
function getToday() {
    return new Date().toISOString().split('T')[0];
}

function isToday(dateStr) {
    return dateStr === getToday();
}

function isYesterday(dateStr) {
    if (!dateStr) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateStr === yesterday.toISOString().split('T')[0];
}

// ========== 每日资讯缓存处理 ==========
let freshNewsData = null;
let newsRefreshPromise = null;
const NEWS_RETENTION_DAYS = 30;
const NEWS_TAG_ORDER = ['all', '政策监管', '应用落地', '重要产品发布', '行业格局', '行业格局变动', '大额融资/IPO', '技术突破', '研究/报告'];
const newsMeta = {
    latestDate: '',
    remoteUpdatedAt: '',
    lastCheckedAt: '',
    refreshMessage: '等待检查更新'
};
const newsUIState = {
    filterTag: 'all',
    collapsedDays: {}
};

function getNewsData() {
    if (freshNewsData) return freshNewsData;
    return (typeof AI_NEWS_DATA !== 'undefined') ? AI_NEWS_DATA : [];
}

function parseNewsDataFile(text) {
    const match = text.match(/const\s+AI_NEWS_DATA\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
    if (!match) return null;
    return JSON.parse(match[1]);
}

function formatNewsMetaTime(value) {
    if (!value) return '未知';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '未知';
    return date.toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getNewsAvailableTags(newsData) {
    const tags = new Set();
    newsData.forEach(day => {
        day.items.forEach(item => tags.add(item.tag));
    });

    return ['all'].concat(
        Array.from(tags).sort((a, b) => {
            const ai = NEWS_TAG_ORDER.indexOf(a);
            const bi = NEWS_TAG_ORDER.indexOf(b);
            if (ai === -1 && bi === -1) return a.localeCompare(b, 'zh-CN');
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
        })
    );
}

function getFilteredNewsData(newsData) {
    if (newsUIState.filterTag === 'all') return newsData;
    return newsData
        .map(day => ({
            date: day.date,
            items: day.items.filter(item => item.tag === newsUIState.filterTag)
        }))
        .filter(day => day.items.length > 0);
}

function isNewsPageVisible() {
    const page = document.getElementById('daily-news');
    return !!(page && page.classList.contains('active'));
}

function isNewsDayCollapsed(day, index) {
    if (Object.prototype.hasOwnProperty.call(newsUIState.collapsedDays, day.date)) {
        return newsUIState.collapsedDays[day.date];
    }
    return index > 1;
}

function setAllNewsDaysCollapsed(days, collapsed) {
    days.forEach(day => {
        newsUIState.collapsedDays[day.date] = collapsed;
    });
}

function refreshNewsData() {
    if (!window.fetch) return Promise.resolve(false);
    if (newsRefreshPromise) return newsRefreshPromise;
    newsMeta.refreshMessage = '正在检查更新';
    if (isNewsPageVisible()) renderNews();

    const checkedAt = new Date().toISOString();

    newsRefreshPromise = fetch('data/news.js?fresh=' + Date.now(), { cache: 'no-store' })
        .then(response => {
            if (!response.ok) throw new Error('news data fetch failed');
            const lastModified = response.headers.get('last-modified') || '';
            return response.text().then(text => ({ text, lastModified }));
        })
        .then(({ text, lastModified }) => {
            const data = parseNewsDataFile(text);
            if (!Array.isArray(data) || data.length === 0) return false;

            const currentLatest = getNewsData()[0]?.date || '';
            freshNewsData = data;
            newsMeta.latestDate = data[0]?.date || '';
            newsMeta.remoteUpdatedAt = lastModified ? new Date(lastModified).toISOString() : newsMeta.remoteUpdatedAt;
            newsMeta.lastCheckedAt = checkedAt;
            newsMeta.refreshMessage = data[0]?.date !== currentLatest ? '已发现并载入最新资讯' : '已是最新数据';
            if (isNewsPageVisible() || data[0]?.date !== currentLatest) {
                renderNews();
            }
            return data[0]?.date !== currentLatest;
        })
        .catch(() => {
            newsMeta.lastCheckedAt = checkedAt;
            newsMeta.refreshMessage = '更新检查失败';
            if (isNewsPageVisible()) renderNews();
            return false;
        })
        .finally(() => {
            newsRefreshPromise = null;
        });

    return newsRefreshPromise;
}

// ========== 知识树组装 ==========
const KNOWLEDGE_TREE = [
    DATA_FUNDAMENTALS,
    DATA_LLM,
    DATA_APPLICATIONS,
    DATA_BUSINESS,
    DATA_TOOLS,
    DATA_FRONTIER
];

// 获取所有叶子节点
function getAllLeaves(nodes) {
    const leaves = [];
    function traverse(nodeList) {
        for (const node of nodeList) {
            if (!node.children || node.children.length === 0) {
                leaves.push(node);
            } else {
                traverse(node.children);
            }
        }
    }
    traverse(nodes || KNOWLEDGE_TREE);
    return leaves;
}

// 根据 ID 找到节点
function findNodeById(id, nodes) {
    for (const node of (nodes || KNOWLEDGE_TREE)) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(id, node.children);
            if (found) return found;
        }
    }
    return null;
}

// 找到节点所属的大类名称
function findCategory(nodeId) {
    for (const cat of KNOWLEDGE_TREE) {
        if (containsNode(cat, nodeId)) return cat.name;
    }
    return '';
}

function containsNode(node, targetId) {
    if (node.id === targetId) return true;
    if (node.children) {
        return node.children.some(child => containsNode(child, targetId));
    }
    return false;
}

// ========== 每日任务生成 ==========
function generateDailyTasks() {
    const today = getToday();

    // 如果今天已经有任务了，直接返回
    if (checkinData.todayTasks.length > 0 && checkinData.lastTaskDate === today) {
        return checkinData.todayTasks;
    }

    const allLeaves = getAllLeaves();

    // 优先选择：未学 > 在学 > 已掌握但很久没复习
    const notStarted = allLeaves.filter(n => getNodeStatus(n.id) === 'not-started');
    const learning = allLeaves.filter(n => getNodeStatus(n.id) === 'learning');
    const mastered = allLeaves.filter(n => getNodeStatus(n.id) === 'mastered');

    let pool = [];

    // 策略：2个未学/在学 + 1个复习（如果有的话）
    const newPool = [...shuffle(notStarted), ...shuffle(learning)];
    const reviewPool = shuffle(mastered);

    if (newPool.length >= 2) {
        pool = [newPool[0], newPool[1]];
        if (reviewPool.length > 0) {
            pool.push(reviewPool[0]);
        } else if (newPool.length >= 3) {
            pool.push(newPool[2]);
        }
    } else if (newPool.length === 1) {
        pool = [newPool[0]];
        pool.push(...reviewPool.slice(0, 2));
    } else {
        pool = reviewPool.slice(0, 3);
    }

    // 确保至少有内容
    if (pool.length === 0) {
        pool = shuffle(allLeaves).slice(0, 3);
    }

    const tasks = pool.map(n => n.id);
    checkinData.todayTasks = tasks;
    checkinData.todayCompleted = [];
    checkinData.extraGroups = [];
    checkinData.lastTaskDate = today;
    saveCheckinData(checkinData);

    return tasks;
}

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// ========== Tab 切换 ==========
document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const targetId = tab.dataset.tab;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        if (targetId === 'daily-news') {
            refreshNewsData();
        }
    });
});

// ========== 知识树渲染 ==========
function getNodeStatus(nodeId) {
    return userData[nodeId]?.status || 'not-started';
}

function getNodeNote(nodeId) {
    return userData[nodeId]?.note || '';
}

function computeGroupStatus(node) {
    if (!node.children || node.children.length === 0) {
        return getNodeStatus(node.id);
    }
    const statuses = node.children.map(child => computeGroupStatus(child));
    if (statuses.every(s => s === 'mastered')) return 'mastered';
    if (statuses.every(s => s === 'not-started')) return 'not-started';
    return 'partial';
}

function countLeaves(node) {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
}

function countMastered(node) {
    if (!node.children || node.children.length === 0) {
        return getNodeStatus(node.id) === 'mastered' ? 1 : 0;
    }
    return node.children.reduce((sum, child) => sum + countMastered(child), 0);
}

function countLearning(node) {
    if (!node.children || node.children.length === 0) {
        return getNodeStatus(node.id) === 'learning' ? 1 : 0;
    }
    return node.children.reduce((sum, child) => sum + countLearning(child), 0);
}

function renderTree(nodes, container) {
    container.innerHTML = '';

    const totalLeaves = nodes.reduce((sum, n) => sum + countLeaves(n), 0);
    const totalMastered = nodes.reduce((sum, n) => sum + countMastered(n), 0);
    const totalLearning = nodes.reduce((sum, n) => sum + countLearning(n), 0);

    const statsHtml = `
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-number">${totalLeaves}</div>
                <div class="stat-label">知识点</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalLearning}</div>
                <div class="stat-label">学习中</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalMastered}</div>
                <div class="stat-label">已掌握</div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', statsHtml);

    const progress = totalLeaves > 0 ? Math.round((totalMastered / totalLeaves) * 100) : 0;
    document.getElementById('overall-progress').style.width = progress + '%';
    document.getElementById('progress-text').textContent = progress + '%';

    nodes.forEach(node => {
        container.appendChild(createNodeElement(node, 0));
    });
}

function createNodeElement(node, depth) {
    const div = document.createElement('div');
    div.className = 'tree-node';

    const hasChildren = node.children && node.children.length > 0;
    const isLeaf = !hasChildren;
    const status = isLeaf ? getNodeStatus(node.id) : computeGroupStatus(node);

    const header = document.createElement('div');
    header.className = 'node-header';

    const toggle = document.createElement('div');
    toggle.className = `node-toggle ${isLeaf ? 'leaf' : ''}`;
    toggle.textContent = '▶';

    const statusDot = document.createElement('div');
    statusDot.className = `node-status ${status}`;

    const name = document.createElement('div');
    name.className = 'node-name';
    name.innerHTML = node.name + (node.fullName && isLeaf ? `<span class="node-fullname">${node.fullName}</span>` : '');

    const badge = document.createElement('div');
    badge.className = 'node-badge';
    if (isLeaf) {
        const statusText = { 'not-started': '未学', 'learning': '在学', 'mastered': '已掌握' };
        badge.textContent = statusText[status];
    } else {
        const mastered = countMastered(node);
        const total = countLeaves(node);
        badge.textContent = `${mastered}/${total}`;
    }

    header.appendChild(toggle);
    header.appendChild(statusDot);
    header.appendChild(name);
    header.appendChild(badge);
    div.appendChild(header);

    if (hasChildren) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'node-children';
        node.children.forEach(child => {
            childrenContainer.appendChild(createNodeElement(child, depth + 1));
        });
        div.appendChild(childrenContainer);

        header.addEventListener('click', () => {
            childrenContainer.classList.toggle('expanded');
            toggle.classList.toggle('expanded');
        });
    } else {
        // 叶子节点：点击打开学习卡片
        header.addEventListener('click', () => {
            openLearnModal(node);
        });
    }

    return div;
}

// ========== 学习卡片弹窗 ==========
let currentNode = null;
let openedFromDaily = false;

function openLearnModal(node) {
    currentNode = node;
    const modal = document.getElementById('learn-modal');
    modal.classList.add('active');

    document.getElementById('learn-title').textContent = node.name;
    // 显示英文全称
    const fullNameEl = document.getElementById('learn-fullname');
    if (node.fullName) {
        fullNameEl.textContent = node.fullName;
        fullNameEl.style.display = 'block';
    } else {
        fullNameEl.style.display = 'none';
    }

    // 填充学习内容
    if (node.content) {
        document.getElementById('learn-what').textContent = node.content.what;
        document.getElementById('learn-why').textContent = node.content.why;
        document.getElementById('learn-remember').textContent = node.content.remember;
        document.getElementById('learn-example').textContent = node.content.example;
        document.getElementById('learn-card').style.display = 'flex';
    } else {
        document.getElementById('learn-card').style.display = 'none';
    }

    // 设置状态
    const status = getNodeStatus(node.id);
    document.querySelectorAll('#learn-modal .status-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === status);
    });

    // 设置笔记
    const note = getNodeNote(node.id);
    document.getElementById('note-input').value = note;

    // 隐藏笔记区域
    const noteArea = document.getElementById('note-area');
    if (note) {
        noteArea.classList.remove('hidden');
    } else {
        noteArea.classList.add('hidden');
    }
}

function closeLearnModal() {
    // 如果是今日任务且还未完成且未被保存按钮处理过，阅读后自动标记并计完成
    if (currentNode && !currentNode._saved && checkinData.todayTasks.includes(currentNode.id) && !checkinData.todayCompleted.includes(currentNode.id)) {
        const status = getNodeStatus(currentNode.id);
        if (status === 'not-started') {
            userData[currentNode.id] = { ...userData[currentNode.id], status: 'learning' };
            saveUserData(userData);
        }
        checkinData.todayCompleted.push(currentNode.id);
        saveCheckinData(checkinData);
        checkExtraGroupReward();
        renderTree(KNOWLEDGE_TREE, document.getElementById('tree-container'));
        if (typeof renderRecommendations === 'function') renderRecommendations();
        updateCheckinBanner();
    }
    document.getElementById('learn-modal').classList.remove('active');
    currentNode = null;
    // 如果是从每日弹窗来的，返回每日弹窗
    if (openedFromDaily) {
        openedFromDaily = false;
        setTimeout(() => {
            openDailyModal();
        }, 300);
    }
}

// 关闭学习弹窗
document.getElementById('learn-close').addEventListener('click', closeLearnModal);
document.getElementById('learn-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLearnModal();
});

// 笔记展开/收起
document.getElementById('note-toggle').addEventListener('click', () => {
    document.getElementById('note-area').classList.toggle('hidden');
});

// 状态按钮
document.querySelectorAll('#learn-modal .status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#learn-modal .status-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// 保存
document.getElementById('btn-save').addEventListener('click', () => {
    if (!currentNode) return;

    const activeBtn = document.querySelector('#learn-modal .status-btn.active');
    const status = activeBtn ? activeBtn.dataset.status : 'not-started';
    const note = document.getElementById('note-input').value;

    userData[currentNode.id] = { status, note };
    saveUserData(userData);

    // 检查是否是今日任务
    if (checkinData.todayTasks.includes(currentNode.id) && !checkinData.todayCompleted.includes(currentNode.id)) {
        if (status === 'learning' || status === 'mastered') {
            checkinData.todayCompleted.push(currentNode.id);
            saveCheckinData(checkinData);
            // 检查额外组是否完成
            checkExtraGroupReward();
        }
    }

    renderTree(KNOWLEDGE_TREE, document.getElementById('tree-container'));
    if (typeof renderRecommendations === 'function') renderRecommendations();
    updateCheckinBanner();
    // 标记已手动保存，closeLearnModal不再重复处理
    currentNode._saved = true;
    closeLearnModal();
});

// ========== 每日打卡系统 ==========
function updateCheckinBanner() {
    // 检查连续打卡状态
    checkStreak();

    const streakEl = document.getElementById('streak-count');
    const xpEl = document.getElementById('xp-count');
    const levelEl = document.getElementById('level-badge');
    const btnSub = document.getElementById('checkin-btn-sub');
    const btn = document.getElementById('checkin-btn');

    streakEl.textContent = checkinData.streak;
    xpEl.textContent = checkinData.xp;
    levelEl.textContent = getLevel(checkinData.xp).name;

    // 今天是否已打卡
    if (isToday(checkinData.lastCheckin)) {
        btn.classList.add('done');
        btn.querySelector('.checkin-btn-text').textContent = '已打卡 ✓';
        btnSub.textContent = '明天再来';
    } else {
        btn.classList.remove('done');
        btn.querySelector('.checkin-btn-text').textContent = '今日学习';
        const tasks = generateDailyTasks();
        const remaining = tasks.length - (checkinData.todayCompleted || []).length;
        btnSub.textContent = remaining > 0 ? `${remaining}个知识点等你` : '可以打卡了！';
    }
}

function checkStreak() {
    const lastCheckin = checkinData.lastCheckin;
    if (!lastCheckin) return;

    // 如果上次打卡不是今天也不是昨天，连续断了
    if (!isToday(lastCheckin) && !isYesterday(lastCheckin)) {
        checkinData.streak = 0;
        saveCheckinData(checkinData);
    }
}

// 点击打卡按钮 -> 打开每日学习弹窗
document.getElementById('checkin-btn').addEventListener('click', () => {
    if (isToday(checkinData.lastCheckin)) {
        // 已打卡，显示今日完成情况
        openDailyModal();
        return;
    }
    openDailyModal();
});

function openDailyModal() {
    const modal = document.getElementById('daily-modal');
    modal.classList.add('active');
    renderDailyCards();
}

function closeDailyModal() {
    document.getElementById('daily-modal').classList.remove('active');
}

document.getElementById('daily-close').addEventListener('click', closeDailyModal);
document.getElementById('daily-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDailyModal();
});

function renderDailyCards() {
    const tasks = generateDailyTasks();
    const completed = checkinData.todayCompleted || [];
    const container = document.getElementById('daily-cards');
    container.innerHTML = '';

    tasks.forEach(taskId => {
        const node = findNodeById(taskId);
        if (!node) return;

        const isCompleted = completed.includes(taskId);
        const category = findCategory(taskId);

        const card = document.createElement('div');
        card.className = `daily-card ${isCompleted ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="daily-card-header">
                <div class="daily-card-name">${node.name}</div>
                <div class="daily-card-check">${isCompleted ? '✓' : ''}</div>
            </div>
            ${node.fullName ? `<div class="daily-card-fullname">${node.fullName}</div>` : ''}
            <div class="daily-card-desc">${node.desc || ''}</div>
            <div class="daily-card-category">${category}</div>
        `;

        // 点击卡片跳转到学习
        card.addEventListener('click', () => {
            closeDailyModal();
            openedFromDaily = true;
            setTimeout(() => openLearnModal(node), 300);
        });

        container.appendChild(card);
    });

    // 更新进度
    const progressFill = document.getElementById('daily-progress-fill');
    const progressLabel = document.getElementById('daily-progress-label');
    const total = tasks.length;
    const done = completed.filter(id => tasks.includes(id)).length;
    progressFill.style.width = total > 0 ? (done / total * 100) + '%' : '0%';
    progressLabel.textContent = `完成 ${done}/${total}`;

    // 更新打卡按钮
    const btnCheckin = document.getElementById('btn-checkin');
    const btnContinue = document.getElementById('btn-continue');
    const alreadyChecked = isToday(checkinData.lastCheckin);
    if (alreadyChecked) {
        btnCheckin.textContent = '今日已打卡 ✓';
        btnCheckin.disabled = true;
        btnCheckin.classList.remove('ready');
        btnContinue.style.display = 'block';
    } else if (done >= total && total > 0) {
        btnCheckin.textContent = '完成打卡';
        btnCheckin.disabled = false;
        btnCheckin.classList.add('ready');
        btnContinue.style.display = 'none';
    } else {
        btnCheckin.textContent = `还需学习 ${total - done} 个知识点`;
        btnCheckin.disabled = true;
        btnCheckin.classList.remove('ready');
        btnContinue.style.display = 'none';
    }
}

// 打卡按钮
document.getElementById('btn-checkin').addEventListener('click', () => {
    if (isToday(checkinData.lastCheckin)) return;

    const tasks = checkinData.todayTasks;
    const completed = checkinData.todayCompleted || [];
    const done = completed.filter(id => tasks.includes(id)).length;

    if (done < tasks.length) return;

    // 执行打卡
    doCheckin();
});

// 继续学习按钮
document.getElementById('btn-continue').addEventListener('click', () => {
    loadNextGroup();
});

function loadNextGroup() {
    const allLeaves = getAllLeaves();
    const alreadyLearned = new Set([...(checkinData.todayTasks || []), ...(checkinData.todayCompleted || [])]);

    // 选3个还没在今天学过的
    const notStarted = allLeaves.filter(n => !alreadyLearned.has(n.id) && getNodeStatus(n.id) === 'not-started');
    const learning = allLeaves.filter(n => !alreadyLearned.has(n.id) && getNodeStatus(n.id) === 'learning');
    const pool = [...shuffle(notStarted), ...shuffle(learning)];

    let newTasks;
    if (pool.length >= 3) {
        newTasks = pool.slice(0, 3).map(n => n.id);
    } else if (pool.length > 0) {
        newTasks = pool.map(n => n.id);
    } else {
        // 全学完了就随机选复习
        const mastered = allLeaves.filter(n => !alreadyLearned.has(n.id));
        newTasks = shuffle(mastered).slice(0, 3).map(n => n.id);
    }

    // 记录这是第几组额外学习
    if (!checkinData.extraGroups) checkinData.extraGroups = [];
    checkinData.extraGroups.push({ tasks: newTasks, completed: false });

    // 追加到今日任务
    checkinData.todayTasks = [...checkinData.todayTasks, ...newTasks];
    saveCheckinData(checkinData);
    renderDailyCards();
}

// 额外组完成后领取折半奖励
function checkExtraGroupReward() {
    if (!checkinData.extraGroups) return;
    const completed = checkinData.todayCompleted || [];

    checkinData.extraGroups.forEach(group => {
        if (group.completed) return;
        const allDone = group.tasks.every(id => completed.includes(id));
        if (allDone) {
            group.completed = true;
            const bonusXP = 15; // 打卡基础奥30的一半
            checkinData.xp += bonusXP;
            checkinData.history.push({ date: getToday(), xp: bonusXP, type: 'extra' });
            saveCheckinData(checkinData);
            updateCheckinBanner();
            showExtraRewardToast(bonusXP);
        }
    });
}

function showExtraRewardToast(xp) {
    // 轻量级toast提示
    const toast = document.createElement('div');
    toast.className = 'xp-toast';
    toast.innerHTML = `<span>+${xp} XP 额外学习奖励！</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function doCheckin() {
    const today = getToday();

    // 计算连续天数
    if (isYesterday(checkinData.lastCheckin) || !checkinData.lastCheckin) {
        checkinData.streak += 1;
    } else if (!isToday(checkinData.lastCheckin)) {
        checkinData.streak = 1;
    }

    // 计算 XP（基础 30 + 连续加成）
    const baseXP = 30;
    const streakBonus = Math.min(checkinData.streak * 5, 50); // 最多 +50
    const totalXP = baseXP + streakBonus;
    checkinData.xp += totalXP;

    checkinData.lastCheckin = today;
    checkinData.history.push({ date: today, xp: totalXP });
    saveCheckinData(checkinData);

    // 关闭每日弹窗，显示成功
    closeDailyModal();
    setTimeout(() => showSuccessModal(totalXP, streakBonus), 400);
}

function showSuccessModal(totalXP, streakBonus) {
    const modal = document.getElementById('success-modal');
    modal.classList.add('active');

    const level = getLevel(checkinData.xp);
    const detail = document.getElementById('success-detail');
    detail.innerHTML = `
        <div class="xp-gain">+${totalXP} XP</div>
        <div>基础奖励 30 XP${streakBonus > 0 ? ` + 连续打卡加成 ${streakBonus} XP` : ''}</div>
        <br>
        <div class="streak-info">连续打卡 ${checkinData.streak} 天</div>
        <div>当前等级：${level.name}</div>
    `;

    updateCheckinBanner();
}

document.getElementById('success-close').addEventListener('click', () => {
    document.getElementById('success-modal').classList.remove('active');
});
document.getElementById('success-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        document.getElementById('success-modal').classList.remove('active');
    }
});

// ========== 术语搜索（内嵌在知识地图页） ==========
function renderGlossary(filterText) {
    const container = document.getElementById('glossary-list');
    const resultsPanel = document.getElementById('glossary-results');
    const countEl = document.getElementById('glossary-results-count');
    if (!container || !resultsPanel) return;

    if (!filterText) {
        resultsPanel.classList.add('hidden');
        return;
    }

    const lower = filterText.toLowerCase();
    const items = GLOSSARY.filter(item =>
        item.term.toLowerCase().includes(lower) ||
        item.fullName.toLowerCase().includes(lower) ||
        item.desc.toLowerCase().includes(lower)
    );

    resultsPanel.classList.remove('hidden');
    container.innerHTML = '';

    if (items.length === 0) {
        countEl.textContent = '未找到匹配术语';
        container.innerHTML = '<div class="glossary-empty">换个关键词试试</div>';
        return;
    }

    countEl.textContent = `找到 ${items.length} 个术语`;

    // 按分类分组
    const grouped = {};
    items.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    });

    Object.keys(grouped).forEach(category => {
        const section = document.createElement('div');
        section.className = 'glossary-section';
        section.innerHTML = `<div class="glossary-category">${category}</div>`;

        grouped[category].forEach(item => {
            const card = document.createElement('div');
            card.className = 'glossary-item';
            card.innerHTML = `
                <div class="glossary-term">${item.term}</div>
                <div class="glossary-fullname">${item.fullName}</div>
                <div class="glossary-desc">${item.desc}</div>
            `;
            card.addEventListener('click', () => {
                const node = findNodeById(item.id);
                if (node) openLearnModal(node);
            });
            section.appendChild(card);
        });

        container.appendChild(section);
    });
}

// 搜索输入监听
const glossarySearchInput = document.getElementById('glossary-search');
if (glossarySearchInput) {
    glossarySearchInput.addEventListener('input', (e) => {
        renderGlossary(e.target.value.trim());
    });
}

// 关闭搜索结果
const glossaryCloseBtn = document.getElementById('glossary-results-close');
if (glossaryCloseBtn) {
    glossaryCloseBtn.addEventListener('click', () => {
        document.getElementById('glossary-results').classList.add('hidden');
        document.getElementById('glossary-search').value = '';
    });
}

// ========== 每日资讯（数据来自 data/news.js） ==========
function renderNews() {
    const container = document.getElementById('news-list');
    if (!container) return;
    container.innerHTML = '';

    const newsData = getNewsData();
    const filteredNewsData = getFilteredNewsData(newsData);
    const availableTags = getNewsAvailableTags(newsData);
    const hasCollapsedDays = filteredNewsData.some((day, index) => isNewsDayCollapsed(day, index));

    if (!newsMeta.latestDate && newsData[0]?.date) {
        newsMeta.latestDate = newsData[0].date;
    }

    const statusCard = document.createElement('div');
    statusCard.className = 'news-status-card';
    statusCard.innerHTML = `
        <div class="news-status-main">
            <div>
                <div class="news-status-label">最新日期</div>
                <div class="news-status-value">${newsMeta.latestDate || '暂无数据'}</div>
            </div>
            <div>
                <div class="news-status-label">数据更新时间</div>
                <div class="news-status-sub">${formatNewsMetaTime(newsMeta.remoteUpdatedAt)}</div>
            </div>
            <div>
                <div class="news-status-label">上次检查</div>
                <div class="news-status-sub">${formatNewsMetaTime(newsMeta.lastCheckedAt)}</div>
            </div>
            <div>
                <div class="news-status-label">归档窗口</div>
                <div class="news-status-sub">${newsData.length}/${NEWS_RETENTION_DAYS} 天</div>
            </div>
        </div>
        <div class="news-status-actions">
            <button class="news-action-btn" id="news-refresh-btn" ${newsRefreshPromise ? 'disabled' : ''}>
                ${newsRefreshPromise ? '检查中...' : '检查更新'}
            </button>
            <button class="news-action-btn secondary" id="news-collapse-btn" ${filteredNewsData.length === 0 ? 'disabled' : ''}>
                ${hasCollapsedDays ? '展开全部' : '折叠旧闻'}
            </button>
        </div>
        <div class="news-status-note">${newsMeta.refreshMessage}</div>
    `;
    container.appendChild(statusCard);

    if (newsUIState.filterTag !== 'all' || availableTags.length > 2) {
        const filterBar = document.createElement('div');
        filterBar.className = 'news-filter-bar';
        filterBar.innerHTML = availableTags.map(tag => `
            <button class="news-filter-chip ${newsUIState.filterTag === tag ? 'active' : ''}" data-tag="${tag}">
                ${tag === 'all' ? '全部' : tag}
            </button>
        `).join('');
        container.appendChild(filterBar);
    }

    if (newsData.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'news-empty';
        emptyState.textContent = '暂无资讯数据';
        container.appendChild(emptyState);
        return;
    }

    const digestCard = buildWeeklyDigestCard(newsData);
    if (newsUIState.filterTag === 'all' && digestCard) {
        container.appendChild(digestCard);
    }

    if (filteredNewsData.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'news-empty';
        emptyState.textContent = '当前标签下暂无资讯';
        container.appendChild(emptyState);
    }

    filteredNewsData.forEach((day, index) => {
        const daySection = document.createElement('div');
        daySection.className = 'news-day';
        const collapsed = isNewsDayCollapsed(day, index);

        const dateLabel = document.createElement('button');
        dateLabel.type = 'button';
        dateLabel.className = 'news-date';
        const isToday_ = day.date === getToday();
        const dayOfWeek = ['日','一','二','三','四','五','六'][new Date(day.date).getDay()];
        dateLabel.innerHTML = `
            <span class="news-date-left">
                ${isToday_
                    ? `<span class="news-date-today">今日资讯</span> <span class="news-date-sub">${day.date} 周${dayOfWeek}</span>`
                    : `<span>${day.date} 周${dayOfWeek}</span>`}
            </span>
            <span class="news-date-right">
                <span class="news-count-inline">${day.items.length} 条</span>
                <span class="news-day-arrow ${collapsed ? '' : 'expanded'}">›</span>
            </span>
        `;
        daySection.appendChild(dateLabel);
        dateLabel.addEventListener('click', () => {
            newsUIState.collapsedDays[day.date] = !collapsed;
            renderNews();
        });

        const dayBody = document.createElement('div');
        dayBody.className = 'news-day-body' + (collapsed ? ' collapsed' : '');

        day.items.forEach((news, index) => {
            const card = document.createElement('div');
            card.className = 'news-card';

            const hasUrl = news.url && news.url.length > 0;
            const sourceLink = hasUrl
                ? `<a class="news-source-link" href="${news.url}" target="_blank">查看原文 →</a>`
                : '';

            card.innerHTML = `
                <div class="news-card-header">
                    <span class="news-rank">${index + 1}</span>
                    <span class="news-tag">${news.tag}</span>
                    <span class="news-title">${news.title}</span>
                    <span class="news-expand-icon">›</span>
                </div>
                <div class="news-detail">
                    <div class="news-summary">${news.summary}</div>
                    <div class="news-footer">
                        <span class="news-source-text">${news.source}</span>
                        ${sourceLink}
                    </div>
                </div>
            `;

            // 点击展开/收起
            card.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') return;
                card.classList.toggle('expanded');
            });

            dayBody.appendChild(card);
        });

        daySection.appendChild(dayBody);
        container.appendChild(daySection);
    });

    const refreshBtn = document.getElementById('news-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await refreshNewsData();
        });
    }

    const collapseBtn = document.getElementById('news-collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            setAllNewsDaysCollapsed(filteredNewsData, !hasCollapsedDays);
            renderNews();
        });
    }

    container.querySelectorAll('.news-filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            newsUIState.filterTag = btn.dataset.tag;
            renderNews();
        });
    });
}

// ========== 商业案例库 ==========
function renderCases() {
    const container = document.getElementById('cases-list');
    const filterContainer = document.getElementById('cases-filter');
    if (!container) return;

    const casesData = (typeof AI_CASES_DATA !== 'undefined') ? AI_CASES_DATA : [];
    if (casesData.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无案例数据</div>';
        return;
    }

    // 分类筛选
    const categories = [...new Set(casesData.map(c => c.category))];
    filterContainer.innerHTML = `
        <button class="filter-btn active" data-filter="all">全部</button>
        ${categories.map(cat => `<button class="filter-btn" data-filter="${cat}">${cat}</button>`).join('')}
    `;

    filterContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-btn')) return;
        filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const filter = e.target.dataset.filter;
        renderCaseCards(filter === 'all' ? casesData : casesData.filter(c => c.category === filter));
    });

    renderCaseCards(casesData);

    function renderCaseCards(data) {
        container.innerHTML = data.map(c => `
            <div class="case-card" data-id="${c.id}">
                <div class="case-cover">${c.cover}</div>
                <div class="case-body">
                    <div class="case-category">${c.category}</div>
                    <div class="case-title">${c.title}</div>
                    <div class="case-metrics">${c.keyMetrics}</div>
                    <div class="case-tags">${c.tags.map(t => `<span class="case-tag">${t}</span>`).join('')}</div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('click', () => showCaseDetail(card.dataset.id));
        });
    }
}

function showCaseDetail(id) {
    const casesData = (typeof AI_CASES_DATA !== 'undefined') ? AI_CASES_DATA : [];
    const c = casesData.find(item => item.id === id);
    if (!c) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal case-detail-modal">
            <div class="modal-header">
                <h3>${c.cover} ${c.company}</h3>
                <button class="modal-close case-detail-close">✕</button>
            </div>
            <div class="modal-body case-detail-body">
                <h4 class="case-detail-title">${c.title}</h4>
                <div class="case-detail-meta">
                    <span>${c.stage}</span>
                    <span>创立 ${c.founded}</span>
                    <span>${c.valuation}</span>
                </div>
                <div class="case-detail-section">
                    <div class="case-detail-label">概述</div>
                    <p>${c.summary}</p>
                </div>
                <div class="case-detail-section">
                    <div class="case-detail-label">商业模式</div>
                    <p>${c.businessModel}</p>
                </div>
                <div class="case-detail-section">
                    <div class="case-detail-label">为什么成功</div>
                    <p>${c.whyItWorks}</p>
                </div>
                <div class="case-detail-section">
                    <div class="case-detail-label">经验教训</div>
                    <p>${c.lessonsLearned}</p>
                </div>
                <div class="case-detail-section">
                    <div class="case-detail-label">发展时间线</div>
                    <div class="case-timeline">
                        ${c.timeline.map(t => `
                            <div class="timeline-item">
                                <div class="timeline-date">${t.date}</div>
                                <div class="timeline-event">${t.event}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('.case-detail-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ========== 应用实验室 ==========
function renderLab() {
    const container = document.getElementById('lab-list');
    if (!container) return;

    const labData = (typeof AI_LAB_DATA !== 'undefined') ? AI_LAB_DATA : [];
    if (labData.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无实验数据</div>';
        return;
    }

    container.innerHTML = labData.map(lab => `
        <div class="lab-card" data-id="${lab.id}">
            <div class="lab-icon">${lab.icon}</div>
            <div class="lab-body">
                <div class="lab-header-row">
                    <span class="lab-category">${lab.category}</span>
                    <span class="lab-difficulty ${lab.difficulty === '入门' ? 'easy' : 'medium'}">${lab.difficulty}</span>
                </div>
                <div class="lab-title">${lab.title}</div>
                <div class="lab-desc">${lab.description}</div>
                <div class="lab-footer">
                    <span class="lab-duration">${lab.duration}</span>
                    <span class="lab-exercises">${lab.exercises.length} 个练习</span>
                </div>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.lab-card').forEach(card => {
        card.addEventListener('click', () => showLabDetail(card.dataset.id));
    });
}

function showLabDetail(id) {
    const labData = (typeof AI_LAB_DATA !== 'undefined') ? AI_LAB_DATA : [];
    const lab = labData.find(item => item.id === id);
    if (!lab) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal lab-detail-modal">
            <div class="modal-header">
                <h3>${lab.icon} ${lab.title}</h3>
                <button class="modal-close lab-detail-close">✕</button>
            </div>
            <div class="modal-body lab-detail-body">
                <div class="lab-detail-meta">
                    <span class="lab-difficulty ${lab.difficulty === '入门' ? 'easy' : 'medium'}">${lab.difficulty}</span>
                    <span>${lab.duration}</span>
                    <span>${lab.exercises.length} 个练习</span>
                </div>
                <div class="lab-detail-section">
                    <div class="lab-detail-label">你将学到</div>
                    <ul class="lab-learn-list">
                        ${lab.whatYouLearn.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="lab-detail-section">
                    <div class="lab-detail-label">动手练习</div>
                    ${lab.exercises.map((ex, i) => `
                        <div class="lab-exercise">
                            <div class="lab-exercise-name">练习 ${i + 1}：${ex.name}</div>
                            <div class="lab-exercise-task">${ex.task}</div>
                            <div class="lab-exercise-meta">
                                <span class="lab-exercise-tool">${ex.tool}</span>
                            </div>
                            <div class="lab-exercise-tip">Tips：${ex.tip}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="lab-detail-section">
                    <div class="lab-detail-label">参考资源</div>
                    <div class="lab-resources">
                        ${lab.resources.map(r => `<a class="lab-resource-link" href="${r.url}" target="_blank">${r.name} →</a>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('.lab-detail-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ========== 创业 Idea 池 ==========
function renderIdeas() {
    const container = document.getElementById('ideas-list');
    if (!container) return;

    const ideasData = (typeof AI_IDEAS_DATA !== 'undefined') ? AI_IDEAS_DATA : [];
    if (ideasData.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无 Idea 数据</div>';
        return;
    }

    container.innerHTML = ideasData.map(idea => `
        <div class="idea-card" data-id="${idea.id}">
            <div class="idea-icon">${idea.icon}</div>
            <div class="idea-body">
                <div class="idea-header-row">
                    <span class="idea-category">${idea.category}</span>
                    <span class="idea-opportunity opp-${idea.opportunity === '大' ? 'high' : 'medium'}">机会：${idea.opportunity}</span>
                </div>
                <div class="idea-title">${idea.title}</div>
                <div class="idea-summary">${idea.summary}</div>
                <div class="idea-footer">
                    <span class="idea-investment">${idea.investment}</span>
                    <span class="idea-difficulty">难度：${idea.difficulty}</span>
                </div>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.idea-card').forEach(card => {
        card.addEventListener('click', () => showIdeaDetail(card.dataset.id));
    });
}

function showIdeaDetail(id) {
    const ideasData = (typeof AI_IDEAS_DATA !== 'undefined') ? AI_IDEAS_DATA : [];
    const idea = ideasData.find(item => item.id === id);
    if (!idea) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal idea-detail-modal">
            <div class="modal-header">
                <h3>${idea.icon} ${idea.title}</h3>
                <button class="modal-close idea-detail-close">✕</button>
            </div>
            <div class="modal-body idea-detail-body">
                <div class="idea-detail-meta">
                    <span class="idea-opportunity opp-${idea.opportunity === '大' ? 'high' : 'medium'}">机会：${idea.opportunity}</span>
                    <span>难度：${idea.difficulty}</span>
                    <span>${idea.investment}</span>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">市场规模</div>
                    <p>${idea.marketSize}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">痛点</div>
                    <p>${idea.painPoint}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">解决方案</div>
                    <p>${idea.solution}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">竞争壁垒</div>
                    <p>${idea.moat}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">竞争对手</div>
                    <p>${idea.competitors}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">下一步行动</div>
                    <ol class="idea-steps">
                        ${idea.nextSteps.map(s => `<li>${s}</li>`).join('')}
                    </ol>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">灵感来源</div>
                    <p class="idea-inspiration">${idea.inspiration}</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('.idea-detail-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ========== 初始化 ==========
generateDailyTasks();
updateCheckinBanner();
renderTree(KNOWLEDGE_TREE, document.getElementById('tree-container'));
renderNews();
refreshNewsData();
renderCases();
renderLab();
renderIdeas();

// ========== Feature 1: 数据导出/导入 + 云同步 ==========
function openSettingsModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';

    const syncPanelHTML = (typeof SyncModule !== 'undefined') ? SyncModule.renderSyncPanel() : '';

    overlay.innerHTML = `
        <div class="modal" style="max-width:400px;">
            <div class="modal-header">
                <h3>设置</h3>
                <button class="modal-close settings-close">✕</button>
            </div>
            <div class="modal-body" style="padding:20px;">
                <!-- Cloud Sync Section -->
                <div style="margin-bottom:20px;">
                    <div style="font-size:10px;font-weight:600;color:var(--gray-400,#a3a3a0);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">云同步</div>
                    <div id="sync-panel-container">${syncPanelHTML}</div>
                </div>

                <div style="height:1px;background:var(--gray-100,#efefee);margin:16px 0;"></div>

                <!-- Local Data Section -->
                <div>
                    <div style="font-size:10px;font-weight:600;color:var(--gray-400,#a3a3a0);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">本地数据</div>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <button id="btn-export-data" style="padding:12px 16px;border:1px solid var(--gray-200,#e0e0de);background:var(--white,#fafaf9);border-radius:8px;font-size:13px;cursor:pointer;text-align:left;transition:background 0.2s;font-family:var(--font,Inter,sans-serif);">导出数据<br><span style="font-size:11px;color:var(--gray-400,#a3a3a0);">将所有学习进度导出为 JSON 文件</span></button>
                        <button id="btn-import-data" style="padding:12px 16px;border:1px solid var(--gray-200,#e0e0de);background:var(--white,#fafaf9);border-radius:8px;font-size:13px;cursor:pointer;text-align:left;transition:background 0.2s;font-family:var(--font,Inter,sans-serif);">导入数据<br><span style="font-size:11px;color:var(--gray-400,#a3a3a0);">从 JSON 文件恢复数据</span></button>
                        <button id="btn-reset-data" style="padding:12px 16px;border:1px solid rgba(220,38,38,0.3);background:var(--white,#fafaf9);border-radius:8px;font-size:13px;cursor:pointer;text-align:left;color:#dc2626;transition:background 0.2s;font-family:var(--font,Inter,sans-serif);">重置数据<br><span style="font-size:11px;opacity:0.6;">清除所有本地数据（不可恢复）</span></button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Bind sync panel events
    const syncContainer = overlay.querySelector('#sync-panel-container');
    if (syncContainer && typeof SyncModule !== 'undefined') {
        SyncModule.bindSyncEvents(syncContainer);
    }

    overlay.querySelector('.settings-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#btn-export-data').addEventListener('click', () => {
        if (typeof SyncModule !== 'undefined') {
            SyncModule.exportToFile();
        } else {
            // Fallback export
            const exportData = {
                version: 1,
                exportDate: new Date().toISOString(),
                userData: JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'),
                checkinData: JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{}'),
                favorites: JSON.parse(localStorage.getItem('ai-toolkit-favorites') || '{}'),
                ideaValidations: {}
            };
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('ai-toolkit-idea-validation-')) {
                    exportData.ideaValidations[key] = JSON.parse(localStorage.getItem(key));
                }
            }
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-toolkit-backup-${getToday()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    });

    overlay.querySelector('#btn-import-data').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (typeof SyncModule !== 'undefined') {
                const result = await SyncModule.importFromFile(file);
                if (result.success) {
                    alert(result.message);
                    location.reload();
                } else {
                    alert(result.message);
                }
            } else {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        if (!data.version || !data.userData) {
                            alert('文件格式不正确');
                            return;
                        }
                        if (data.userData) localStorage.setItem(STORAGE_KEY, JSON.stringify(data.userData));
                        if (data.checkinData) localStorage.setItem(CHECKIN_KEY, JSON.stringify(data.checkinData));
                        if (data.favorites) localStorage.setItem('ai-toolkit-favorites', JSON.stringify(data.favorites));
                        if (data.ideaValidations) {
                            Object.keys(data.ideaValidations).forEach(key => {
                                localStorage.setItem(key, JSON.stringify(data.ideaValidations[key]));
                            });
                        }
                        alert('导入成功，页面即将刷新');
                        location.reload();
                    } catch (err) {
                        alert('导入失败：文件解析错误');
                    }
                };
                reader.readAsText(file);
            }
        });
        input.click();
    });

    overlay.querySelector('#btn-reset-data').addEventListener('click', () => {
        if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
            if (confirm('再次确认：将清除所有学习进度、打卡记录、收藏等数据。')) {
                localStorage.clear();
                alert('数据已清除，页面即将刷新');
                location.reload();
            }
        }
    });
}

// Inject settings button into knowledge map header
(function injectSettingsButton() {
const header = document.querySelector('#knowledge-map .page-header');
if (!header) return;
header.style.position = 'relative';
// Knowledge Feed button
const kfBtn = document.createElement('button');
kfBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>';
kfBtn.title = '知识灌注';
kfBtn.style.cssText = 'position:absolute;right:44px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:18px;cursor:pointer;padding:4px 8px;opacity:0.6;transition:opacity 0.2s;';
kfBtn.addEventListener('mouseenter', () => kfBtn.style.opacity = '1');
kfBtn.addEventListener('mouseleave', () => kfBtn.style.opacity = '0.6');
kfBtn.addEventListener('click', () => { if (typeof openKnowledgeFeed === 'function') openKnowledgeFeed(); });
header.appendChild(kfBtn);
// Settings button
const btn = document.createElement('button');
btn.className = 'settings-btn';
btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15 1.65 1.65 0 003 14.08V14a2 2 0 014 0v.09c0 .67.44 1.26 1.09 1.49z"/></svg>';
btn.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:18px;cursor:pointer;padding:4px 8px;opacity:0.6;transition:opacity 0.2s;';
btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
btn.addEventListener('mouseleave', () => btn.style.opacity = '0.6');
btn.addEventListener('click', openSettingsModal);
header.appendChild(btn);
})();

// ========== Feature 2: 全局搜索 ==========
(function initGlobalSearch() {
    // openGlobalSearch is exposed to window for AssistiveTouch FAB
    window.openGlobalSearch = function openGlobalSearch() {
        const overlay = document.createElement('div');
        overlay.className = 'global-search-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#fff;z-index:1100;display:flex;flex-direction:column;animation:fadeIn 0.2s;';
        overlay.innerHTML = `
            <div style="padding:12px 16px;border-bottom:0.5px solid #eee;display:flex;align-items:center;gap:10px;">
                <input type="text" id="global-search-input" placeholder="搜索知识点、案例、实验、Idea、资讯..." style="flex:1;border:none;outline:none;font-size:15px;font-family:Inter,system-ui,sans-serif;padding:8px 0;" autofocus>
                <button id="global-search-close" style="background:none;border:none;font-size:14px;cursor:pointer;padding:4px 8px;color:#666;font-family:Inter,system-ui,sans-serif;">取消</button>
            </div>
            <div id="global-search-results" style="flex:1;overflow-y:auto;padding:12px 16px;"></div>
        `;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('#global-search-input');
        const resultsContainer = overlay.querySelector('#global-search-results');

        input.focus();

        overlay.querySelector('#global-search-close').addEventListener('click', () => overlay.remove());

        let debounceTimer;
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => performGlobalSearch(input.value.trim(), resultsContainer, overlay), 150);
        });
    }

    function performGlobalSearch(query, container, overlay) {
        if (!query) {
            container.innerHTML = '<div style="text-align:center;color:#999;margin-top:40px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">输入关键词开始搜索</div>';
            return;
        }

        const lower = query.toLowerCase();
        const results = { knowledge: [], cases: [], labs: [], ideas: [], news: [] };

        // Search knowledge nodes
        const allLeaves = getAllLeaves();
        allLeaves.forEach(node => {
            if ((node.name && node.name.toLowerCase().includes(lower)) ||
                (node.fullName && node.fullName.toLowerCase().includes(lower)) ||
                (node.desc && node.desc.toLowerCase().includes(lower))) {
                results.knowledge.push(node);
            }
        });

        // Search cases
        const casesData = (typeof AI_CASES_DATA !== 'undefined') ? AI_CASES_DATA : [];
        casesData.forEach(c => {
            if (c.company.toLowerCase().includes(lower) ||
                c.title.toLowerCase().includes(lower) ||
                c.tags.some(t => t.toLowerCase().includes(lower))) {
                results.cases.push(c);
            }
        });

        // Search labs
        const labData = (typeof AI_LAB_DATA !== 'undefined') ? AI_LAB_DATA : [];
        labData.forEach(lab => {
            if (lab.title.toLowerCase().includes(lower) ||
                lab.category.toLowerCase().includes(lower)) {
                results.labs.push(lab);
            }
        });

        // Search ideas
        const ideasData = (typeof AI_IDEAS_DATA !== 'undefined') ? AI_IDEAS_DATA : [];
        ideasData.forEach(idea => {
            if (idea.title.toLowerCase().includes(lower) ||
                idea.category.toLowerCase().includes(lower) ||
                idea.summary.toLowerCase().includes(lower)) {
                results.ideas.push(idea);
            }
        });

        // Search news
        const newsData = getNewsData();
        newsData.forEach(day => {
            day.items.forEach(item => {
                if (item.title.toLowerCase().includes(lower)) {
                    results.news.push(item);
                }
            });
        });

        // Render results
        const totalResults = results.knowledge.length + results.cases.length + results.labs.length + results.ideas.length + results.news.length;
        if (totalResults === 0) {
            container.innerHTML = '<div style="text-align:center;color:#999;margin-top:40px;font-size:13px;">未找到相关内容</div>';
            return;
        }

        let html = '';

        if (results.knowledge.length > 0) {
            html += `<div class="search-group"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">知识点 (${results.knowledge.length})</div>`;
            results.knowledge.slice(0, 5).forEach(node => {
                html += `<div class="search-result-item" data-type="knowledge" data-id="${node.id}" style="padding:10px 12px;border:0.5px solid #eee;border-radius:6px;margin-bottom:6px;cursor:pointer;transition:background 0.2s;"><div style="font-size:14px;font-weight:500;">${node.name}</div>${node.fullName ? `<div style="font-size:12px;color:#888;">${node.fullName}</div>` : ''}</div>`;
            });
            html += '</div>';
        }

        if (results.cases.length > 0) {
            html += `<div class="search-group" style="margin-top:16px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">商业案例 (${results.cases.length})</div>`;
            results.cases.slice(0, 5).forEach(c => {
                html += `<div class="search-result-item" data-type="case" data-id="${c.id}" style="padding:10px 12px;border:0.5px solid #eee;border-radius:6px;margin-bottom:6px;cursor:pointer;transition:background 0.2s;"><div style="font-size:14px;font-weight:500;">${c.cover} ${c.title}</div><div style="font-size:12px;color:#888;">${c.company} · ${c.category}</div></div>`;
            });
            html += '</div>';
        }

        if (results.labs.length > 0) {
            html += `<div class="search-group" style="margin-top:16px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">实验室 (${results.labs.length})</div>`;
            results.labs.slice(0, 5).forEach(lab => {
                html += `<div class="search-result-item" data-type="lab" data-id="${lab.id}" style="padding:10px 12px;border:0.5px solid #eee;border-radius:6px;margin-bottom:6px;cursor:pointer;transition:background 0.2s;"><div style="font-size:14px;font-weight:500;">${lab.icon} ${lab.title}</div><div style="font-size:12px;color:#888;">${lab.category} · ${lab.difficulty}</div></div>`;
            });
            html += '</div>';
        }

        if (results.ideas.length > 0) {
            html += `<div class="search-group" style="margin-top:16px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">创业 Idea (${results.ideas.length})</div>`;
            results.ideas.slice(0, 5).forEach(idea => {
                html += `<div class="search-result-item" data-type="idea" data-id="${idea.id}" style="padding:10px 12px;border:0.5px solid #eee;border-radius:6px;margin-bottom:6px;cursor:pointer;transition:background 0.2s;"><div style="font-size:14px;font-weight:500;">${idea.icon} ${idea.title}</div><div style="font-size:12px;color:#888;">${idea.category} · ${idea.summary.slice(0, 30)}...</div></div>`;
            });
            html += '</div>';
        }

        if (results.news.length > 0) {
            html += `<div class="search-group" style="margin-top:16px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">资讯 (${results.news.length})</div>`;
            results.news.slice(0, 5).forEach(item => {
                html += `<div class="search-result-item" data-type="news" style="padding:10px 12px;border:0.5px solid #eee;border-radius:6px;margin-bottom:6px;cursor:pointer;transition:background 0.2s;"><div style="font-size:14px;font-weight:500;">${item.title}</div><div style="font-size:12px;color:#888;">${item.tag} · ${item.source}</div></div>`;
            });
            html += '</div>';
        }

        container.innerHTML = html;

        // Attach click handlers
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('mouseenter', () => item.style.background = '#f8f8f8');
            item.addEventListener('mouseleave', () => item.style.background = '');
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const id = item.dataset.id;
                overlay.remove();

                if (type === 'knowledge') {
                    document.querySelectorAll('.tab-item')[0].click();
                    setTimeout(() => {
                        const node = findNodeById(id);
                        if (node) openLearnModal(node);
                    }, 200);
                } else if (type === 'case') {
                    document.querySelectorAll('.tab-item')[2].click();
                    setTimeout(() => showCaseDetail(id), 200);
                } else if (type === 'lab') {
                    document.querySelectorAll('.tab-item')[3].click();
                    setTimeout(() => showLabDetail(id), 200);
                } else if (type === 'idea') {
                    document.querySelectorAll('.tab-item')[4].click();
                    setTimeout(() => showIdeaDetail(id), 200);
                } else if (type === 'news') {
                    document.querySelectorAll('.tab-item')[1].click();
                }
            });
        });
    }
})();

// ========== Feature 3: 收藏系统 ==========
const FAVORITES_KEY = 'ai-toolkit-favorites';

function loadFavorites() {
    try {
        const data = localStorage.getItem(FAVORITES_KEY);
        return data ? JSON.parse(data) : { cases: [], labs: [], ideas: [], knowledge: [] };
    } catch (e) {
        return { cases: [], labs: [], ideas: [], knowledge: [] };
    }
}

function saveFavorites(fav) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(fav));
}

function isFavorited(type, id) {
    const fav = loadFavorites();
    return (fav[type] || []).includes(id);
}

function toggleFavorite(type, id) {
    const fav = loadFavorites();
    if (!fav[type]) fav[type] = [];
    const idx = fav[type].indexOf(id);
    if (idx >= 0) {
        fav[type].splice(idx, 1);
    } else {
        fav[type].push(id);
    }
    saveFavorites(fav);
    return idx < 0; // returns true if now favorited
}

function createFavoriteButton(type, id, style) {
    const btn = document.createElement('button');
    const favorited = isFavorited(type, id);
    btn.className = 'fav-btn';
    btn.innerHTML = favorited ? '♥' : '♡';
    btn.style.cssText = (style || '') + 'background:none;border:none;font-size:18px;cursor:pointer;padding:2px 6px;transition:transform 0.2s;color:' + (favorited ? '#e74c3c' : '#ccc') + ';';
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nowFav = toggleFavorite(type, id);
        btn.innerHTML = nowFav ? '♥' : '♡';
        btn.style.color = nowFav ? '#e74c3c' : '#ccc';
        btn.style.transform = 'scale(1.3)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    });
    return btn;
}

// Inject favorite buttons into case cards
function injectCaseFavorites() {
    document.querySelectorAll('.case-card').forEach(card => {
        if (card.querySelector('.fav-btn')) return;
        const id = card.dataset.id;
        const btn = createFavoriteButton('cases', id, 'position:absolute;top:8px;right:8px;');
        card.style.position = 'relative';
        card.appendChild(btn);
    });
}

// Inject favorite buttons into lab cards
function injectLabFavorites() {
    document.querySelectorAll('.lab-card').forEach(card => {
        if (card.querySelector('.fav-btn')) return;
        const id = card.dataset.id;
        const btn = createFavoriteButton('labs', id, 'position:absolute;top:8px;right:8px;');
        card.style.position = 'relative';
        card.appendChild(btn);
    });
}

// Inject favorite buttons into idea cards
function injectIdeaFavorites() {
    document.querySelectorAll('.idea-card').forEach(card => {
        if (card.querySelector('.fav-btn')) return;
        const id = card.dataset.id;
        const btn = createFavoriteButton('ideas', id, 'position:absolute;top:8px;right:8px;');
        card.style.position = 'relative';
        card.appendChild(btn);
    });
}

// Inject "我的收藏" button in knowledge map header
function injectFavoritesViewButton() {
    const header = document.querySelector('#knowledge-map .page-header');
    if (!header || header.querySelector('.fav-view-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'fav-view-btn';
    btn.innerHTML = '♥';
    btn.title = '我的收藏';
    btn.style.cssText = 'position:absolute;right:44px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:18px;cursor:pointer;padding:4px 8px;color:#e74c3c;opacity:0.6;transition:opacity 0.2s;';
    btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
    btn.addEventListener('mouseleave', () => btn.style.opacity = '0.6');
    btn.addEventListener('click', openFavoritesModal);
    header.appendChild(btn);
}

function openFavoritesModal() {
    const fav = loadFavorites();
    const casesData = (typeof AI_CASES_DATA !== 'undefined') ? AI_CASES_DATA : [];
    const labData = (typeof AI_LAB_DATA !== 'undefined') ? AI_LAB_DATA : [];
    const ideasData = (typeof AI_IDEAS_DATA !== 'undefined') ? AI_IDEAS_DATA : [];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';

    let content = '';

    // Knowledge favorites
    if (fav.knowledge && fav.knowledge.length > 0) {
        content += '<div style="margin-bottom:16px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">知识点</div>';
        fav.knowledge.forEach(id => {
            const node = findNodeById(id);
            if (node) content += `<div class="fav-item" data-type="knowledge" data-id="${id}" style="padding:8px 12px;border:0.5px solid #eee;border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:13px;transition:background 0.2s;">${node.name}${node.fullName ? ' <span style="color:#999;">(' + node.fullName + ')</span>' : ''}</div>`;
        });
        content += '</div>';
    }

    // Cases favorites
    if (fav.cases && fav.cases.length > 0) {
        content += '<div style="margin-bottom:16px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">商业案例</div>';
        fav.cases.forEach(id => {
            const c = casesData.find(item => item.id === id);
            if (c) content += `<div class="fav-item" data-type="case" data-id="${id}" style="padding:8px 12px;border:0.5px solid #eee;border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:13px;transition:background 0.2s;">${c.cover} ${c.title}</div>`;
        });
        content += '</div>';
    }

    // Labs favorites
    if (fav.labs && fav.labs.length > 0) {
        content += '<div style="margin-bottom:16px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">实验室</div>';
        fav.labs.forEach(id => {
            const lab = labData.find(item => item.id === id);
            if (lab) content += `<div class="fav-item" data-type="lab" data-id="${id}" style="padding:8px 12px;border:0.5px solid #eee;border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:13px;transition:background 0.2s;">${lab.icon} ${lab.title}</div>`;
        });
        content += '</div>';
    }

    // Ideas favorites
    if (fav.ideas && fav.ideas.length > 0) {
        content += '<div style="margin-bottom:16px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">创业 Idea</div>';
        fav.ideas.forEach(id => {
            const idea = ideasData.find(item => item.id === id);
            if (idea) content += `<div class="fav-item" data-type="idea" data-id="${id}" style="padding:8px 12px;border:0.5px solid #eee;border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:13px;transition:background 0.2s;">${idea.icon} ${idea.title}</div>`;
        });
        content += '</div>';
    }

    if (!content) {
        content = '<div style="text-align:center;color:#999;margin-top:40px;font-size:13px;">还没有收藏任何内容</div>';
    }

    overlay.innerHTML = `
        <div class="modal" style="max-width:420px;">
            <div class="modal-header">
                <h3>我的收藏</h3>
                <button class="modal-close fav-modal-close">✕</button>
            </div>
            <div class="modal-body" style="padding:16px;max-height:60vh;overflow-y:auto;">
                ${content}
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.fav-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Click handlers for fav items
    overlay.querySelectorAll('.fav-item').forEach(item => {
        item.addEventListener('mouseenter', () => item.style.background = '#f8f8f8');
        item.addEventListener('mouseleave', () => item.style.background = '');
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const id = item.dataset.id;
            overlay.remove();
            if (type === 'knowledge') {
                document.querySelectorAll('.tab-item')[0].click();
                setTimeout(() => { const node = findNodeById(id); if (node) openLearnModal(node); }, 200);
            } else if (type === 'case') {
                document.querySelectorAll('.tab-item')[2].click();
                setTimeout(() => showCaseDetail(id), 200);
            } else if (type === 'lab') {
                document.querySelectorAll('.tab-item')[3].click();
                setTimeout(() => showLabDetail(id), 200);
            } else if (type === 'idea') {
                document.querySelectorAll('.tab-item')[4].click();
                setTimeout(() => showIdeaDetail(id), 200);
            }
        });
    });
}

// Initialize favorites injection (with MutationObserver for dynamic content)
function initFavorites() {
    injectFavoritesViewButton();
    injectCaseFavorites();
    injectLabFavorites();
    injectIdeaFavorites();

    // Re-inject after tab switches (cards may re-render)
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            setTimeout(() => {
                injectCaseFavorites();
                injectLabFavorites();
                injectIdeaFavorites();
            }, 100);
        });
    });
}
initFavorites();

// ========== Feature 4: AI 新闻周报 ==========
function buildWeeklyDigestCard(newsData) {
    if (!newsData || newsData.length === 0) return null;

    const totalCount = newsData.reduce((sum, day) => sum + day.items.length, 0);

    // Pick top headlines by category (policy > application > product > industry)
    const priorityOrder = ['政策监管', '应用落地', '重要产品发布', '行业格局变动', '大额融资/IPO', '技术突破'];
    const topHeadlines = [];
    const seenTitles = new Set();

    priorityOrder.forEach(tag => {
        if (topHeadlines.length >= 5) return;
        newsData.forEach(day => {
            day.items.forEach(item => {
                if (item.tag === tag && !seenTitles.has(item.title) && topHeadlines.length < 5) {
                    topHeadlines.push(item);
                    seenTitles.add(item.title);
                }
            });
        });
    });

    // If still less than 5, fill from any remaining
    if (topHeadlines.length < 5) {
        newsData.forEach(day => {
            day.items.forEach(item => {
                if (!seenTitles.has(item.title) && topHeadlines.length < 5) {
                    topHeadlines.push(item);
                    seenTitles.add(item.title);
                }
            });
        });
    }

    // Extract key themes — what actually happened this week
    const categoryCount = {};
    const companyMentions = {};
    newsData.forEach(day => {
        day.items.forEach(item => {
            categoryCount[item.tag] = (categoryCount[item.tag] || 0) + 1;
            const keywords = ['OpenAI', 'Google', 'Microsoft', 'Meta', 'Apple', 'Claude', 'GPT', 'Gemini', 'Anthropic', '百度', '阿里', '腾讯', '华为', 'DeepSeek', 'NVIDIA', 'Llama', 'Mistral', 'xAI'];
            keywords.forEach(kw => {
                if (item.title.includes(kw) || (item.summary && item.summary.includes(kw))) {
                    companyMentions[kw] = (companyMentions[kw] || 0) + 1;
                }
            });
        });
    });

    const topMentions = Object.entries(companyMentions).sort((a, b) => b[1] - a[1]).slice(0, 6);

    // Build the digest card
    const digestCard = document.createElement('div');
    digestCard.className = 'weekly-digest-card';
    digestCard.style.cssText = 'margin:0 0 16px 0;border:0.5px solid #eee;border-radius:8px;overflow:hidden;';
    digestCard.innerHTML = `
        <div class="weekly-digest-header" style="padding:14px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;background:#fafafa;">
            <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:14px;">%</span>
                <span style="font-size:13px;font-weight:600;letter-spacing:0.3px;">本周速览</span>
                <span style="font-size:11px;color:#999;background:#f0f0f0;padding:2px 6px;border-radius:3px;">${totalCount} 条 · ${newsData.length} 天</span>
            </div>
            <span class="digest-toggle" style="font-size:12px;color:#999;transition:transform 0.3s;">▼</span>
        </div>
        <div class="weekly-digest-body" style="padding:0 16px;max-height:0;overflow:hidden;transition:max-height 0.4s ease,padding 0.3s;">
            <div style="padding:14px 0;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:10px;font-weight:500;">本周必读</div>
                <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
                    ${topHeadlines.map((item, i) => `
                        <div style="display:flex;gap:8px;align-items:flex-start;">
                            <span style="font-size:11px;font-weight:700;color:#000;min-width:16px;">${i + 1}.</span>
                            <div style="flex:1;min-width:0;">
                                <div style="font-size:12px;font-weight:500;line-height:1.5;color:#222;">${item.title}</div>
                                <div style="font-size:11px;color:#888;margin-top:3px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${item.summary ? item.summary.slice(0, 100) + '...' : ''}</div>
                            </div>
                            <span style="font-size:10px;color:#bbb;white-space:nowrap;padding-top:2px;">${item.tag}</span>
                        </div>
                    `).join('')}
                </div>
                ${topMentions.length > 0 ? `
                    <div style="border-top:0.5px solid #eee;padding-top:12px;margin-bottom:12px;">
                        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">活跃玩家</div>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">${topMentions.map(([name, count]) => `<span style="font-size:11px;background:#111;color:#fff;padding:3px 8px;border-radius:4px;">${name} <span style="opacity:0.6;">×${count}</span></span>`).join('')}</div>
                    </div>
                ` : ''}
                <div style="border-top:0.5px solid #eee;padding-top:12px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:6px;font-weight:500;">编辑视角</div>
                    <div style="font-size:12px;color:#555;line-height:1.7;">${generateEditorSummary(newsData, topHeadlines, topMentions)}</div>
                </div>
            </div>
        </div>
    `;

    // Toggle collapse
    const header = digestCard.querySelector('.weekly-digest-header');
    const body = digestCard.querySelector('.weekly-digest-body');
    const toggleIcon = digestCard.querySelector('.digest-toggle');
    let expanded = false;

    header.addEventListener('click', () => {
        expanded = !expanded;
        if (expanded) {
            body.style.maxHeight = '600px';
            toggleIcon.style.transform = 'rotate(180deg)';
        } else {
            body.style.maxHeight = '0';
            toggleIcon.style.transform = 'rotate(0deg)';
        }
    });

    return digestCard;
}

function generateEditorSummary(newsData, headlines, topMentions) {
    // Generate a meaningful editorial summary based on actual content
    const policyNews = [];
    const productNews = [];
    const appNews = [];
    newsData.forEach(day => {
        day.items.forEach(item => {
            if (item.tag === '政策监管') policyNews.push(item);
            if (item.tag === '重要产品发布') productNews.push(item);
            if (item.tag === '应用落地') appNews.push(item);
        });
    });

    let summary = '';

    if (policyNews.length > 0) {
        const pTitle = policyNews[0].title;
        const pKeyword = pTitle.length > 20 ? pTitle.slice(0, 20) + '...' : pTitle;
        summary += `监管侧，「${pKeyword}」值得重点关注，AI 合规正在成为产业准入门槛。`;
    }

    if (productNews.length > 0) {
        const companies = [];
        const kws = ['Google', 'OpenAI', 'Anthropic', 'Meta', '百度', '阿里', '华为', 'xAI'];
        productNews.forEach(p => {
            kws.forEach(k => { if (p.title.includes(k) && !companies.includes(k)) companies.push(k); });
        });
        if (companies.length > 0) {
            summary += `产品层面，${companies.slice(0, 3).join('、')}本周有重要发布；`;
        } else {
            summary += `产品层面有 ${productNews.length} 项重要发布；`;
        }
    }

    if (appNews.length > 0) {
        summary += `落地侧，企业级 AI 部署加速，${appNews.length} 条应用类新闻反映出从"能用"到"规模化用"的转变。`;
    }

    if (!summary) {
        summary = `本周 AI 行业动态密集，建议重点关注排名前 3 的新闻。`;
    }

    return summary;
}

// ========== Feature 5: 互动式学习路径推荐 ==========
function renderRecommendations() {
    const container = document.getElementById('tree-container');
    if (!container) return;

    // Remove existing recommendations
    const existing = container.querySelector('.recommendations-card');
    if (existing) existing.remove();

    const recommendations = [];

    // Category to lab mapping
    const categoryLabMap = {
        'AI 基础原理': 'Prompt基础',
        'AI基础原理': 'Prompt基础',
        '大语言模型': 'AI辅助编程入门',
        'AI 应用': 'AI数据清洗',
        'AI应用': 'AI数据清洗',
        '商业与产品': 'AI商业分析',
        '前沿技术': 'AI辅助编程入门',
        '工具与平台': 'AI数据清洗'
    };

    // Analyze user state per category
    KNOWLEDGE_TREE.forEach(category => {
        const leaves = getAllLeaves([category]);
        const learningNodes = leaves.filter(n => getNodeStatus(n.id) === 'learning');
        const masteredNodes = leaves.filter(n => getNodeStatus(n.id) === 'mastered');
        const notStartedNodes = leaves.filter(n => getNodeStatus(n.id) === 'not-started');

        if (learningNodes.length > 0 && recommendations.length < 3) {
            // Has nodes in learning state - suggest completing them
            const node = learningNodes[0];
            recommendations.push({
                type: 'continue',
                icon: '■',
                title: `继续学习「${node.name}」`,
                subtitle: `${category.name} · 还有 ${learningNodes.length} 个在学`,
                action: () => openLearnModal(node)
            });
        } else if (masteredNodes.length === leaves.length && leaves.length > 0 && recommendations.length < 3) {
            // All completed in this category - suggest lab
            const labName = categoryLabMap[category.name];
            if (labName) {
                const labData = (typeof AI_LAB_DATA !== 'undefined') ? AI_LAB_DATA : [];
                const lab = labData.find(l => l.title.includes(labName));
                if (lab) {
                    recommendations.push({
                        type: 'lab',
                        icon: '◆',
                        title: `开始实验「${lab.title}」`,
                        subtitle: `${category.name} 已全部掌握，进入实战`,
                        action: () => {
                            document.querySelectorAll('.tab-item')[3].click();
                            setTimeout(() => showLabDetail(lab.id), 200);
                        }
                    });
                }
            }
        } else if (notStartedNodes.length === leaves.length && leaves.length > 0 && recommendations.length < 3) {
            // Not started - suggest beginning with fundamentals
            const firstNode = leaves[0];
            recommendations.push({
                type: 'start',
                icon: '▲',
                title: `开始学习「${category.name}」`,
                subtitle: `共 ${leaves.length} 个知识点，从基础开始`,
                action: () => openLearnModal(firstNode)
            });
        }
    });

    // If no recommendations, show a default
    if (recommendations.length === 0) {
        const allLeaves = getAllLeaves();
        const notStarted = allLeaves.filter(n => getNodeStatus(n.id) === 'not-started');
        if (notStarted.length > 0) {
            recommendations.push({
                type: 'start',
                icon: '♦',
                title: '开始你的 AI 学习之旅',
                subtitle: `还有 ${notStarted.length} 个知识点等你探索`,
                action: () => openLearnModal(notStarted[0])
            });
        }
    }

    if (recommendations.length === 0) return;

    // Create recommendation card
    const card = document.createElement('div');
    card.className = 'recommendations-card';
    card.style.cssText = 'margin:0 0 16px 0;border:0.5px solid #eee;border-radius:8px;padding:14px 16px;';
    card.innerHTML = `
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:10px;font-weight:500;">推荐下一步</div>
        <div class="recommendations-list" style="display:flex;flex-direction:column;gap:8px;">
            ${recommendations.map((rec, idx) => `
                <div class="recommendation-item" data-idx="${idx}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:0.5px solid #f0f0f0;border-radius:6px;cursor:pointer;transition:all 0.2s;">
                    <span style="font-size:18px;">${rec.icon}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${rec.title}</div>
                        <div style="font-size:11px;color:#999;margin-top:2px;">${rec.subtitle}</div>
                    </div>
                    <span style="font-size:12px;color:#ccc;">→</span>
                </div>
            `).join('')}
        </div>
    `;

    // Insert after stats-row
    const statsRow = container.querySelector('.stats-row');
    if (statsRow && statsRow.nextSibling) {
        container.insertBefore(card, statsRow.nextSibling);
    } else if (statsRow) {
        container.appendChild(card);
    } else {
        container.insertBefore(card, container.firstChild);
    }

    // Attach click handlers
    card.querySelectorAll('.recommendation-item').forEach(item => {
        const idx = parseInt(item.dataset.idx);
        item.addEventListener('mouseenter', () => item.style.background = '#f8f8f8');
        item.addEventListener('mouseleave', () => item.style.background = '');
        item.addEventListener('click', () => recommendations[idx].action());
    });
}

// Call after tree render
renderRecommendations();

// ========== Feature 6: Idea 验证工作台 ==========
// Override showIdeaDetail to add validation button
const _originalShowIdeaDetail = showIdeaDetail;

showIdeaDetail = function(id) {
    const ideasData = (typeof AI_IDEAS_DATA !== 'undefined') ? AI_IDEAS_DATA : [];
    const idea = ideasData.find(item => item.id === id);
    if (!idea) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal idea-detail-modal">
            <div class="modal-header">
                <h3>${idea.icon} ${idea.title}</h3>
                <button class="modal-close idea-detail-close">✕</button>
            </div>
            <div class="modal-body idea-detail-body">
                <div class="idea-detail-meta">
                    <span class="idea-opportunity opp-${idea.opportunity === '大' ? 'high' : 'medium'}">机会：${idea.opportunity}</span>
                    <span>难度：${idea.difficulty}</span>
                    <span>${idea.investment}</span>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">市场规模</div>
                    <p>${idea.marketSize}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">痛点</div>
                    <p>${idea.painPoint}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">解决方案</div>
                    <p>${idea.solution}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">竞争壁垒</div>
                    <p>${idea.moat}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">竞争对手</div>
                    <p>${idea.competitors}</p>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">下一步行动</div>
                    <ol class="idea-steps">
                        ${idea.nextSteps.map(s => `<li>${s}</li>`).join('')}
                    </ol>
                </div>
                <div class="idea-detail-section">
                    <div class="idea-detail-label">灵感来源</div>
                    <p class="idea-inspiration">${idea.inspiration}</p>
                </div>
                <div style="padding:16px 0;border-top:0.5px solid #eee;margin-top:16px;">
                    <button class="idea-validate-btn" style="width:100%;padding:14px;background:#000;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity 0.2s;font-family:Inter,system-ui,sans-serif;letter-spacing:0.3px;">开始验证</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('.idea-detail-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Validate button
    overlay.querySelector('.idea-validate-btn').addEventListener('mouseenter', function() { this.style.opacity = '0.8'; });
    overlay.querySelector('.idea-validate-btn').addEventListener('mouseleave', function() { this.style.opacity = '1'; });
    overlay.querySelector('.idea-validate-btn').addEventListener('click', () => {
        overlay.remove();
        openIdeaValidation(id);
    });

    // Add favorite button to detail modal
    const headerEl = overlay.querySelector('.modal-header');
    if (headerEl) {
        const favBtn = createFavoriteButton('ideas', id, 'margin-left:auto;margin-right:8px;');
        headerEl.insertBefore(favBtn, headerEl.querySelector('.modal-close'));
    }
};

function openIdeaValidation(id) {
    const ideasData = (typeof AI_IDEAS_DATA !== 'undefined') ? AI_IDEAS_DATA : [];
    const idea = ideasData.find(item => item.id === id);
    if (!idea) return;

    const storageKey = `ai-toolkit-idea-validation-${id}`;
    let savedData = {};
    try {
        const raw = localStorage.getItem(storageKey);
        if (raw) savedData = JSON.parse(raw);
    } catch (e) {}

    // Scoring dimensions with guiding questions
    const scoreDimensions = [
        { key: 'painLevel', label: '痛点强度', question: '用户现在如何解决？有多痛苦？', desc: '1=可有可无 5=不解决活不下去' },
        { key: 'marketTiming', label: '时机判断', question: '为什么是现在？之前为什么没人做成？', desc: '1=太早或太晚 5=窗口期正好' },
        { key: 'techFeasibility', label: '技术可行性', question: '现有 AI 能力能否支撑核心功能？', desc: '1=需要突破 5=现成方案可拼' },
        { key: 'moatStrength', label: '壁垒深度', question: '大厂抄你需要多久？数据/网络效应如何？', desc: '1=一周复制 5=越用越难追' },
        { key: 'monetization', label: '变现清晰度', question: '谁付钱？付多少？为什么愿意？', desc: '1=想不清楚 5=用户主动问价' }
    ];

    const savedScores = savedData.scores || {};

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.cssText = 'z-index:1200;';

    let scoringHTML = scoreDimensions.map(dim => {
        const currentScore = savedScores[dim.key] || 0;
        return `
            <div class="score-dimension" data-key="${dim.key}" style="padding:10px 12px;border:0.5px solid #eee;border-radius:6px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span style="font-size:12px;font-weight:500;">${dim.label}</span>
                    <div class="score-dots" style="display:flex;gap:4px;">
                        ${[1,2,3,4,5].map(n => `<span class="score-dot" data-key="${dim.key}" data-score="${n}" style="width:22px;height:22px;border-radius:50%;border:1.5px solid ${currentScore >= n ? '#000' : '#ddd'};background:${currentScore >= n ? '#000' : '#fff'};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:10px;color:${currentScore >= n ? '#fff' : '#ccc'};transition:all 0.15s;font-weight:500;">${n}</span>`).join('')}
                    </div>
                </div>
                <div style="font-size:11px;color:#888;line-height:1.4;">${dim.question}</div>
                <div style="font-size:10px;color:#bbb;margin-top:2px;">${dim.desc}</div>
            </div>`;
    }).join('');

    const mvpHTML = (savedData.mvpItems || ['', '', '']).map((item, i) => `
        <label style="display:flex;align-items:center;gap:8px;padding:6px 10px;border:0.5px solid #eee;border-radius:6px;cursor:pointer;font-size:13px;">
            <input type="checkbox" class="mvp-check" ${(savedData.mvpChecked || [])[i] ? 'checked' : ''} style="accent-color:#000;">
            <input type="text" class="mvp-input" value="${item}" placeholder="MVP 功能 ${i + 1}..." style="flex:1;border:none;outline:none;font-size:13px;font-family:Inter,system-ui,sans-serif;background:transparent;">
        </label>`).join('');

    const weeksData = savedData.weeks || ['', '', '', ''];
    const weekLabels = [
        ['第1周：用户调研', '找谁聊？问什么？如何验证痛点真实存在？'],
        ['第2周：原型 & Landing Page', '落地页文案？核心价值主张？预注册转化测试？'],
        ['第3周：MVP 开发', '哪一个场景最能验证 PMF？技术选型？'],
        ['第4周：种子用户测试', '找 10-20 个种子用户。关键指标：留存？NPS？']
    ];

    const weeksHTML = weekLabels.map((wk, i) => `
        <div>
            <label style="font-size:11px;color:#888;">${wk[0]}</label>
            <textarea class="val-week" data-week="${i+1}" placeholder="${wk[1]}" style="width:100%;min-height:50px;border:0.5px solid #ddd;border-radius:6px;padding:8px 10px;font-size:12px;font-family:Inter,system-ui,sans-serif;resize:vertical;outline:none;box-sizing:border-box;">${weeksData[i] || ''}</textarea>
        </div>`).join('');

    overlay.innerHTML = `
        <div class="modal" style="max-width:500px;max-height:85vh;">
            <div class="modal-header">
                <h3>验证工作台</h3>
                <button class="modal-close validation-close">✕</button>
            </div>
            <div class="modal-body" style="padding:16px;overflow-y:auto;max-height:calc(85vh - 60px);">
                <div style="font-size:13px;color:#666;margin-bottom:16px;padding-bottom:12px;border-bottom:0.5px solid #eee;display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-weight:500;">${idea.icon} ${idea.title}</span>
                    <span id="val-total-score" style="font-size:20px;font-weight:700;color:#000;"></span>
                </div>

                <div class="validation-section" style="margin-bottom:20px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:10px;font-weight:500;">可行性评分</div>
                    <div id="val-scoring" style="display:flex;flex-direction:column;gap:10px;">
                        ${scoringHTML}
                    </div>
                    <div id="val-score-verdict" style="margin-top:10px;padding:10px 12px;background:#fafafa;border-radius:6px;font-size:12px;color:#555;line-height:1.5;display:none;"></div>
                </div>

                <div class="validation-section" style="margin-bottom:20px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:4px;font-weight:500;">竞争分析</div>
                    <div style="font-size:11px;color:#bbb;margin-bottom:8px;">市场上有谁在做类似的事？他们的弱点？你的差异化切入点？</div>
                    <textarea id="val-competitors" placeholder="1. [竞品名] 优势 / 弱点&#10;2. [竞品名] 优势 / 弱点&#10;&#10;我的差异化：..." style="width:100%;min-height:90px;border:0.5px solid #ddd;border-radius:6px;padding:10px;font-size:13px;font-family:Inter,system-ui,sans-serif;resize:vertical;outline:none;box-sizing:border-box;transition:border-color 0.2s;">${savedData.competitors || ''}</textarea>
                </div>

                <div class="validation-section" style="margin-bottom:20px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">TAM 估算 <span style="font-weight:400;text-transform:none;">(输入后自动计算)</span></div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div>
                            <label style="font-size:11px;color:#888;">目标用户数 (万人)</label>
                            <input type="number" id="val-tam-users" placeholder="100" value="${savedData.tamUsers || ''}" style="width:100%;padding:8px 10px;border:0.5px solid #ddd;border-radius:6px;font-size:13px;font-family:Inter,system-ui,sans-serif;outline:none;box-sizing:border-box;margin-top:4px;">
                        </div>
                        <div>
                            <label style="font-size:11px;color:#888;">ARPU (元/年)</label>
                            <input type="number" id="val-tam-arpu" placeholder="200" value="${savedData.tamArpu || ''}" style="width:100%;padding:8px 10px;border:0.5px solid #ddd;border-radius:6px;font-size:13px;font-family:Inter,system-ui,sans-serif;outline:none;box-sizing:border-box;margin-top:4px;">
                        </div>
                        <div>
                            <label style="font-size:11px;color:#888;">可获市占率 (%)</label>
                            <input type="number" id="val-tam-share" placeholder="5" value="${savedData.tamShare || ''}" style="width:100%;padding:8px 10px;border:0.5px solid #ddd;border-radius:6px;font-size:13px;font-family:Inter,system-ui,sans-serif;outline:none;box-sizing:border-box;margin-top:4px;">
                        </div>
                        <div>
                            <label style="font-size:11px;color:#888;">= 预估年收入</label>
                            <div id="val-tam-result" style="padding:8px 10px;border:0.5px solid #eee;border-radius:6px;font-size:13px;font-weight:600;margin-top:4px;background:#f8f8f8;min-height:18px;color:#000;">${savedData.tamRevenue || '等待输入...'}</div>
                        </div>
                    </div>
                    <div id="val-tam-tier" style="margin-top:6px;font-size:11px;color:#888;"></div>
                </div>

                <div class="validation-section" style="margin-bottom:20px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:4px;font-weight:500;">MVP 范围</div>
                    <div style="font-size:11px;color:#bbb;margin-bottom:8px;">能验证核心假设的最小功能集，不超过 5 个。</div>
                    <div id="val-mvp-list" style="display:flex;flex-direction:column;gap:6px;">
                        ${mvpHTML}
                    </div>
                    <button id="val-mvp-add" style="margin-top:6px;padding:6px 12px;border:0.5px dashed #ccc;background:none;border-radius:6px;font-size:12px;cursor:pointer;color:#999;width:100%;transition:border-color 0.2s;">+ 添加功能项</button>
                </div>

                <div class="validation-section" style="margin-bottom:20px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:8px;font-weight:500;">30天行动计划</div>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        ${weeksHTML}
                    </div>
                </div>

                <div class="validation-section" style="margin-bottom:20px;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#999;margin-bottom:4px;font-weight:500;">放弃标准</div>
                    <div style="font-size:11px;color:#bbb;margin-bottom:8px;">什么情况下果断止损？提前想清楚避免沉没成本。</div>
                    <textarea id="val-kill-criteria" placeholder="例：&#10;- 调研 10 人中少于 3 人愿意付费&#10;- Landing Page 转化率低于 2%&#10;- 4 周内找不到技术方案" style="width:100%;min-height:70px;border:0.5px solid #ddd;border-radius:6px;padding:10px;font-size:13px;font-family:Inter,system-ui,sans-serif;resize:vertical;outline:none;box-sizing:border-box;transition:border-color 0.2s;">${savedData.killCriteria || ''}</textarea>
                </div>

                <button id="val-save-btn" style="width:100%;padding:14px;background:#000;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity 0.2s;font-family:Inter,system-ui,sans-serif;letter-spacing:0.3px;">保存验证数据</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('.validation-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // === Scoring system ===
    const currentScores = Object.assign({}, savedScores);

    function updateScoreDisplay() {
        const keys = scoreDimensions.map(d => d.key);
        const filled = keys.filter(k => currentScores[k] > 0);
        const totalEl = overlay.querySelector('#val-total-score');
        const verdictEl = overlay.querySelector('#val-score-verdict');

        if (filled.length === 0) {
            totalEl.textContent = '';
            verdictEl.style.display = 'none';
            return;
        }

        const total = filled.reduce((sum, k) => sum + currentScores[k], 0);
        const avg = total / 5; // always out of 5 dimensions
        totalEl.textContent = total + '/25';
        totalEl.style.color = avg >= 4 ? '#16a34a' : avg >= 3 ? '#000' : '#dc2626';

        verdictEl.style.display = 'block';
if (avg >= 4.5) verdictEl.textContent = '极强信号！值得 All-in，立刻开始第一周行动。';
    else if (avg >= 3.5) verdictEl.textContent = '有潜力。重点关注低分项，想清楚再动手。';
    else if (avg >= 2.5) verdictEl.textContent = '风险较高。建议做更多调研，或考虑 pivot。';
    else verdictEl.textContent = '信号偏弱。建议暂缓，除非你对某个维度有独特洞察。';
    }

    // Attach score dot clicks
    overlay.querySelectorAll('.score-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const key = dot.dataset.key;
            const score = parseInt(dot.dataset.score);
            currentScores[key] = score;

            // Update dots visual
            const siblings = overlay.querySelectorAll(`.score-dot[data-key="${key}"]`);
            siblings.forEach(s => {
                const sScore = parseInt(s.dataset.score);
                if (sScore <= score) {
                    s.style.background = '#000';
                    s.style.borderColor = '#000';
                    s.style.color = '#fff';
                } else {
                    s.style.background = '#fff';
                    s.style.borderColor = '#ddd';
                    s.style.color = '#ccc';
                }
            });
            updateScoreDisplay();
        });
    });

    updateScoreDisplay();

    // === TAM auto-calculation ===
    function autoCalcTAM() {
        const users = parseFloat(overlay.querySelector('#val-tam-users').value) || 0;
        const arpu = parseFloat(overlay.querySelector('#val-tam-arpu').value) || 0;
        const share = parseFloat(overlay.querySelector('#val-tam-share').value) || 0;
        const resultEl = overlay.querySelector('#val-tam-result');
        const tierEl = overlay.querySelector('#val-tam-tier');

        if (users > 0 && arpu > 0 && share > 0) {
            const revenue = users * 10000 * arpu * (share / 100);
            let formatted;
            if (revenue >= 100000000) formatted = (revenue / 100000000).toFixed(1) + ' 亿';
            else if (revenue >= 10000) formatted = (revenue / 10000).toFixed(0) + ' 万';
            else formatted = revenue.toFixed(0) + ' 元';
            resultEl.textContent = '¥' + formatted;

            // Market tier assessment
            if (revenue >= 1000000000) tierEl.textContent = '超大市场（10亿+），适合 VC 融资路线';
            else if (revenue >= 100000000) tierEl.textContent = '大市场（1-10亿），可考虑风险投资';
            else if (revenue >= 10000000) tierEl.textContent = '中等市场（1000万-1亿），适合精益创业';
            else if (revenue >= 1000000) tierEl.textContent = '小市场（100-1000万），适合个人/小团队';
            else tierEl.textContent = '市场偏小，建议重新评估定价或用户规模';
        } else {
            resultEl.textContent = '等待输入...';
            tierEl.textContent = '';
        }
    }

    overlay.querySelector('#val-tam-users').addEventListener('input', autoCalcTAM);
    overlay.querySelector('#val-tam-arpu').addEventListener('input', autoCalcTAM);
    overlay.querySelector('#val-tam-share').addEventListener('input', autoCalcTAM);
    autoCalcTAM(); // initial calc from saved data

    // Add MVP item
    overlay.querySelector('#val-mvp-add').addEventListener('click', () => {
        const list = overlay.querySelector('#val-mvp-list');
        const idx = list.querySelectorAll('.mvp-input').length;
        const label = document.createElement('label');
        label.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;border:0.5px solid #eee;border-radius:6px;cursor:pointer;font-size:13px;';
        label.innerHTML = '<input type="checkbox" class="mvp-check" style="accent-color:#000;"><input type="text" class="mvp-input" value="" placeholder="MVP 功能 ' + (idx + 1) + '..." style="flex:1;border:none;outline:none;font-size:13px;font-family:Inter,system-ui,sans-serif;background:transparent;">';
        list.appendChild(label);
    });

    // Save button
    const saveBtn = overlay.querySelector('#val-save-btn');
    saveBtn.addEventListener('mouseenter', () => saveBtn.style.opacity = '0.8');
    saveBtn.addEventListener('mouseleave', () => saveBtn.style.opacity = '1');
    saveBtn.addEventListener('click', () => {
        const data = {
            scores: Object.assign({}, currentScores),
            competitors: overlay.querySelector('#val-competitors').value,
            tamUsers: overlay.querySelector('#val-tam-users').value,
            tamArpu: overlay.querySelector('#val-tam-arpu').value,
            tamShare: overlay.querySelector('#val-tam-share').value,
            tamRevenue: overlay.querySelector('#val-tam-result').textContent,
            mvpItems: Array.from(overlay.querySelectorAll('.mvp-input')).map(el => el.value),
            mvpChecked: Array.from(overlay.querySelectorAll('.mvp-check')).map(el => el.checked),
            weeks: Array.from(overlay.querySelectorAll('.val-week')).map(el => el.value),
            killCriteria: overlay.querySelector('#val-kill-criteria').value,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
saveBtn.textContent = '✓ 已保存';
setTimeout(() => { saveBtn.textContent = '保存验证数据'; }, 1500);
    });

    // Focus styles
    overlay.querySelectorAll('textarea, input[type="number"]').forEach(el => {
        el.addEventListener('focus', () => el.style.borderColor = '#000');
        el.addEventListener('blur', () => el.style.borderColor = '#ddd');
    });
}



// ========== Feature 7: 社区评论/讨论系统 ==========
const COMMENTS_KEY = 'ai-toolkit-comments';

function loadComments() {
    try {
        const data = localStorage.getItem(COMMENTS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function saveComments(comments) {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

function renderCommentsSection(targetId, type) {
    // type: 'case' or 'idea'
    const key = type + '-' + targetId;
    const comments = loadComments();
    const list = comments[key] || [];

    const container = document.createElement('div');
    container.className = 'comments-section';
    container.innerHTML = '<div class="comments-header">' +
        '<span class="comments-title">\uD83D\uDCAC \u8BA8\u8BBA (' + list.length + ')</span>' +
        '</div>' +
        '<div class="comments-list">' +
        (list.length === 0 ? '<div class="comments-empty">\u8FD8\u6CA1\u6709\u8BA8\u8BBA\uFF0C\u5206\u4EAB\u4F60\u7684\u89C1\u89E3\u5427</div>' :
        list.map(function(c, i) {
            var timeStr = new Date(c.timestamp).toLocaleString('zh-CN', {month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'});
            return '<div class="comment-item">' +
                '<div class="comment-meta">' +
                '<span class="comment-time">' + timeStr + '</span>' +
                '<button class="comment-delete" data-idx="' + i + '">\u00D7</button>' +
                '</div>' +
                '<div class="comment-text">' + c.text.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>') + '</div>' +
                '</div>';
        }).join('')) +
        '</div>' +
        '<div class="comment-input-area">' +
        '<textarea class="comment-input" placeholder="\u5199\u4E0B\u4F60\u7684\u5206\u6790\u6216\u89C1\u89E3..." rows="3"></textarea>' +
        '<button class="comment-submit">\u53D1\u5E03</button>' +
        '</div>';

    // Event: submit
    container.querySelector('.comment-submit').addEventListener('click', function() {
        var textarea = container.querySelector('.comment-input');
        var text = textarea.value.trim();
        if (!text) return;
        var allComments = loadComments();
        if (!allComments[key]) allComments[key] = [];
        allComments[key].push({ text: text, timestamp: Date.now() });
        saveComments(allComments);
        // Re-render
        var parent = container.parentNode;
        var newSection = renderCommentsSection(targetId, type);
        parent.replaceChild(newSection, container);
    });

    // Event: delete
    container.querySelectorAll('.comment-delete').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.dataset.idx);
            var allComments = loadComments();
            if (allComments[key]) {
                allComments[key].splice(idx, 1);
                if (allComments[key].length === 0) delete allComments[key];
                saveComments(allComments);
            }
            var parent = container.parentNode;
            var newSection = renderCommentsSection(targetId, type);
            parent.replaceChild(newSection, container);
        });
    });

    return container;
}

// Inject comments into case detail modal
(function patchCaseDetail() {
    var origShowCase = window.showCaseDetail;
    if (typeof origShowCase !== 'function') return;
    window.showCaseDetail = function(id) {
        origShowCase(id);
        // Wait for modal to render
        setTimeout(function() {
            var overlay = document.querySelector('.modal-overlay.active');
            if (!overlay) return;
            var modalBody = overlay.querySelector('.modal-body') || overlay.querySelector('.case-detail-body');
            if (!modalBody) return;
            // Don't add twice
            if (modalBody.querySelector('.comments-section')) return;
            var section = renderCommentsSection(id, 'case');
            modalBody.appendChild(section);
        }, 150);
    };
})();

// Inject comments into idea detail modal
(function patchIdeaDetail() {
    var origShowIdea = window.showIdeaDetail;
    if (typeof origShowIdea !== 'function') return;
    window.showIdeaDetail = function(id) {
        origShowIdea(id);
        setTimeout(function() {
            var overlay = document.querySelector('.modal-overlay.active');
            if (!overlay) return;
            var modalBody = overlay.querySelector('.modal-body') || overlay.querySelector('.idea-detail-body');
            if (!modalBody) return;
            if (modalBody.querySelector('.comments-section')) return;
            var section = renderCommentsSection(id, 'idea');
            modalBody.appendChild(section);
        }, 150);
    };
})();


// ========== Feature 8: AI 助教对话框 ==========
const AI_CHAT_KEY = 'ai-toolkit-chat-config';

function loadChatConfig() {
    try {
        var data = localStorage.getItem(AI_CHAT_KEY);
        return data ? JSON.parse(data) : { apiKey: '', model: 'gpt-3.5-turbo', baseUrl: 'https://api.openai.com/v1' };
    } catch(e) {
        return { apiKey: '', model: 'gpt-3.5-turbo', baseUrl: 'https://api.openai.com/v1' };
    }
}

function saveChatConfig(config) {
    localStorage.setItem(AI_CHAT_KEY, JSON.stringify(config));
}

(function initAIChat() {
    // Chat panel (FAB removed — now triggered via AssistiveTouch)
    var chatPanel = document.createElement('div');
    chatPanel.className = 'ai-chat-panel';
    chatPanel.innerHTML = '<div class="ai-chat-header">' +
        '<span class="ai-chat-title">\uD83E\uDD16 AI \u52A9\u6559</span>' +
        '<div class="ai-chat-header-btns">' +
        '<button class="ai-chat-settings-btn" title="\u8BBE\u7F6E">\u2699</button>' +
        '<button class="ai-chat-close-btn">\u00D7</button>' +
        '</div></div>' +
        '<div class="ai-chat-messages">' +
        '<div class="ai-msg ai-msg-bot">\u4F60\u597D\uFF01\u6211\u662F AI \u52A9\u6559\uFF0C\u53EF\u4EE5\u56DE\u7B54\u4F60\u5728\u5B66\u4E60 AI \u8FC7\u7A0B\u4E2D\u7684\u4EFB\u4F55\u95EE\u9898\u3002\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E\u4F60\u7684 API Key\u3002</div>' +
        '</div>' +
        '<div class="ai-chat-input-area">' +
        '<input type="text" class="ai-chat-input" placeholder="\u8F93\u5165\u95EE\u9898..." />' +
        '<button class="ai-chat-send">\u2191</button>' +
        '</div>' +
        '<div class="ai-chat-settings-panel" style="display:none;">' +
        '<div class="ai-settings-row"><label>API Key</label><input type="password" class="ai-cfg-key" placeholder="sk-..." /></div>' +
        '<div class="ai-settings-row"><label>Base URL</label><input type="text" class="ai-cfg-url" placeholder="https://api.openai.com/v1" /></div>' +
        '<div class="ai-settings-row"><label>Model</label><input type="text" class="ai-cfg-model" placeholder="gpt-3.5-turbo" /></div>' +
        '<button class="ai-cfg-save">\u4FDD\u5B58\u914D\u7F6E</button>' +
        '</div>';
    document.body.appendChild(chatPanel);

    var messages = []; // conversation history

    chatPanel.querySelector('.ai-chat-close-btn').addEventListener('click', function() {
        chatPanel.classList.remove('active');
    });

    // Settings toggle
    var settingsPanel = chatPanel.querySelector('.ai-chat-settings-panel');
    chatPanel.querySelector('.ai-chat-settings-btn').addEventListener('click', function() {
        var show = settingsPanel.style.display === 'none';
        settingsPanel.style.display = show ? 'block' : 'none';
        if (show) {
            var cfg = loadChatConfig();
            chatPanel.querySelector('.ai-cfg-key').value = cfg.apiKey || '';
            chatPanel.querySelector('.ai-cfg-url').value = cfg.baseUrl || 'https://api.openai.com/v1';
            chatPanel.querySelector('.ai-cfg-model').value = cfg.model || 'gpt-3.5-turbo';
        }
    });

    chatPanel.querySelector('.ai-cfg-save').addEventListener('click', function() {
        var cfg = {
            apiKey: chatPanel.querySelector('.ai-cfg-key').value.trim(),
            baseUrl: chatPanel.querySelector('.ai-cfg-url').value.trim() || 'https://api.openai.com/v1',
            model: chatPanel.querySelector('.ai-cfg-model').value.trim() || 'gpt-3.5-turbo'
        };
        saveChatConfig(cfg);
        settingsPanel.style.display = 'none';
        appendMsg('bot', '\u2705 \u914D\u7F6E\u5DF2\u4FDD\u5B58\uFF01\u73B0\u5728\u53EF\u4EE5\u5F00\u59CB\u63D0\u95EE\u4E86\u3002');
    });

    function appendMsg(role, text) {
        var msgArea = chatPanel.querySelector('.ai-chat-messages');
        var div = document.createElement('div');
        div.className = 'ai-msg ai-msg-' + role;
        div.textContent = text;
        msgArea.appendChild(div);
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    async function sendMessage(userText) {
        var cfg = loadChatConfig();
        if (!cfg.apiKey) {
            appendMsg('bot', '\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u914D\u7F6E API Key');
            return;
        }
        appendMsg('user', userText);
        messages.push({ role: 'user', content: userText });

        // Build system context
        var systemMsg = '\u4F60\u662F\u4E00\u4E2A AI \u5B66\u4E60\u52A9\u6559\uFF0C\u5E2E\u52A9\u7528\u6237\u7406\u89E3\u4EBA\u5DE5\u667A\u80FD\u7684\u6982\u5FF5\u3001\u6280\u672F\u548C\u5E94\u7528\u3002\u7528\u7B80\u6D01\u6613\u61C2\u7684\u4E2D\u6587\u56DE\u7B54\uFF0C\u9002\u5F53\u4F7F\u7528\u7C7B\u6BD4\u548C\u4F8B\u5B50\u3002';

        // Add page context
        var currentTab = document.querySelector('.tab-item.active');
        if (currentTab) {
            systemMsg += ' \u7528\u6237\u5F53\u524D\u6B63\u5728\u67E5\u770B\u300C' + currentTab.textContent.trim() + '\u300D\u6A21\u5757\u3002';
        }

        var body = {
            model: cfg.model,
            messages: [{ role: 'system', content: systemMsg }].concat(messages.slice(-10)),
            max_tokens: 1000,
            temperature: 0.7
        };

        appendMsg('bot', '\u2699\uFE0F \u601D\u8003\u4E2D...');

        try {
            var resp = await fetch(cfg.baseUrl + '/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
                body: JSON.stringify(body)
            });
            var result = await resp.json();
            // Remove thinking indicator
            var msgArea = chatPanel.querySelector('.ai-chat-messages');
            msgArea.removeChild(msgArea.lastChild);

            if (result.choices && result.choices[0]) {
                var reply = result.choices[0].message.content;
                messages.push({ role: 'assistant', content: reply });
                appendMsg('bot', reply);
            } else if (result.error) {
                appendMsg('bot', '\u274C \u9519\u8BEF: ' + (result.error.message || JSON.stringify(result.error)));
            } else {
                appendMsg('bot', '\u274C \u672A\u77E5\u54CD\u5E94\u683C\u5F0F');
            }
        } catch (err) {
            var msgArea2 = chatPanel.querySelector('.ai-chat-messages');
            if (msgArea2.lastChild) msgArea2.removeChild(msgArea2.lastChild);
            appendMsg('bot', '\u274C \u7F51\u7EDC\u9519\u8BEF: ' + err.message);
        }
    }

    // Send on click or Enter
    chatPanel.querySelector('.ai-chat-send').addEventListener('click', function() {
        var input = chatPanel.querySelector('.ai-chat-input');
        var text = input.value.trim();
        if (!text) return;
        input.value = '';
        sendMessage(text);
    });
    chatPanel.querySelector('.ai-chat-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatPanel.querySelector('.ai-chat-send').click();
        }
    });
})();


// ========== Feature: 跨设备数据同步 ==========
const SYNC_ALL_KEYS = ['ai-toolkit-data', 'ai-toolkit-checkin', 'ai-toolkit-favorites', 'ai-toolkit-comments', 'ai-toolkit-chat-config'];

function exportAllData() {
    var exportObj = {};
    SYNC_ALL_KEYS.forEach(function(key) {
        var val = localStorage.getItem(key);
        if (val) exportObj[key] = val;
    });
    // Also export idea validations
    for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.startsWith('ai-toolkit-idea-validation-')) {
            exportObj[k] = localStorage.getItem(k);
        }
    }
    return JSON.stringify(exportObj);
}

function importAllData(jsonStr) {
    try {
        var obj = JSON.parse(jsonStr);
        var count = 0;
        Object.keys(obj).forEach(function(key) {
            if (key.startsWith('ai-toolkit-')) {
                localStorage.setItem(key, obj[key]);
                count++;
            }
        });
        return count;
    } catch(e) {
        return -1;
    }
}

// openSyncPanel is defined below (enhanced version with tabs)
// injectSyncButton removed — now using AssistiveTouch FAB



// ========== Enhanced Sync Panel (replaces old openSyncPanel) ==========
function openSyncPanel() {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.alignItems = 'center';
    overlay.innerHTML = '<div class="modal" style="max-width:520px;border-radius:16px;">' +
        '<div class="modal-header">' +
        '<h3>\uD83D\uDD04 \u8DE8\u8BBE\u5907\u6570\u636E\u540C\u6B65</h3>' +
        '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">\u2715</button>' +
        '</div>' +
        '<div class="modal-body">' +

        // Tab navigation
        '<div class="sync-tabs">' +
        '<button class="sync-tab active" data-tab="clipboard">\uD83D\uDCCB \u526A\u8D34\u677F</button>' +
        '<button class="sync-tab" data-tab="file">\uD83D\uDCC1 \u6587\u4EF6</button>' +
        '<button class="sync-tab" data-tab="webdav">\u2601\uFE0F WebDAV</button>' +
        '<button class="sync-tab" data-tab="qrcode">\uD83D\uDCF1 \u4E8C\u7EF4\u7801</button>' +
        '</div>' +

        // Tab: Clipboard (original)
        '<div class="sync-tab-content active" data-content="clipboard">' +
        '<div class="sync-section">' +
        '<h3 style="font-size:14px;margin-bottom:8px;">\u2B06\uFE0F \u5BFC\u51FA\u6570\u636E</h3>' +
        '<p style="font-size:12px;color:#888;margin-bottom:8px;">\u590D\u5236 JSON \u6587\u672C\uFF0C\u53D1\u9001\u7ED9\u76EE\u6807\u8BBE\u5907\uFF08\u5FAE\u4FE1/\u5907\u5FD8\u5F55/AirDrop\uFF09</p>' +
        '<textarea class="sync-export-area" readonly rows="3" style="width:100%;font-size:11px;font-family:monospace;border:1px solid #ddd;border-radius:6px;padding:8px;resize:none;background:#f9f9f9;"></textarea>' +
        '<button class="sync-copy-btn sync-btn-action">\uD83D\uDCCB \u590D\u5236\u5230\u526A\u8D34\u677F</button>' +
        '</div>' +
        '<div class="sync-section" style="margin-top:16px;padding-top:12px;border-top:1px solid #eee;">' +
        '<h3 style="font-size:14px;margin-bottom:8px;">\u2B07\uFE0F \u5BFC\u5165\u6570\u636E</h3>' +
        '<textarea class="sync-import-area" rows="3" placeholder="\u7C98\u8D34\u4ECE\u5176\u4ED6\u8BBE\u5907\u5BFC\u51FA\u7684 JSON..." style="width:100%;font-size:11px;font-family:monospace;border:1px solid #ddd;border-radius:6px;padding:8px;resize:none;"></textarea>' +
        '<button class="sync-import-btn sync-btn-action">\uD83D\uDCE5 \u5BFC\u5165\u5E76\u8986\u76D6</button>' +
        '<div class="sync-result"></div>' +
        '</div>' +
        '</div>' +

        // Tab: File export/import
        '<div class="sync-tab-content" data-content="file">' +
        '<div class="sync-section">' +
        '<h3 style="font-size:14px;margin-bottom:8px;">\u2B06\uFE0F \u5BFC\u51FA\u4E3A\u6587\u4EF6</h3>' +
        '<p style="font-size:12px;color:#888;margin-bottom:8px;">\u4E0B\u8F7D .json \u6587\u4EF6\uFF0C\u53EF\u901A\u8FC7 AirDrop/iCloud/USB \u4F20\u5230\u5176\u4ED6\u8BBE\u5907</p>' +
        '<button class="sync-file-export sync-btn-action">\uD83D\uDCBE \u4E0B\u8F7D\u5907\u4EFD\u6587\u4EF6</button>' +
        '</div>' +
        '<div class="sync-section" style="margin-top:16px;padding-top:12px;border-top:1px solid #eee;">' +
        '<h3 style="font-size:14px;margin-bottom:8px;">\u2B07\uFE0F \u4ECE\u6587\u4EF6\u5BFC\u5165</h3>' +
        '<p style="font-size:12px;color:#888;margin-bottom:8px;">\u9009\u62E9\u4E4B\u524D\u5BFC\u51FA\u7684 .json \u6587\u4EF6</p>' +
        '<input type="file" class="sync-file-input" accept=".json" style="font-size:13px;" />' +
        '<div class="sync-result"></div>' +
        '</div>' +
        '</div>' +

        // Tab: WebDAV
        '<div class="sync-tab-content" data-content="webdav">' +
        '<div class="sync-section">' +
        '<p style="font-size:12px;color:#888;margin-bottom:12px;">\u8FDE\u63A5\u4F60\u7684\u79C1\u4EBA WebDAV \u670D\u52A1\u5668\uFF08\u5982 NAS/\u5766\u514B/Nextcloud\uFF09\u5B9E\u73B0\u81EA\u52A8\u540C\u6B65</p>' +
        '<div class="sync-form-row"><label>WebDAV URL</label><input type="text" class="webdav-url" placeholder="https://your-nas.com/dav/ai-toolkit/" /></div>' +
        '<div class="sync-form-row"><label>\u7528\u6237\u540D</label><input type="text" class="webdav-user" placeholder="username" /></div>' +
        '<div class="sync-form-row"><label>\u5BC6\u7801</label><input type="password" class="webdav-pass" placeholder="password" /></div>' +
        '<div style="display:flex;gap:8px;margin-top:12px;">' +
        '<button class="webdav-save sync-btn-action">\u4FDD\u5B58\u914D\u7F6E</button>' +
        '<button class="webdav-push sync-btn-action">\u2B06\uFE0F \u4E0A\u4F20</button>' +
        '<button class="webdav-pull sync-btn-action">\u2B07\uFE0F \u62C9\u53D6</button>' +
        '</div>' +
        '<div class="sync-result"></div>' +
        '<div style="margin-top:12px;padding:10px;background:#f9f9f9;border-radius:6px;font-size:11px;color:#666;">' +
        '<strong>\u63A8\u8350\u65B9\u6848\uFF1A</strong><br>' +
        '\u2022 \u5BB6\u91CC\u6709 NAS\uFF1A\u5F00\u542F WebDAV \u670D\u52A1\uFF0C\u586B\u5165\u5730\u5740<br>' +
        '\u2022 Nextcloud/\u5766\u514B\uFF1A\u5185\u7F6E WebDAV \u652F\u6301<br>' +
        '\u2022 \u79C1\u4EBA\u670D\u52A1\u5668\uFF1A\u90E8\u7F72 nginx + webdav \u6A21\u5757<br>' +
        '\u2022 \u6CE8\u610F\uFF1A\u670D\u52A1\u5668\u9700\u5F00\u542F CORS \u5141\u8BB8\u8DE8\u57DF\u8BF7\u6C42' +
        '</div>' +
        '</div>' +
        '</div>' +

        // Tab: QR Code
        '<div class="sync-tab-content" data-content="qrcode">' +
        '<div class="sync-section">' +
        '<p style="font-size:12px;color:#888;margin-bottom:12px;">\u751F\u6210\u4E8C\u7EF4\u7801\uFF0C\u7528\u53E6\u4E00\u53F0\u8BBE\u5907\u626B\u7801\u5BFC\u5165\u6570\u636E\uFF08\u9002\u5408\u6570\u636E\u91CF\u8F83\u5C0F\u65F6\uFF09</p>' +
        '<div class="qr-container" style="text-align:center;padding:16px;">' +
        '<canvas class="qr-canvas" style="max-width:200px;max-height:200px;"></canvas>' +
        '<p class="qr-status" style="font-size:11px;color:#888;margin-top:8px;"></p>' +
        '</div>' +
        '<button class="qr-generate sync-btn-action">\u751F\u6210\u540C\u6B65\u4E8C\u7EF4\u7801</button>' +
        '<div style="margin-top:12px;padding:10px;background:#f9f9f9;border-radius:6px;font-size:11px;color:#666;">' +
        '<strong>\u4F7F\u7528\u65B9\u6CD5\uFF1A</strong><br>' +
        '1. \u5728\u6E90\u8BBE\u5907\u70B9\u51FB\u201C\u751F\u6210\u4E8C\u7EF4\u7801\u201D<br>' +
        '2. \u7528\u76EE\u6807\u8BBE\u5907\u7684\u76F8\u673A\u626B\u63CF\u4E8C\u7EF4\u7801<br>' +
        '3. \u5728\u76EE\u6807\u8BBE\u5907\u4E0A\u6253\u5F00\u94FE\u63A5\u5E76\u786E\u8BA4\u5BFC\u5165<br>' +
        '<br>\u26A0\uFE0F \u6CE8\u610F\uFF1A\u4E8C\u7EF4\u7801\u5BB9\u91CF\u6709\u9650\uFF08\u7EA6 4KB\uFF09\uFF0C\u5982\u679C\u6570\u636E\u592A\u5927\u8BF7\u7528\u6587\u4EF6\u6216 WebDAV \u65B9\u5F0F' +
        '</div>' +
        '</div>' +
        '</div>' +

        '</div></div>';

    document.body.appendChild(overlay);

    // Tab switching
    overlay.querySelectorAll('.sync-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            overlay.querySelectorAll('.sync-tab').forEach(function(t) { t.classList.remove('active'); });
            overlay.querySelectorAll('.sync-tab-content').forEach(function(c) { c.classList.remove('active'); });
            tab.classList.add('active');
            overlay.querySelector('.sync-tab-content[data-content="' + tab.dataset.tab + '"]').classList.add('active');
        });
    });

    // === Clipboard Tab ===
    var exportArea = overlay.querySelector('.sync-export-area');
    exportArea.value = exportAllData();

    overlay.querySelector('.sync-copy-btn').addEventListener('click', function() {
        exportArea.select();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(exportArea.value).then(function() {
                overlay.querySelector('.sync-copy-btn').textContent = '\u2705 \u5DF2\u590D\u5236';
                setTimeout(function() { overlay.querySelector('.sync-copy-btn').textContent = '\uD83D\uDCCB \u590D\u5236\u5230\u526A\u8D34\u677F'; }, 2000);
            });
        } else {
            document.execCommand('copy');
            overlay.querySelector('.sync-copy-btn').textContent = '\u2705 \u5DF2\u590D\u5236';
        }
    });

    overlay.querySelector('.sync-import-btn').addEventListener('click', function() {
        var text = overlay.querySelector('.sync-import-area').value.trim();
        if (!text) return;
        var result = importAllData(text);
        var rd = overlay.querySelector('.sync-tab-content[data-content="clipboard"] .sync-result');
        rd.innerHTML = result === -1
            ? '<span style="color:red;font-size:12px;">\u274C \u683C\u5F0F\u9519\u8BEF</span>'
            : '<span style="color:green;font-size:12px;">\u2705 \u5BFC\u5165 ' + result + ' \u6761\uFF0C\u5237\u65B0\u751F\u6548</span>';
    });

    // === File Tab ===
    overlay.querySelector('.sync-file-export').addEventListener('click', function() {
        var data = exportAllData();
        var blob = new Blob([data], {type: 'application/json'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'ai-toolkit-backup-' + new Date().toISOString().slice(0,10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    overlay.querySelector('.sync-file-input').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            var result = importAllData(ev.target.result);
            var rd = overlay.querySelector('.sync-tab-content[data-content="file"] .sync-result');
            rd.innerHTML = result === -1
                ? '<span style="color:red;font-size:12px;">\u274C \u6587\u4EF6\u683C\u5F0F\u9519\u8BEF</span>'
                : '<span style="color:green;font-size:12px;">\u2705 \u5BFC\u5165 ' + result + ' \u6761\uFF0C\u5237\u65B0\u751F\u6548</span>';
        };
        reader.readAsText(file);
    });

    // === WebDAV Tab ===
    var webdavCfg = {};
    try { webdavCfg = JSON.parse(localStorage.getItem('ai-toolkit-webdav-config')) || {}; } catch(e) {}
    if (webdavCfg.url) overlay.querySelector('.webdav-url').value = webdavCfg.url;
    if (webdavCfg.user) overlay.querySelector('.webdav-user').value = webdavCfg.user;
    if (webdavCfg.pass) overlay.querySelector('.webdav-pass').value = webdavCfg.pass;

    overlay.querySelector('.webdav-save').addEventListener('click', function() {
        var cfg = {
            url: overlay.querySelector('.webdav-url').value.trim(),
            user: overlay.querySelector('.webdav-user').value.trim(),
            pass: overlay.querySelector('.webdav-pass').value.trim()
        };
        localStorage.setItem('ai-toolkit-webdav-config', JSON.stringify(cfg));
        var rd = overlay.querySelector('.sync-tab-content[data-content="webdav"] .sync-result');
        rd.innerHTML = '<span style="color:green;font-size:12px;">\u2705 \u914D\u7F6E\u5DF2\u4FDD\u5B58</span>';
    });

    overlay.querySelector('.webdav-push').addEventListener('click', async function() {
        var cfg = { url: overlay.querySelector('.webdav-url').value.trim(), user: overlay.querySelector('.webdav-user').value.trim(), pass: overlay.querySelector('.webdav-pass').value.trim() };
        var rd = overlay.querySelector('.sync-tab-content[data-content="webdav"] .sync-result');
        if (!cfg.url) { rd.innerHTML = '<span style="color:red;font-size:12px;">\u8BF7\u586B\u5199 WebDAV URL</span>'; return; }
        rd.innerHTML = '<span style="font-size:12px;color:#888;">\u2B06\uFE0F \u4E0A\u4F20\u4E2D...</span>';
        try {
            var data = exportAllData();
            var resp = await fetch(cfg.url + 'ai-toolkit-sync.json', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(cfg.user + ':' + cfg.pass) },
                body: data
            });
            if (resp.ok || resp.status === 201 || resp.status === 204) {
                rd.innerHTML = '<span style="color:green;font-size:12px;">\u2705 \u4E0A\u4F20\u6210\u529F\uFF01</span>';
            } else {
                rd.innerHTML = '<span style="color:red;font-size:12px;">\u274C \u4E0A\u4F20\u5931\u8D25: HTTP ' + resp.status + '</span>';
            }
        } catch(err) {
            rd.innerHTML = '<span style="color:red;font-size:12px;">\u274C \u7F51\u7EDC\u9519\u8BEF: ' + err.message + '</span>';
        }
    });

    overlay.querySelector('.webdav-pull').addEventListener('click', async function() {
        var cfg = { url: overlay.querySelector('.webdav-url').value.trim(), user: overlay.querySelector('.webdav-user').value.trim(), pass: overlay.querySelector('.webdav-pass').value.trim() };
        var rd = overlay.querySelector('.sync-tab-content[data-content="webdav"] .sync-result');
        if (!cfg.url) { rd.innerHTML = '<span style="color:red;font-size:12px;">\u8BF7\u586B\u5199 WebDAV URL</span>'; return; }
        rd.innerHTML = '<span style="font-size:12px;color:#888;">\u2B07\uFE0F \u62C9\u53D6\u4E2D...</span>';
        try {
            var resp = await fetch(cfg.url + 'ai-toolkit-sync.json', {
                method: 'GET',
                headers: { 'Authorization': 'Basic ' + btoa(cfg.user + ':' + cfg.pass) }
            });
            if (!resp.ok) { rd.innerHTML = '<span style="color:red;font-size:12px;">\u274C HTTP ' + resp.status + '</span>'; return; }
            var text = await resp.text();
            var result = importAllData(text);
            rd.innerHTML = result === -1
                ? '<span style="color:red;font-size:12px;">\u274C \u8FDC\u7A0B\u6570\u636E\u683C\u5F0F\u9519\u8BEF</span>'
                : '<span style="color:green;font-size:12px;">\u2705 \u62C9\u53D6\u6210\u529F\uFF0C\u5BFC\u5165 ' + result + ' \u6761\uFF0C\u5237\u65B0\u751F\u6548</span>';
        } catch(err) {
            rd.innerHTML = '<span style="color:red;font-size:12px;">\u274C \u7F51\u7EDC\u9519\u8BEF: ' + err.message + '</span>';
        }
    });

    // === QR Code Tab ===
    overlay.querySelector('.qr-generate').addEventListener('click', function() {
        var data = exportAllData();
        var canvas = overlay.querySelector('.qr-canvas');
        var status = overlay.querySelector('.qr-status');
        // Check data size (QR code limit ~4KB for binary, ~7KB for alphanumeric)
        if (data.length > 4000) {
            // Compress: only export core data (skip chat config and large validations)
            var compactObj = {};
            var full = JSON.parse(data);
            ['ai-toolkit-data', 'ai-toolkit-checkin', 'ai-toolkit-favorites'].forEach(function(k) {
                if (full[k]) compactObj[k] = full[k];
            });
            data = JSON.stringify(compactObj);
        }
        if (data.length > 4000) {
            status.textContent = '\u26A0\uFE0F \u6570\u636E\u592A\u5927 (' + Math.round(data.length/1024) + 'KB)\uFF0C\u8BF7\u7528\u6587\u4EF6\u6216 WebDAV \u65B9\u5F0F';
            status.style.color = '#e53e3e';
            return;
        }
        // Generate QR using a simple data URI scheme
        // Since we can't use external libraries, we'll create a shareable text URL
        var encoded = encodeURIComponent(data);
        var shareUrl = 'data:text/plain;charset=utf-8,' + encoded;
        // Use simple visual representation
        status.textContent = '\u2705 \u6570\u636E\u5DF2\u51C6\u5907 (' + Math.round(data.length/1024*10)/10 + 'KB)';
        status.style.color = '#38a169';
        // Draw a placeholder and provide share action
        var ctx = canvas.getContext('2d');
        canvas.width = 200; canvas.height = 200;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#333';
        ctx.font = '13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u5206\u4EAB', 100, 90);
        ctx.fillText('\u6216\u4F7F\u7528\u5176\u4ED6\u65B9\u5F0F\u4F20\u8F93', 100, 110);

        // Add a share button below
        var shareBtn = overlay.querySelector('.qr-share-btn');
        if (!shareBtn) {
            shareBtn = document.createElement('button');
            shareBtn.className = 'qr-share-btn sync-btn-action';
            shareBtn.textContent = '\uD83D\uDCE4 \u8C03\u7528\u7CFB\u7EDF\u5206\u4EAB';
            shareBtn.style.marginTop = '8px';
            overlay.querySelector('.sync-tab-content[data-content="qrcode"] .sync-section').appendChild(shareBtn);
        }
        shareBtn.onclick = function() {
            if (navigator.share) {
                navigator.share({
                    title: 'AI Toolkit \u6570\u636E\u5907\u4EFD',
                    text: data
                }).catch(function() {});
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(data).then(function() {
                    status.textContent = '\u2705 \u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\uFF0C\u53BB\u76EE\u6807\u8BBE\u5907\u7C98\u8D34\u5373\u53EF';
                });
            }
        };
    });

    // Close on backdrop
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
}



// ========== Unified AssistiveTouch FAB ==========
// Replaces individual floating buttons (search, AI chat, sync) with one draggable ball
(function initAssistiveTouch() {
    // Remove old floating buttons if they exist
    var oldSearchBtn = document.querySelector('.global-search-btn');
    if (oldSearchBtn) oldSearchBtn.remove();
    var oldChatFab = document.querySelector('.ai-chat-fab');
    if (oldChatFab) oldChatFab.remove();
    var oldSyncBtn = document.querySelector('.sync-btn');
    if (oldSyncBtn) oldSyncBtn.remove();

    // Create the main FAB
    var fab = document.createElement('div');
    fab.className = 'assistive-touch';
    fab.innerHTML = '<div class="at-dot"></div>';
    document.body.appendChild(fab);

    // Create menu
    var menu = document.createElement('div');
    menu.className = 'at-menu';
menu.innerHTML = '<div class="at-menu-item" data-action="search"><span class="at-icon">\uD83D\uDD0D</span><span class="at-label">\u641C\u7D22</span></div>' +
'<div class="at-menu-item" data-action="ai"><span class="at-icon">\uD83E\uDD16</span><span class="at-label">\u52A9\u6559</span></div>' +
'<div class="at-menu-item" data-action="knowledge"><span class="at-icon">\uD83E\uDDE0</span><span class="at-label">\u77E5\u8BC6\u704C\u6CE8</span></div>' +
'<div class="at-menu-item" data-action="sync"><span class="at-icon">\uD83D\uDD04</span><span class="at-label">\u540C\u6B65</span></div>' +
'<div class="at-menu-item" data-action="favorites"><span class="at-icon">\u2764</span><span class="at-label">\u6536\u85CF</span></div>';
    document.body.appendChild(menu);

    // State
    var isMenuOpen = false;
    var isDragging = false;
    var dragStarted = false;
    var startX = 0, startY = 0;
    var fabX = window.innerWidth - 60;
    var fabY = window.innerHeight - 160;

    // Load saved position
    try {
        var savedPos = JSON.parse(localStorage.getItem('ai-toolkit-fab-pos'));
        if (savedPos) { fabX = savedPos.x; fabY = savedPos.y; }
    } catch(e) {}

    // Constrain position
    function constrain() {
        fabX = Math.max(0, Math.min(window.innerWidth - 48, fabX));
        fabY = Math.max(0, Math.min(window.innerHeight - 48, fabY));
    }
    constrain();
    fab.style.left = fabX + 'px';
    fab.style.top = fabY + 'px';

    // Drag handling (touch + mouse)
    function onStart(e) {
        var touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX - fabX;
        startY = touch.clientY - fabY;
        isDragging = true;
        dragStarted = false;
        fab.classList.add('dragging');
    }
    function onMove(e) {
        if (!isDragging) return;
        var touch = e.touches ? e.touches[0] : e;
        var newX = touch.clientX - startX;
        var newY = touch.clientY - startY;
        if (Math.abs(newX - fabX) > 5 || Math.abs(newY - fabY) > 5) {
            dragStarted = true;
        }
        fabX = newX;
        fabY = newY;
        constrain();
        fab.style.left = fabX + 'px';
        fab.style.top = fabY + 'px';
        e.preventDefault();
    }
    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        fab.classList.remove('dragging');
        // Snap to edge
        var midX = window.innerWidth / 2;
        if (fabX + 24 < midX) {
            fabX = 8;
        } else {
            fabX = window.innerWidth - 56;
        }
        constrain();
        fab.style.left = fabX + 'px';
        fab.style.top = fabY + 'px';
        localStorage.setItem('ai-toolkit-fab-pos', JSON.stringify({x: fabX, y: fabY}));
        // If not dragged, treat as click
        if (!dragStarted) {
            toggleMenu();
        }
    }

    fab.addEventListener('touchstart', onStart, {passive: false});
    document.addEventListener('touchmove', onMove, {passive: false});
    document.addEventListener('touchend', onEnd);
    fab.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        menu.classList.toggle('active', isMenuOpen);
        fab.classList.toggle('active', isMenuOpen);
        if (isMenuOpen) {
            positionMenu();
        }
    }

    function positionMenu() {
        var menuW = 140, menuH = 240;
        var mx = fabX;
        var my = fabY - menuH - 12;
        // If too high, show below
        if (my < 10) my = fabY + 56;
        // If too far right, shift left
        if (mx + menuW > window.innerWidth - 10) mx = window.innerWidth - menuW - 10;
        if (mx < 10) mx = 10;
        menu.style.left = mx + 'px';
        menu.style.top = my + 'px';
    }

    // Close menu on outside click
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !fab.contains(e.target) && !menu.contains(e.target)) {
            isMenuOpen = false;
            menu.classList.remove('active');
            fab.classList.remove('active');
        }
    });

    // Menu actions
    menu.addEventListener('click', function(e) {
        var item = e.target.closest('.at-menu-item');
        if (!item) return;
        var action = item.dataset.action;
        isMenuOpen = false;
        menu.classList.remove('active');
        fab.classList.remove('active');

        switch(action) {
            case 'search':
                if (typeof openGlobalSearch === 'function') openGlobalSearch();
                break;
            case 'ai':
                toggleAIChat();
                break;
            case 'knowledge':
                if (typeof openKnowledgeFeed === 'function') openKnowledgeFeed();
                break;
            case 'sync':
                openSyncPanel();
                break;
            case 'favorites':
                showFavoritesPanel();
                break;
        }
    });

    // AI Chat toggle
    function toggleAIChat() {
        var panel = document.querySelector('.ai-chat-panel');
        if (panel) {
            panel.classList.toggle('active');
        }
    }

    // Favorites panel (show tab with favorites)
    function showFavoritesPanel() {
        var favObj = {};
        try { favObj = JSON.parse(localStorage.getItem('ai-toolkit-favorites')) || {}; } catch(e) {}

        // Build flat list from {cases:[], labs:[], ideas:[], knowledge:[]}
        var items = [];
        var casesData = (typeof AI_CASES_DATA !== 'undefined') ? AI_CASES_DATA : [];
        var labData = (typeof AI_LAB_DATA !== 'undefined') ? AI_LAB_DATA : [];
        var ideasData = (typeof AI_IDEAS_DATA !== 'undefined') ? AI_IDEAS_DATA : [];

        (favObj.cases || []).forEach(function(id) {
            var c = casesData.find(function(x) { return x.id === id; });
            items.push({ id: id, title: c ? c.title : id, type: '\uD83C\uDFE2 \u6848\u4F8B', category: 'cases' });
        });
        (favObj.labs || []).forEach(function(id) {
            var l = labData.find(function(x) { return x.id === id; });
            items.push({ id: id, title: l ? l.title : id, type: '\uD83E\uDDEA \u5B9E\u9A8C\u5BA4', category: 'labs' });
        });
        (favObj.ideas || []).forEach(function(id) {
            var idea = ideasData.find(function(x) { return x.id === id; });
            items.push({ id: id, title: idea ? idea.title : id, type: '\uD83D\uDCA1 \u521B\u610F', category: 'ideas' });
        });
        (favObj.knowledge || []).forEach(function(id) {
            items.push({ id: id, title: id, type: '\uD83D\uDCD6 \u77E5\u8BC6\u70B9', category: 'knowledge' });
        });

        if (items.length === 0) {
            showToast('\u8FD8\u6CA1\u6709\u6536\u85CF\u5185\u5BB9');
            return;
        }

        var favOverlay = document.createElement('div');
        favOverlay.className = 'modal-overlay active';
        favOverlay.style.alignItems = 'center';
        favOverlay.innerHTML = '<div class="modal" style="max-width:400px;border-radius:16px;">' +
            '<div class="modal-header"><h3>\u2764\uFE0F \u6211\u7684\u6536\u85CF (' + items.length + ')</h3>' +
            '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()">\u2715</button></div>' +
            '<div class="modal-body"><div class="fav-list-modal">' +
            items.map(function(f) {
                return '<div class="fav-item-modal" data-id="' + f.id + '" data-cat="' + f.category + '" style="padding:12px 0;border-bottom:1px solid #f0f0f0;cursor:pointer;">' +
                    '<div style="font-size:13px;font-weight:500;color:#111;">' + f.title + '</div>' +
                    '<div style="font-size:11px;color:#888;margin-top:3px;">' + f.type + '</div></div>';
            }).join('') +
            '</div></div></div>';
        document.body.appendChild(favOverlay);
        favOverlay.addEventListener('click', function(e) {
            if (e.target === favOverlay) { favOverlay.remove(); return; }
            var item = e.target.closest('.fav-item-modal');
            if (!item) return;
            var id = item.dataset.id;
            var cat = item.dataset.cat;
            favOverlay.remove();
            // Navigate to the item
            if (cat === 'cases') {
                document.querySelectorAll('.tab-item')[2].click();
                setTimeout(function() { if (typeof showCaseDetail === 'function') showCaseDetail(id); }, 200);
            } else if (cat === 'labs') {
                document.querySelectorAll('.tab-item')[3].click();
                setTimeout(function() { if (typeof showLabDetail === 'function') showLabDetail(id); }, 200);
            } else if (cat === 'ideas') {
                document.querySelectorAll('.tab-item')[4].click();
                setTimeout(function() { if (typeof showIdeaDetail === 'function') showIdeaDetail(id); }, 200);
            }
        });
    }

    function showToast(msg) {
        var t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 20px;border-radius:20px;font-size:13px;z-index:10000;';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function() { t.remove(); }, 2000);
    }

    // Window resize
    window.addEventListener('resize', function() {
        constrain();
        fab.style.left = fabX + 'px';
        fab.style.top = fabY + 'px';
    });
})();


// ========== Feature: 知识灌注模块 ==========
(function() {
    const FEED_STORAGE_KEY = 'ai-toolkit-knowledge-feed';

    function loadFeedProgress() {
        try {
            return JSON.parse(localStorage.getItem(FEED_STORAGE_KEY)) || {};
        } catch(e) { return {}; }
    }

    function saveFeedProgress(data) {
        localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(data));
    }

    function getTypeIcon(type) {
        if (type === 'book') return '◇';
        if (type === 'podcast') return '○';
        if (type === 'video') return '△';
        return '□';
    }

    function getTypeLabel(type) {
        if (type === 'book') return '书籍';
        if (type === 'podcast') return '播客';
        if (type === 'video') return '视频';
        return '资源';
    }

    function getDifficultyLabel(d) {
        if (d === 'beginner') return '入门';
        if (d === 'intermediate') return '进阶';
        if (d === 'advanced') return '高级';
        return d;
    }

    function getDifficultyColor(d) {
        if (d === 'beginner') return '#16a34a';
        if (d === 'intermediate') return '#d97706';
        if (d === 'advanced') return '#dc2626';
        return '#71717a';
    }

    window.openKnowledgeFeed = function() {
        if (typeof AI_KNOWLEDGE_FEED === 'undefined' || !AI_KNOWLEDGE_FEED.length) {
            showToast('知识灌注数据加载中...');
            return;
        }

        var progress = loadFeedProgress();
        var digestedCount = Object.keys(progress).filter(function(k) { return progress[k].digested; }).length;
        var totalCount = AI_KNOWLEDGE_FEED.length;

        // Build filter tabs
        var activeFilter = 'all';
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.alignItems = 'stretch';
        overlay.style.padding = '0';

        function renderFeedList(filter) {
            var items = AI_KNOWLEDGE_FEED;
            if (filter !== 'all') {
                items = items.filter(function(item) { return item.type === filter; });
            }

            var listHTML = items.map(function(item) {
                var isDigested = progress[item.id] && progress[item.id].digested;
                return '<div class="kf-card' + (isDigested ? ' digested' : '') + '" data-id="' + item.id + '">' +
                    '<div class="kf-card-left">' +
                        '<div class="kf-card-emoji">' + item.coverEmoji + '</div>' +
                    '</div>' +
                    '<div class="kf-card-body">' +
                        '<div class="kf-card-title">' + item.title + '</div>' +
                        '<div class="kf-card-meta">' +
                            '<span class="kf-type-badge">' + getTypeIcon(item.type) + ' ' + getTypeLabel(item.type) + '</span>' +
                            '<span class="kf-author">' + item.author + '</span>' +
                            '<span class="kf-year">' + item.year + '</span>' +
                        '</div>' +
                        '<div class="kf-card-oneliner">' + item.oneLiner + '</div>' +
                        '<div class="kf-card-tags">' +
                            item.tags.map(function(t) { return '<span class="kf-tag">' + t + '</span>'; }).join('') +
                        '</div>' +
                    '</div>' +
                    '<div class="kf-card-right">' +
                        '<span class="kf-difficulty" style="color:' + getDifficultyColor(item.difficulty) + '">' + getDifficultyLabel(item.difficulty) + '</span>' +
                        (isDigested ? '<span class="kf-check">✓</span>' : '') +
                    '</div>' +
                '</div>';
            }).join('');

            return listHTML;
        }

        overlay.innerHTML =
            '<div class="kf-panel">' +
                '<div class="kf-header">' +
                    '<div class="kf-header-top">' +
                        '<h2 class="kf-title">知识灌注</h2>' +
                        '<button class="modal-close kf-close">✕</button>' +
                    '</div>' +
                    '<div class="kf-subtitle">精选书籍 · 播客 · 视频的精华提炼，帮你快速建立 AI 认知</div>' +
                    '<div class="kf-progress-bar">' +
                        '<div class="kf-progress-fill" style="width:' + (totalCount > 0 ? Math.round(digestedCount / totalCount * 100) : 0) + '%"></div>' +
                    '</div>' +
                    '<div class="kf-progress-text">已消化 ' + digestedCount + ' / ' + totalCount + ' 个资源</div>' +
                    '<div class="kf-filters">' +
                        '<button class="kf-filter active" data-filter="all">全部</button>' +
                        '<button class="kf-filter" data-filter="book">书籍</button>' +
                        '<button class="kf-filter" data-filter="podcast">播客</button>' +
                        '<button class="kf-filter" data-filter="video">视频</button>' +
                    '</div>' +
                '</div>' +
                '<div class="kf-list">' + renderFeedList('all') + '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // Filter events
        overlay.querySelectorAll('.kf-filter').forEach(function(btn) {
            btn.addEventListener('click', function() {
                overlay.querySelectorAll('.kf-filter').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                activeFilter = btn.dataset.filter;
                overlay.querySelector('.kf-list').innerHTML = renderFeedList(activeFilter);
            });
        });

        // Card click → open detail
        overlay.querySelector('.kf-list').addEventListener('click', function(e) {
            var card = e.target.closest('.kf-card');
            if (!card) return;
            var id = card.dataset.id;
            var item = AI_KNOWLEDGE_FEED.find(function(x) { return x.id === id; });
            if (item) openKnowledgeDetail(item, overlay);
        });

        // Close
        overlay.querySelector('.kf-close').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    };

    function openKnowledgeDetail(item, parentOverlay) {
        var progress = loadFeedProgress();
        var isDigested = progress[item.id] && progress[item.id].digested;

        var detailOverlay = document.createElement('div');
        detailOverlay.className = 'modal-overlay active';
        detailOverlay.style.alignItems = 'stretch';
        detailOverlay.style.padding = '0';
        detailOverlay.style.zIndex = '10002';

        detailOverlay.innerHTML =
            '<div class="kf-detail-panel">' +
                '<div class="kf-detail-header">' +
                    '<button class="kf-back">← 返回</button>' +
                    '<button class="modal-close kf-detail-close">✕</button>' +
                '</div>' +
                '<div class="kf-detail-body">' +
                    '<div class="kf-detail-hero">' +
                        '<div class="kf-detail-emoji">' + item.coverEmoji + '</div>' +
                        '<div class="kf-detail-info">' +
                            '<h2 class="kf-detail-title">' + item.title + '</h2>' +
                            '<div class="kf-detail-meta">' + item.author + ' · ' + item.year + ' · ' +
                                '<span style="color:' + getDifficultyColor(item.difficulty) + '">' + getDifficultyLabel(item.difficulty) + '</span></div>' +
                            '<div class="kf-detail-tags">' + item.tags.map(function(t) { return '<span class="kf-tag">' + t + '</span>'; }).join('') + '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="kf-detail-section">' +
                        '<div class="kf-section-title">概述</div>' +
                        '<div class="kf-section-content">' + item.summary + '</div>' +
                    '</div>' +

                    '<div class="kf-detail-section">' +
                        '<div class="kf-section-title">核心要点</div>' +
                        '<div class="kf-takeaways">' +
                            item.keyTakeaways.map(function(t, i) {
                                return '<div class="kf-takeaway"><span class="kf-takeaway-num">' + (i+1) + '</span><span class="kf-takeaway-text">' + t + '</span></div>';
                            }).join('') +
                        '</div>' +
                    '</div>' +

                    '<div class="kf-detail-section">' +
                        '<div class="kf-section-title">关键概念</div>' +
                        '<div class="kf-concepts">' +
                            item.concepts.map(function(c) { return '<span class="kf-concept-chip">' + c + '</span>'; }).join('') +
                        '</div>' +
                    '</div>' +

                    '<div class="kf-detail-section">' +
                        '<div class="kf-section-title">金句</div>' +
                        '<div class="kf-quotes">' +
                            item.goldQuotes.map(function(q) { return '<div class="kf-quote">' + q + '</div>'; }).join('') +
                        '</div>' +
                    '</div>' +

                    '<div class="kf-detail-section">' +
                        '<div class="kf-section-title">行动建议</div>' +
                        '<div class="kf-actions">' +
                            item.actionItems.map(function(a) { return '<div class="kf-action-item">→ ' + a + '</div>'; }).join('') +
                        '</div>' +
                    '</div>' +

                    (item.url ? '<div class="kf-detail-section"><a class="kf-source-link" href="' + item.url + '" target="_blank">查看原始资源 →</a></div>' : '') +

                    '<div class="kf-detail-footer">' +
                        '<button class="kf-digest-btn ' + (isDigested ? 'digested' : '') + '">' +
                            (isDigested ? '✓ 已消化' : '标记为已消化') +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(detailOverlay);

        // Digest button
        detailOverlay.querySelector('.kf-digest-btn').addEventListener('click', function() {
            progress = loadFeedProgress();
            if (progress[item.id] && progress[item.id].digested) {
                delete progress[item.id];
            } else {
                progress[item.id] = { digested: true, date: new Date().toISOString().slice(0, 10) };
            }
            saveFeedProgress(progress);
            detailOverlay.remove();
            // Refresh parent list
            if (parentOverlay && parentOverlay.parentNode) {
                parentOverlay.remove();
                openKnowledgeFeed();
            }
        });

        // Back
        detailOverlay.querySelector('.kf-back').addEventListener('click', function() { detailOverlay.remove(); });
        detailOverlay.querySelector('.kf-detail-close').addEventListener('click', function() {
            detailOverlay.remove();
            if (parentOverlay && parentOverlay.parentNode) parentOverlay.remove();
        });
        detailOverlay.addEventListener('click', function(e) { if (e.target === detailOverlay) detailOverlay.remove(); });
    }

    // Expose showToast if not already defined in this scope
    function showToast(msg) {
        var t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 20px;border-radius:20px;font-size:13px;z-index:10100;';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(function() { t.remove(); }, 2000);
    }
})();


// ========== PWA Service Worker 注册 ==========
if ('serviceWorker' in navigator) {
    if (location.protocol === 'file:') {
        // file:// 协议下，注销已有的 SW 避免旧缓存干扰
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(reg => reg.unregister());
        });
    } else {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
}
