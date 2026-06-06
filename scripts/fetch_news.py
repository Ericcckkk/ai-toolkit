#!/usr/bin/env python3
"""
AI Toolkit 每日资讯自动抓取脚本
- 从多个免费新闻源抓取当日 AI 领域新闻
- 调用 MiniMax API 进行筛选、去重、摘要生成
- 输出格式严格匹配 data/news.js 的数据结构
- 每天 20 条，按重要性排序

运行方式：python scripts/fetch_news.py
环境变量：MINIMAX_API_KEY（必需）, GNEWS_API_KEY（可选，增加新闻源）
"""

import os
import sys
import json
import re
import time
import urllib.request
import urllib.parse
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

# ============ 配置 ============
MINIMAX_API_KEY = os.environ.get("MINIMAX_API_KEY", "")
MINIMAX_OPENAI_URL = "https://api.minimax.chat/v1/chat/completions"
MINIMAX_MODEL = "MiniMax-M2.7"  # Token Plan 支持的旗舰编程/文本模型

NEWS_COUNT = 20  # 每天输出条数
MAX_RAW_ARTICLES = 50  # 最多发给 AI 的原始文章数（控制输入长度防超时）
NEWS_RETENTION_DAYS = 30  # 保留最近 30 天资讯

# 新闻标签优先级（与现有数据一致）
TAG_PRIORITY = [
    "政策监管",
    "应用落地",
    "重要产品发布",
    "行业格局",
    "大额融资/IPO",
    "技术突破",
    "研究/报告"
]

# ============ 新闻源配置 ============
RSS_SOURCES = [
    {
        "name": "36kr",
        "url": "https://36kr.com/feed",
        "filter_keywords": ["AI", "人工智能", "大模型", "GPT", "LLM", "智能体", "机器人", "芯片", "算力", "OpenAI", "Anthropic", "Google", "DeepSeek"]
    },
    {
        "name": "Hacker News",
        "url": "https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT+OR+anthropic+OR+openai&count=30",
        "filter_keywords": []
    },
    {
        "name": "TechCrunch AI",
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "filter_keywords": []
    },
    {
        "name": "The Verge AI",
        "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
        "filter_keywords": []
    },
    {
        "name": "MIT Technology Review",
        "url": "https://www.technologyreview.com/feed/",
        "filter_keywords": ["AI", "artificial intelligence", "machine learning", "LLM", "model"]
    },
    {
        "name": "VentureBeat AI",
        "url": "https://venturebeat.com/category/ai/feed/",
        "filter_keywords": []
    }
]

# 搜索源（免费 RSS 接口）
SEARCH_QUERIES_CN = [
    "AI 大模型 发布",
    "人工智能 政策 监管",
    "AI 融资 IPO",
    "AI Agent 智能体 应用",
]

SEARCH_QUERIES_EN = [
    "AI model release announcement",
    "artificial intelligence regulation policy",
    "AI startup funding",
    "LLM benchmark breakthrough",
]


