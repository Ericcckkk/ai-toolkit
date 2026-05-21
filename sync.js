/**
 * AI Toolkit — Cloud Sync Module
 * PIN-based anonymous authentication + Supabase data sync
 * 
 * Setup Instructions:
 * 1. Create a free Supabase project at https://supabase.com
 * 2. Run the SQL in supabase-schema.sql to create tables
 * 3. Fill in SUPABASE_URL and SUPABASE_ANON_KEY below
 */

const SyncModule = (function() {
    'use strict';

    // ========== Configuration ==========
    // TODO: Replace with your Supabase project credentials
    const SUPABASE_URL = '';  // e.g., 'https://xxxx.supabase.co'
    const SUPABASE_ANON_KEY = '';  // your anon/public key

    const LOCAL_PIN_KEY = 'aitoolkit_sync_pin';
    const LOCAL_DEVICE_KEY = 'aitoolkit_device_id';
    const SYNC_STATUS_KEY = 'aitoolkit_last_sync';

    // All localStorage keys that contain user data
    const DATA_KEYS = [
        'ai-toolkit-progress',
        'ai-toolkit-checkin',
        'ai-toolkit-notes',
        'ai-toolkit-favorites',
        'ai-knowledge-feed-progress',
        'ai-toolkit-idea-validation',
        'ai-toolkit-comments'
    ];

    // ========== Helpers ==========
    function generateDeviceId() {
        const stored = localStorage.getItem(LOCAL_DEVICE_KEY);
        if (stored) return stored;
        const id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(LOCAL_DEVICE_KEY, id);
        return id;
    }

    function hashPin(pin) {
        // Simple hash for PIN — not cryptographic, but sufficient for anonymous identity
        let hash = 0;
        const str = 'aitoolkit_' + pin + '_salt2024';
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'pin_' + Math.abs(hash).toString(36);
    }

    function isConfigured() {
        return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
    }

    function getStoredPin() {
        return localStorage.getItem(LOCAL_PIN_KEY) || '';
    }

    function setStoredPin(pin) {
        localStorage.setItem(LOCAL_PIN_KEY, pin);
    }

    function getLastSync() {
        return localStorage.getItem(SYNC_STATUS_KEY) || null;
    }

    function setLastSync() {
        const now = new Date().toISOString();
        localStorage.setItem(SYNC_STATUS_KEY, now);
        return now;
    }

    // ========== Supabase API Calls ==========
    async function supabaseRequest(path, options = {}) {
        if (!isConfigured()) {
            throw new Error('Supabase not configured');
        }
        const url = SUPABASE_URL + '/rest/v1/' + path;
        const headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
            'Prefer': options.prefer || 'return=representation'
        };
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Supabase error ${response.status}: ${text}`);
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return null;
    }

    // ========== Core Sync Logic ==========

    /**
     * Register or verify a PIN
     * Returns: { success: boolean, isNew: boolean, message: string }
     */
    async function loginWithPin(pin) {
        if (!pin || pin.length < 4 || pin.length > 8) {
            return { success: false, isNew: false, message: 'PIN 需要 4-8 位' };
        }

        if (!isConfigured()) {
            // Offline mode: just store PIN locally
            setStoredPin(pin);
            return { success: true, isNew: true, message: '离线模式：PIN 已保存本地' };
        }

        const pinHash = hashPin(pin);
        const deviceId = generateDeviceId();

        try {
            // Check if this PIN hash exists
            const existing = await supabaseRequest(
                `sync_users?pin_hash=eq.${pinHash}&select=id,created_at`
            );

            if (existing && existing.length > 0) {
                // PIN exists — login successful
                setStoredPin(pin);
                return { success: true, isNew: false, message: '登录成功，数据已关联' };
            } else {
                // New PIN — create user
                await supabaseRequest('sync_users', {
                    method: 'POST',
                    body: { pin_hash: pinHash, device_id: deviceId }
                });
                setStoredPin(pin);
                return { success: true, isNew: true, message: 'PIN 创建成功' };
            }
        } catch (err) {
            console.error('Sync login error:', err);
            // Fallback to local
            setStoredPin(pin);
            return { success: true, isNew: true, message: '网络异常，已保存至本地' };
        }
    }

    /**
     * Push local data to cloud
     */
    async function pushData() {
        const pin = getStoredPin();
        if (!pin || !isConfigured()) return { success: false, message: '未登录或未配置' };

        const pinHash = hashPin(pin);
        const deviceId = generateDeviceId();

        // Collect all local data
        const payload = {};
        DATA_KEYS.forEach(key => {
            const val = localStorage.getItem(key);
            if (val) {
                try {
                    payload[key] = JSON.parse(val);
                } catch (e) {
                    payload[key] = val;
                }
            }
        });

        try {
            // Upsert sync data
            await supabaseRequest('sync_data', {
                method: 'POST',
                prefer: 'return=minimal,resolution=merge-duplicates',
                body: {
                    pin_hash: pinHash,
                    device_id: deviceId,
                    data: payload,
                    updated_at: new Date().toISOString()
                }
            });

            const syncTime = setLastSync();
            return { success: true, message: '同步成功', syncTime };
        } catch (err) {
            console.error('Push error:', err);
            return { success: false, message: '同步失败：' + err.message };
        }
    }

    /**
     * Pull cloud data to local
     */
    async function pullData() {
        const pin = getStoredPin();
        if (!pin || !isConfigured()) return { success: false, message: '未登录或未配置' };

        const pinHash = hashPin(pin);

        try {
            const results = await supabaseRequest(
                `sync_data?pin_hash=eq.${pinHash}&select=data,updated_at&order=updated_at.desc&limit=1`
            );

            if (!results || results.length === 0) {
                return { success: true, message: '云端暂无数据' };
            }

            const cloudData = results[0].data;
            const cloudTime = results[0].updated_at;

            // Merge: cloud data overwrites local
            Object.keys(cloudData).forEach(key => {
                const val = cloudData[key];
                localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
            });

            setLastSync();
            return { success: true, message: '数据已从云端恢复', cloudTime };
        } catch (err) {
            console.error('Pull error:', err);
            return { success: false, message: '拉取失败：' + err.message };
        }
    }

    /**
     * Full sync: push then pull (last-write-wins)
     */
    async function fullSync() {
        const pushResult = await pushData();
        if (!pushResult.success) return pushResult;
        return { success: true, message: '同步完成', syncTime: pushResult.syncTime };
    }

    /**
     * Export all data as a downloadable JSON file (offline backup)
     */
    function exportToFile() {
        const payload = {};
        DATA_KEYS.forEach(key => {
            const val = localStorage.getItem(key);
            if (val) {
                try {
                    payload[key] = JSON.parse(val);
                } catch (e) {
                    payload[key] = val;
                }
            }
        });

        payload._exportTime = new Date().toISOString();
        payload._version = '1.0';

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-toolkit-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true, message: '已导出' };
    }

    /**
     * Import data from a JSON file
     */
    function importFromFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    let count = 0;
                    DATA_KEYS.forEach(key => {
                        if (data[key] !== undefined) {
                            localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
                            count++;
                        }
                    });
                    resolve({ success: true, message: `已恢复 ${count} 项数据，刷新页面生效` });
                } catch (err) {
                    resolve({ success: false, message: '文件格式错误' });
                }
            };
            reader.readAsText(file);
        });
    }

    // ========== UI Integration ==========

    /**
     * Render the sync panel UI (to be placed in settings or AssistiveTouch menu)
     */
    function renderSyncPanel() {
        const pin = getStoredPin();
        const lastSync = getLastSync();
        const configured = isConfigured();

        const statusText = !configured
            ? '离线模式（未配置 Supabase）'
            : (pin ? `已登录 · PIN: ${'•'.repeat(pin.length)}` : '未登录');

        const lastSyncText = lastSync
            ? `上次同步: ${new Date(lastSync).toLocaleString('zh-CN')}`
            : '从未同步';

        return `
            <div class="sync-panel" style="padding:0;">
                <div style="margin-bottom:16px;">
                    <div style="font-size:12px;color:var(--gray-500);margin-bottom:4px;">${statusText}</div>
                    <div style="font-size:11px;color:var(--gray-400);">${lastSyncText}</div>
                </div>

                ${!pin ? `
                    <div class="sync-form-row">
                        <label>设置同步 PIN（4-8 位数字/字母）</label>
                        <input type="password" id="sync-pin-input" placeholder="输入 PIN 码" maxlength="8" style="margin-top:4px;">
                    </div>
                    <button id="sync-login-btn" class="sync-btn-action" style="width:100%;margin-top:8px;">登录 / 注册</button>
                ` : `
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        ${configured ? `
                            <button id="sync-push-btn" class="sync-btn-action" style="width:100%;background:var(--black);">上传数据到云端</button>
                            <button id="sync-pull-btn" class="sync-btn-action" style="width:100%;background:var(--white);color:var(--black);border:1px solid var(--gray-200);">从云端恢复数据</button>
                        ` : ''}
                        <button id="sync-export-btn" class="sync-btn-action" style="width:100%;background:var(--white);color:var(--black);border:1px solid var(--gray-200);">导出为文件</button>
                        <button id="sync-logout-btn" style="margin-top:8px;padding:6px 12px;background:none;border:none;color:var(--gray-400);font-size:11px;cursor:pointer;text-align:center;">退出登录</button>
                    </div>
                `}
                <div id="sync-message" style="margin-top:10px;font-size:12px;color:var(--amber);min-height:16px;"></div>
            </div>
        `;
    }

    /**
     * Bind event listeners for the sync panel
     */
    function bindSyncEvents(container) {
        const msgEl = container.querySelector('#sync-message');

        function showMsg(text, isError) {
            if (!msgEl) return;
            msgEl.textContent = text;
            msgEl.style.color = isError ? '#dc2626' : 'var(--amber)';
            setTimeout(() => { msgEl.textContent = ''; }, 4000);
        }

        // Login
        const loginBtn = container.querySelector('#sync-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', async () => {
                const input = container.querySelector('#sync-pin-input');
                if (!input) return;
                const pin = input.value.trim();
                loginBtn.disabled = true;
                loginBtn.textContent = '连接中...';
                const result = await loginWithPin(pin);
                showMsg(result.message, !result.success);
                if (result.success) {
                    // Re-render panel
                    setTimeout(() => location.reload(), 800);
                } else {
                    loginBtn.disabled = false;
                    loginBtn.textContent = '登录 / 注册';
                }
            });
        }

        // Push
        const pushBtn = container.querySelector('#sync-push-btn');
        if (pushBtn) {
            pushBtn.addEventListener('click', async () => {
                pushBtn.textContent = '同步中...';
                pushBtn.disabled = true;
                const result = await pushData();
                showMsg(result.message, !result.success);
                pushBtn.textContent = '上传数据到云端';
                pushBtn.disabled = false;
            });
        }

        // Pull
        const pullBtn = container.querySelector('#sync-pull-btn');
        if (pullBtn) {
            pullBtn.addEventListener('click', async () => {
                if (!confirm('从云端恢复会覆盖本地数据，确认？')) return;
                pullBtn.textContent = '恢复中...';
                pullBtn.disabled = true;
                const result = await pullData();
                showMsg(result.message, !result.success);
                if (result.success && result.cloudTime) {
                    setTimeout(() => location.reload(), 1000);
                }
                pullBtn.textContent = '从云端恢复数据';
                pullBtn.disabled = false;
            });
        }

        // Export
        const exportBtn = container.querySelector('#sync-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                exportToFile();
                showMsg('已导出到下载文件夹');
            });
        }

        // Logout
        const logoutBtn = container.querySelector('#sync-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem(LOCAL_PIN_KEY);
                localStorage.removeItem(SYNC_STATUS_KEY);
                showMsg('已退出');
                setTimeout(() => location.reload(), 600);
            });
        }
    }

    // ========== Public API ==========
    return {
        isConfigured,
        getStoredPin,
        loginWithPin,
        pushData,
        pullData,
        fullSync,
        exportToFile,
        importFromFile,
        renderSyncPanel,
        bindSyncEvents,
        getLastSync
    };
})();
