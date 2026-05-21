# AI Toolkit 自动化脚本

## fetch_news.py - 每日资讯自动更新

### 工作原理

1. **多源抓取**：从 6 个 RSS 源 + Google/Bing 新闻搜索获取当日 AI 领域原始新闻（60-80 条）
2. **AI 筛选**：调用 MiniMax API（M2.7 模型），从原始素材中筛选最重要的 20 条
3. **高质量摘要**：AI 按照编辑标准生成结构化摘要（事实 → 数字 → 意义）
4. **自动更新**：将结果写入 `data/news.js`，格式与现有数据完全一致
5. **自动部署**：GitHub Actions 自动 commit + push → GitHub Pages 部署

### 运行频率

- 每天北京时间 08:00 自动执行
- 也可在 GitHub Actions 页面手动触发

### 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `MINIMAX_API_KEY` | ✅ | MiniMax API Key（Token Plan 中获取） |
| `GNEWS_API_KEY` | ❌ | GNews API Key（免费注册，增加新闻源覆盖） |
| `TARGET_DATE` | ❌ | 指定目标日期（默认当天） |

### 新闻源

| 来源 | 类型 | 语言 |
|------|------|------|
| 36kr | RSS | 中文 |
| TechCrunch AI | RSS | 英文 |
| The Verge AI | RSS | 英文 |
| VentureBeat AI | RSS | 英文 |
| MIT Technology Review | RSS | 英文 |
| Hacker News | RSS | 英文 |
| Google News | 搜索 RSS | 中英文 |
| Bing News | 搜索 RSS | 中英文 |
| GNews | API（可选） | 英文 |

### 本地测试

```bash
export MINIMAX_API_KEY="your-key-here"
python scripts/fetch_news.py
```

### 费用

- GitHub Actions：免费（公开仓库无限制，私有仓库 2000 分钟/月）
- MiniMax API：每天约 1 次调用，消耗约 5000-8000 tokens，几乎可以忽略不计
- RSS/搜索源：完全免费
- GNews（可选）：免费版 100 次/天

### 故障恢复

- 如果某天抓取失败（网络问题/API 限流），当天不会更新，次日自动恢复
- 不会覆盖已有数据（同日数据已存在则跳过）
- GitHub Actions 有邮件通知功能，可在 Settings 中开启失败通知