# ============ 工具函数 ============
def log(msg):
    """带时间戳的日志"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def fetch_url(url, timeout=15):
    """安全的 HTTP 请求"""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        log(f"  [WARN] 抓取失败 {url[:80]}... : {e}")
        return None


def parse_rss(xml_text, source_name, filter_keywords):
    """解析 RSS/Atom feed，提取文章列表"""
    articles = []
    if not xml_text:
        return articles

    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return articles

    # 处理 RSS 2.0
    items = root.findall(".//item")
    # 处理 Atom
    if not items:
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        items = root.findall(".//atom:entry", ns)

    for item in items[:30]:
        title = ""
        link = ""
        description = ""
        pub_date = ""

        # RSS 2.0 格式
        title_el = item.find("title")
        link_el = item.find("link")
        desc_el = item.find("description")
        date_el = item.find("pubDate")

        # Atom 格式 fallback
        if title_el is None:
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            title_el = item.find("atom:title", ns)
            link_el = item.find("atom:link", ns)
            desc_el = item.find("atom:summary", ns) or item.find("atom:content", ns)
            date_el = item.find("atom:updated", ns) or item.find("atom:published", ns)

        if title_el is not None:
            title = title_el.text or ""
        if link_el is not None:
            link = link_el.text or link_el.get("href", "")
        if desc_el is not None:
            description = desc_el.text or ""
        if date_el is not None:
            pub_date = date_el.text or ""

        # 去除 HTML 标签
        description = re.sub(r"<[^>]+>", "", description).strip()[:500]

        # 关键词过滤
        if filter_keywords:
            text = (title + " " + description).lower()
            if not any(kw.lower() in text for kw in filter_keywords):
                continue

        if title:
            articles.append({
                "title": title.strip(),
                "url": link.strip(),
                "description": description,
                "source": source_name,
                "pub_date": pub_date
            })

    return articles


def fetch_from_google_news(query):
    """使用 Google News RSS（免费，无需 API key）"""
    encoded_query = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}+when:1d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
    xml_text = fetch_url(url)
    return parse_rss(xml_text, "Google News", [])


def fetch_from_bing_news(query):
    """使用 Bing News RSS（免费，无需 API key）"""
    encoded_query = urllib.parse.quote(query)
    url = f"https://www.bing.com/news/search?q={encoded_query}&format=rss&count=15"
    xml_text = fetch_url(url)
    return parse_rss(xml_text, "Bing News", [])


def fetch_from_gnews(query):
    """使用 GNews API（免费100次/天）"""
    api_key = os.environ.get("GNEWS_API_KEY", "")
    if not api_key:
        return []

    url = f"https://gnews.io/api/v4/search?q={urllib.parse.quote(query)}&lang=en&max=10&apikey={api_key}"
    data = fetch_url(url)
    if not data:
        return []

    try:
        result = json.loads(data)
        articles = []
        for item in result.get("articles", []):
            articles.append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "description": item.get("description", ""),
                "source": item.get("source", {}).get("name", "GNews"),
                "pub_date": item.get("publishedAt", "")
            })
        return articles
    except json.JSONDecodeError:
        return []


# ============ 新闻抓取主流程 ============
def collect_raw_news():
    """从所有源收集原始新闻"""
    all_articles = []

    # 1. RSS 源
    log(">>> 阶段1：抓取 RSS 源")
    for source in RSS_SOURCES:
        log(f"  [{source['name']}]")
        xml_text = fetch_url(source["url"])
        articles = parse_rss(xml_text, source["name"], source["filter_keywords"])
        log(f"    → {len(articles)} 条")
        all_articles.extend(articles)
        time.sleep(0.5)

    # 2. 中文搜索
    log(">>> 阶段2：中文新闻搜索")
    for query in SEARCH_QUERIES_CN:
        log(f"  搜索: {query}")
        articles = fetch_from_google_news(query)
        log(f"    Google News → {len(articles)} 条")
        all_articles.extend(articles)
        time.sleep(1)

        articles = fetch_from_bing_news(query)
        log(f"    Bing News → {len(articles)} 条")
        all_articles.extend(articles)
        time.sleep(1)

    # 3. 英文搜索
    log(">>> 阶段3：英文新闻搜索")
    for query in SEARCH_QUERIES_EN:
        log(f"  搜索: {query}")
        articles = fetch_from_google_news(query)
        log(f"    Google News → {len(articles)} 条")
        all_articles.extend(articles)
        time.sleep(1)

    # 4. GNews API（可选）
    if os.environ.get("GNEWS_API_KEY"):
        log(">>> 阶段4：GNews API 补充")
        for query in ["artificial intelligence", "AI model launch", "AI regulation"]:
            articles = fetch_from_gnews(query)
            log(f"    GNews '{query}' → {len(articles)} 条")
            all_articles.extend(articles)
            time.sleep(1)

    # 去重（按标题相似度）
    seen_titles = set()
    unique_articles = []
    for article in all_articles:
        key = re.sub(r"[\s\-_:：,，.。!！?？]", "", article["title"])[:25].lower()
        if key and key not in seen_titles:
            seen_titles.add(key)
            unique_articles.append(article)

    log(f"\n>>> 汇总：原始 {len(all_articles)} 条 → 去重后 {len(unique_articles)} 条")
    return unique_articles[:MAX_RAW_ARTICLES]


# ============ MiniMax API 调用 ============
def call_minimax(messages, temperature=0.3, max_tokens=8000):
    """调用 MiniMax API（OpenAI 兼容格式）"""
    if not MINIMAX_API_KEY:
        raise ValueError("未设置 MINIMAX_API_KEY 环境变量")

    payload = json.dumps({
        "model": MINIMAX_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }).encode("utf-8")

    req = urllib.request.Request(
        MINIMAX_OPENAI_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MINIMAX_API_KEY}"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        log(f"  [ERROR] MiniMax API ({e.code}): {error_body[:300]}")
        raise
    except Exception as e:
        log(f"  [ERROR] MiniMax API 调用失败: {e}")
        raise


def generate_news_digest(raw_articles, target_date):
    """使用 MiniMax 从原始文章中筛选并生成高质量资讯"""

    # 将原始文章整理为文本（精简格式，控制 token）
    articles_text = ""
    for i, article in enumerate(raw_articles, 1):
        desc = article['description'][:120] if article['description'] else ""
        articles_text += f"[{i}] {article['title']} | {article['source']} | {article['url']}\n"
        if desc:
            articles_text += f"    {desc}\n"

    system_prompt = """你是一位资深 AI 行业分析师和科技新闻编辑，为一个面向 AI 从业者和创业者的个人知识工具（AI Toolkit）撰写每日资讯。

