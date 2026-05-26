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

### 2026-05-26

- 接手项目并按 agent-guide 规则补齐 `README.md` / `DEVLOG.md`
- 确认本地目录最初只有空 Git 仓库，已关联 `https://github.com/Ericcckkk/ai-toolkit.git` 并拉取 `main`
- 确认项目缺少标准 README/DEVLOG，后续接手以本文件为状态来源

