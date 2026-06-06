# AI Toolkit / AI百宝箱

AI百宝箱是一个面向个人 AI 学习、资讯跟踪和创业案例积累的轻量级 PWA。项目部署在 GitHub Pages，核心目标是跨设备访问、低维护成本和自动化内容更新。

## 当前形态

- 前端：原生 HTML/CSS/JavaScript
- 部署：GitHub Pages
- PWA：`manifest.json` + `sw.js`
- 数据：静态 JS 数据文件，位于 `data/`
- 自动化：GitHub Actions 每日抓取 AI 资讯并更新 `data/news.js`
- 同步：`sync.js` 预留 Supabase PIN 同步能力；未配置时退化为本地导入/导出

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `index.html` | 页面结构和脚本入口 |
| `styles.css` | 全局样式和移动端布局 |
| `app.js` | 主应用逻辑、页面渲染、学习进度、搜索、设置面板 |
| `sync.js` | 云同步和本地备份导入导出模块 |
| `knowledge-data.js` | 旧版/补充知识数据 |
| `data/*.js` | 知识地图、案例、实验室、Idea、资讯等数据 |
| `scripts/fetch_news.py` | 每日 AI 资讯自动抓取与 MiniMax 摘要生成脚本 |
| `.github/workflows/daily-news.yml` | 每日资讯自动更新 workflow |
| `AGENT_CONTEXT.md` | Eric 的通用产品偏好和资源约束 |
| `DEVLOG.md` | 项目交接和进度日志 |

## 本地运行

```bash
python3 -m http.server 8787
```

打开：

```text
http://localhost:8787/
```

本项目没有 npm 构建流程。除非明确需要，不要引入 React/Vue/Vite/webpack 等重型栈。

## 验证命令

```bash
node --check app.js
node --check sync.js
python3 -c "import ast,pathlib; ast.parse(pathlib.Path('scripts/fetch_news.py').read_text(encoding='utf-8'))"
curl -I http://localhost:8787/
```

## 每日资讯自动化

workflow：

```text
.github/workflows/daily-news.yml
```

运行时间：每天北京时间 08:00。

依赖 Secrets：

| Secret | 必需 | 说明 |
| --- | --- | --- |
| `MINIMAX_API_KEY` | 是 | MiniMax Token Plan API Key |
| `GNEWS_API_KEY` | 否 | 增强英文新闻源覆盖 |

脚本会从 RSS、Google/Bing News 和可选 GNews 收集素材，用 MiniMax 生成结构化摘要，并把新日期的数据写入 `data/news.js` 顶部。

当前策略：

- 前端/PWA 会在进入“每日 AI 资讯”时主动以 `no-store` 检查 `data/news.js` 最新内容，避免长期命中旧缓存
- `data/news.js` 只保留最近 30 天的数据窗口，避免静态数据文件无限增长
- 支持在 GitHub Actions 中手动补跑单日，或批量回补缺失日期/日期范围

## 数据同步

当前 `sync.js` 中 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 为空，因此云同步面板会显示离线模式。

离线模式仍支持：

- 导出学习数据为 JSON
- 从 JSON 恢复学习数据

如启用 Supabase：

1. 创建 Supabase 项目
2. 在 SQL Editor 执行 `supabase-schema.sql`
3. 配置 `sync.js` 中的 Supabase URL 和 anon key
4. 验证 PIN 登录、上传、恢复流程

## 开发规则

- 开工前先读 `AGENT_CONTEXT.md` 和 `DEVLOG.md`
- 修改前先 `git pull`
- 保持静态 PWA 和轻量实现优先
- 真实数据放在 `data/` 或接口中，不要硬编码到 HTML
- 完成独立任务后更新 `DEVLOG.md`
- commit message 使用英文 `type: description`