## 你的核心职责

从原始新闻素材中筛选出当日最重要的 20 条 AI 行业资讯，并为每条撰写高质量摘要。

## 筛选标准（按优先级）

1. 政策监管：各国 AI 立法、监管政策、合规要求
2. 应用落地：头部产品重大更新、月活/营收里程碑、企业级部署案例
3. 重要产品发布：新模型发布（含基准分数）、开发工具更新、平台升级
4. 行业格局：人才流动（C-level 级别）、重大收购合并、战略合作
5. 大额融资/IPO：1亿美元以上融资、估值变动、上市进程
6. 技术突破：论文突破（引用潜力大）、新架构、SOTA 刷新
7. 研究/报告：权威机构报告、行业趋势数据、深度调研

## 摘要写作标准

每条 summary 必须做到：
- **长度**：100-180 字（中文字符）
- **结构**：第一句交代事实（who/what/when），中间补充关键数字和背景，最后一句点明"so what"
- **数字**：必须包含至少一个关键数字（金额、百分比、用户量、性能指标）
- **观点**：结尾带一句犀利但客观的编辑观点，说明这对行业/从业者意味着什么
- **语气**：专业、密度高、不废话。参考36kr深度报道和The Information的风格

## 标题写作标准

- 25-50 个中文字符
- 前半句陈述核心事实，后半句（可用冒号或逗号分隔）点明意义或亮点数字
- 不要用问号、感叹号结尾

## tag 必须是以下之一

"政策监管"、"应用落地"、"重要产品发布"、"行业格局"、"大额融资/IPO"、"技术突破"、"研究/报告"

## 输出格式

严格输出 JSON 数组，不要任何额外文字。每个元素：
```json
{
    "tag": "标签",
    "title": "标题",
    "summary": "摘要",
    "source": "来源1 / 来源2",
    "url": "最佳来源链接"
}
```"""

    user_prompt = f"""今天是 {target_date}。

以下是从多个新闻源抓取到的 {len(raw_articles)} 条 AI 相关原始素材。请筛选出最重要的 20 条（如果高质量素材不足20条，有多少出多少，绝不凑数），按优先级排序，生成资讯。

要求：
1. 同一事件多条报道，合并为一条，来源标注多个
2. 英文新闻的标题和摘要请翻译为中文
3. url 优先保留权威/一手来源
4. 确保输出是可直接 JSON.parse 的数组

原始素材：
{articles_text}

