# Eric 的 AI Agent 协作指南

> 这份文档记录了我的背景、偏好和工作方式。新的 AI agent 在首次协作前请阅读。

---

## 我是谁

- 业务分析师/数据分析师背景，熟悉 SQL 和数据分析，但**不是程序员**
- 熟悉 Python 做数据处理，但前端/后端工程能力有限，需要 AI 帮我写完整代码
- 正在从公司岗位过渡到个人项目阶段，目标是构建自己的 AI 工具体系和副业
- GitHub: https://github.com/Ericcckkk

---

## 我的项目

| 项目 | 地址 | 说明 |
|------|------|------|
| AI Toolkit | ericcckkk.github.io/ai-toolkit | AI 知识学习 PWA（每日资讯、知识地图、案例库、实验室、Idea池） |
| AI 面试官 | 规划中 | 实时语音面试练习工具（MiniMax Realtime API） |
| 买房决策系统 | 本地 | 买房评估打分+信息监控 |

---

## 技术偏好

### 架构原则
- **零成本优先**：能用免费方案就不花钱（GitHub Pages > Vercel > 自有服务器 > 付费 SaaS）
- **纯前端优先**：能不上后端就不上后端，用 localStorage + JSON 静态数据
- **自动化优先**：重复性工作一律自动化（GitHub Actions、定时脚本）
- 数据通过 GitHub 仓库管理，不依赖数据库（除非必须）

### 代码风格
- 前端：原生 HTML/CSS/JS，不用框架（项目小，框架过重）
- Python：逻辑直白，不过度封装，标准库优先
- SQL：逻辑压平，拒绝层层嵌套 CTE，能 JOIN 搞定的不建中间表
- 命令行/API 优先，不用浏览器自动化

### UI 设计风格
- **极简高级感**：最多 3 种颜色，大量留白
- 手绘风 SVG 图标（stroke-based, 1.5px weight），**不用 emoji**
- 字体：Inter 或 system-ui
- 参考风格：Apple 官网、Notion、Linear

### 部署
- 静态项目 → GitHub Pages（中国免 VPN 可访问）
- 需要后端 → Cloudflare Tunnel + 轻量服务器（2C4G）
- 域名：eric-ai.top（已购）
- HTTPS：Cloudflare 自动管理，不手动搞证书

---

## 工作方式偏好

### 沟通
- 直接给方案，不要问太多确认性问题
- 如果有多个选项，给我最推荐的那个，附带简短理由
- 中文交流，代码注释可以英文
- 不要废话客套，直奔主题

### 执行
- 改完代码直接告诉我改了什么，不需要逐行解释
- 大任务先列 todo，然后一步步做
- 能一次做完的别分多次问我确认
- 文件路径用绝对路径

### 避免
- 不要用 emoji 装饰输出
- 不要过度格式化（大段 bullet points、过多加粗）
- 不要在代码里留 TODO/FIXME 然后不实现
- 不要建议我"手动去做某事"——如果能自动化就自动化

---

## 资源和账号

| 资源 | 说明 |
|------|------|
| MiniMax Token Plan | 199元/月，M2.7 模型，API Key 存在 GitHub Secrets |
| GitHub | 公开仓库放个人项目，私有仓库放敏感内容 |
| 服务器 | 2C4G 轻量云（用于需要后端的项目） |
| 域名 | eric-ai.top（Cloudflare DNS） |

---

## AI Toolkit 项目特殊说明

### 项目结构
```
ai-toolkit/
├── index.html          # 主页面
├── app.js              # 主逻辑（3400+ 行）
├── styles.css          # 样式（2400+ 行）
├── knowledge-data.js   # 知识树数据加载器
├── data/               # 所有数据文件
│   ├── news.js         # 每日资讯（自动更新）
│   ├── fundamentals.js # 知识树-基础
│   ├── llm.js          # 知识树-大模型
│   ├── applications.js # 知识树-应用
│   ├── business.js     # 知识树-商业
│   ├── tools.js        # 知识树-工具
│   ├── frontier.js     # 知识树-前沿
│   ├── cases.js        # 商业案例库
│   ├── ideas.js        # 创业Idea池
│   └── lab.js          # 应用实验室
├── scripts/
│   └── fetch_news.py   # 每日资讯自动抓取脚本
├── .github/workflows/
│   └── daily-news.yml  # GitHub Actions 定时任务
├── sync.js             # 云同步模块（Supabase，待配置）
└── sw.js               # Service Worker（PWA离线）
```

### 关键约束
- 纯静态 PWA，用 file:// 协议也能跑（无服务端依赖）
- 数据文件通过全局变量暴露（如 `const AI_NEWS_DATA = [...]`）
- 用户数据存 localStorage，键名以 `ai-toolkit-` 开头
- 三色系统：黑 #0a0a0a、白 #fafaf9、琥珀金 #b8956a
- 每日资讯由 GitHub Actions 每天自动更新，无需手动维护

### 常见迭代需求
- 往 data/ 下的 JS 文件里添加新内容（新知识点、新案例、新 Idea）
- 修改 fetch_news.py 的新闻源或 prompt
- 给模块加新功能（如播客推荐、周报总结）
- 调整 UI 细节

---

## 怎么帮我工作

1. `git clone https://github.com/Ericcckkk/ai-toolkit.git`
2. 阅读本文档了解项目
3. 我说需求，你直接改代码
4. 改完 `git push`，GitHub Pages 自动部署
5. 如果涉及 GitHub Actions，提醒我去 Secrets 加配置

就这么简单。
