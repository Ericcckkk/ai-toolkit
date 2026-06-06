# AI Toolkit / AI百宝箱 开发日志

> 给任何接手的 Agent：每次开始工作前先读此文件和 `AGENT_CONTEXT.md`；每次完成独立任务后更新此文件。不要问用户上次做到哪里，先看这里和 git log。

---

## 2026-05-26 最新状态

### 已完成

- [x] 项目已从 `Ericcckkk/ai-toolkit` 拉取到本地 `/Users/zhengyuli/Documents/AI百宝箱`
- [x] 当前为静态 PWA：`index.html` + `styles.css` + `app.js` + `data/*.js`
- [x] GitHub Actions 每日资讯自动更新已存在：`.github/workflows/daily-news.yml`
- [x] 每日资讯最近一次自动 commit 为 `2026-05-24`
- [x] MiniMax M2.7 JSON 解析相关坑已在脚本中处理过，见历史 commit `443c8cf`
- [x] 已补齐项目标准交接文档：`README.md` 和 `DEVLOG.md`

### 待做 / 已知问题

- [ ] `sync.js` 里的 Supabase 云同步配置仍为空，当前只能离线导入/导出
- [ ] 需要确认 GitHub Pages 当前线上页面是否和本地 `main` 一致
- [ ] 后续前端改动需要做桌面和手机视口检查
- [ ] 如继续强化自动化，需要检查每日资讯 workflow 是否在 2026-05-25 和 2026-05-26 正常运行

### 技术要点备忘

- 本地预览端口：`8787`
- 当前无 npm 构建流程，直接浏览器运行
- PWA 文件：`manifest.json`、`sw.js`、`icon-192.png`、`icon-512.png`
- 自动新闻脚本：`scripts/fetch_news.py`
- 新闻数据输出：`data/news.js`
- Supabase schema：`supabase-schema.sql`
- GitHub Pages 首页：`https://ai-toolkit-eosin.vercel.app` 记录在 GitHub repo homepage；实际部署方式需继续确认

### 本次基线验证

- [x] `node --check app.js`
- [x] `node --check sync.js`
- [x] `scripts/fetch_news.py` AST 语法解析
- [x] 本地静态服务 `curl -I http://localhost:8787/` 返回 200

---

## 变更历史

### 2026-06-06

- 排查每日 AI 资讯更新状态：GitHub raw、Vercel 线上和 GitHub Pages 线上 `data/news.js` 均已更新到 `2026-06-05`
- 本地仓库最初停在 `2026-05-24` 是因为未 pull；已执行 `git pull --rebase origin main`，本地同步到远端最新
- 当前本机时间为 `2026-06-06 02:06 CST`，workflow 定时是北京时间 08:00，因此 `2026-06-06` 资讯尚未到触发时间
- 已确认历史缺失日期：`2026-05-22`、`2026-05-25`、`2026-06-01`；由于未认证 REST Actions 查询被 rate limit，暂未拉取这些日期的 workflow 日志
- 修复每日资讯前端缓存问题：页面启动和点击“每日资讯”时会以 `no-store` 重新拉取 `data/news.js`；service worker 升级到 `ai-toolkit-v8`，且不再缓存 `data/news.js`
- 调整每日资讯存储策略：`scripts/fetch_news.py` 现在会在写入新一天资讯后，只保留最近 30 天的数据窗口；老数据不再无限累计
- 新增每日资讯页状态条与交互：展示最新日期、数据更新时间、上次检查时间、30 天归档窗口，并增加“检查更新”、标签筛选、按天折叠/展开
- 新增 `scripts/backfill_news.py`：支持按离散日期或日期范围批量回补缺失资讯，可在本地或 GitHub Actions 手动触发
- 扩展 `.github/workflows/daily-news.yml`：支持 `target_date`、`backfill_dates`、`backfill_start`、`backfill_end` 四类手动输入；自动化失败会创建/更新 issue，恢复成功后自动关闭
- 修正回补与 30 天窗口的边界逻辑：回补旧日期时，保留窗口现在以数据中的最新日期为准，不会因为补历史而误删更近的资讯
- 本地验证通过：`node --check app.js`、`scripts/fetch_news.py` / `scripts/backfill_news.py` AST 解析、workflow YAML 解析、`curl -I http://localhost:8787/`

### 2026-05-26

- 接手项目并按 agent-guide 规则补齐 `README.md` / `DEVLOG.md`
- 确认本地目录最初只有空 Git 仓库，已关联 `https://github.com/Ericcckkk/ai-toolkit.git` 并拉取 `main`
- 确认项目缺少标准 README/DEVLOG，后续接手以本文件为状态来源