输出（直接以 [ 开头的 JSON 数组）："""

    log(">>> 阶段4：调用 MiniMax API 生成高质量资讯")
    log(f"  输入素材: {len(raw_articles)} 条")

    response = call_minimax([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ], temperature=0.3, max_tokens=8000)

    # 剥离 <think>...</think> 思考标签（M2.7 可能输出）
    response = re.sub(r'<think>[\s\S]*?</think>', '', response).strip()

    # 提取 JSON
    json_match = re.search(r'\[[\s\S]*\]', response)
    if json_match:
        try:
            news_items = json.loads(json_match.group())
            log(f"  ✓ 成功生成 {len(news_items)} 条资讯")

            # 验证格式
            valid_items = []
            for item in news_items:
                if all(k in item for k in ["tag", "title", "summary", "source", "url"]):
                    # 确保 tag 在允许范围内
                    if item["tag"] not in TAG_PRIORITY:
                        item["tag"] = "研究/报告"  # 默认分类
                    valid_items.append(item)

            log(f"  ✓ 格式验证通过: {len(valid_items)} 条有效")
            return valid_items
        except json.JSONDecodeError as e:
            log(f"  [ERROR] JSON 解析失败: {e}")
            log(f"  响应片段: {response[:500]}")
            raise
    else:
        log(f"  [ERROR] 未找到 JSON 数组")
        log(f"  响应片段: {response[:500]}")
        raise ValueError("MiniMax 响应格式错误，未包含 JSON 数组")


# ============ 文件更新 ============
def update_news_js(news_items, target_date):
    """将新生成的资讯写入 data/news.js，并只保留相对最新日期最近 30 天"""

    news_js_path = Path(__file__).parent.parent / "data" / "news.js"
    header = (
        "// 每日 AI 资讯数据\n"
        "// 每天 20 条，按重要性排序：政策监管 > 应用落地 > 重要产品发布 > 行业格局变动 > 大额融资/IPO > 技术突破 > 研究报告\n"
    )

    # 读取现有文件
    if news_js_path.exists():
        content = news_js_path.read_text(encoding="utf-8")
    else:
        content = header + "const AI_NEWS_DATA = [\n];\n"

    # 检查是否已有当天数据 → 如果有则跳过（防止重复运行）
    if f'"date": "{target_date}"' in content:
        log(f"  [SKIP] {target_date} 数据已存在，跳过")
        return False

    # 构建新的一天的数据块
    new_day = {
        "date": target_date,
        "items": news_items
    }

    match = re.search(r'const AI_NEWS_DATA = (\[[\s\S]*\]);?\s*$', content)
    if not match:
        log("  [ERROR] 无法定位 AI_NEWS_DATA 数组")
        return False

    try:
        existing_days = json.loads(match.group(1))
    except json.JSONDecodeError as e:
        log(f"  [ERROR] 现有 news.js 解析失败: {e}")
        return False

    merged_days = {}
    for day in existing_days:
        day_date_raw = day.get("date", "")
        try:
            datetime.strptime(day_date_raw, "%Y-%m-%d")
        except ValueError:
            continue
        merged_days[day_date_raw] = day
    merged_days[target_date] = new_day

    sorted_dates = sorted(merged_days.keys(), reverse=True)
    latest_date = datetime.strptime(sorted_dates[0], "%Y-%m-%d").date()
    cutoff_date = latest_date - timedelta(days=NEWS_RETENTION_DAYS - 1)

    retained_days = []
    for day_date_raw in sorted_dates:
        day_date = datetime.strptime(day_date_raw, "%Y-%m-%d").date()
        if day_date < cutoff_date:
            continue
        retained_days.append(merged_days[day_date_raw])

    new_content = (
        header
        + "const AI_NEWS_DATA = "
        + json.dumps(retained_days, ensure_ascii=False, indent=4)
        + ";\n"
    )

    # 写入文件
    news_js_path.write_text(new_content, encoding="utf-8")
    log(f"  ✓ 已写入 {news_js_path.name}: +{len(news_items)} 条 [{target_date}]，保留 {len(retained_days)} 天")
    return True


# ============ 主流程 ============
def main():
    log("=" * 60)
    log("  AI Toolkit · 每日资讯自动更新")
    log("=" * 60)

    # 确定目标日期
    target_date = os.environ.get("TARGET_DATE", "")
    if not target_date:
        beijing_tz = timezone(timedelta(hours=8))
        target_date = datetime.now(beijing_tz).strftime("%Y-%m-%d")

    log(f"目标日期: {target_date}")
    log(f"模型: {MINIMAX_MODEL}")

    # 检查 API Key
    if not MINIMAX_API_KEY:
        log("[FATAL] 未设置 MINIMAX_API_KEY 环境变量")
        log("请在 GitHub 仓库 Settings → Secrets 中添加 MINIMAX_API_KEY")
        sys.exit(1)

    # Step 1: 收集原始新闻
    raw_articles = collect_raw_news()

    if len(raw_articles) < 5:
        log("[WARN] 原始新闻不足 5 条，可能网络有问题")
        log("尝试仅使用搜索源重试...")
        # 降级：只用搜索
        raw_articles = []
        for q in SEARCH_QUERIES_CN + SEARCH_QUERIES_EN:
            raw_articles.extend(fetch_from_google_news(q))
            time.sleep(1)
        if len(raw_articles) < 5:
            log("[FATAL] 重试后仍不足 5 条，放弃本次更新")
            sys.exit(1)

    # Step 2: AI 生成高质量资讯
    try:
        news_items = generate_news_digest(raw_articles, target_date)
    except Exception as e:
        log(f"[FATAL] AI 生成失败: {e}")
        sys.exit(1)

    if not news_items or len(news_items) < 5:
        log("[FATAL] 生成结果不足 5 条，放弃本次更新")
        sys.exit(1)

    # Step 3: 更新 news.js
    updated = update_news_js(news_items, target_date)

    if updated:
        log("\n" + "=" * 60)
        log(f"  ✓ 完成! {target_date} 共 {len(news_items)} 条资讯已写入")
        log("=" * 60)
    else:
        log("\n  今日数据已存在，无需更新")


if __name__ == "__main__":
    main()
