// AI 工具实战
const DATA_TOOLS = {
    id: 'tools', name: 'AI 工具实战',
    children: [
        {
            id: 'dev-tools', name: '开发者工具',
            children: [
                { id: 'github-copilot', name: 'GitHub Copilot', fullName: 'GitHub Copilot (by GitHub/OpenAI)', desc: 'AI代码补全、自动建议、多IDE支持', content: { what: '微软/GitHub的AI编程助手，实时在编辑器中建议代码补全，像有个搭档在旁边递代码。', why: '最早最成熟的AI编程工具。据统计接受率约30%且让开发者效率提升55%。', remember: 'Copilot=写代码时的AI搭档，实时建议你接下来可能要写的代码。', example: '写了函数签名和注释后Tab一下，Copilot自动补全整个函数体——准确率惊人。' } },
                { id: 'cursor-ide', name: 'Cursor IDE', fullName: 'Cursor (AI-Native IDE)', desc: 'AI原生编辑器、Cmd+K编辑、Agent模式', content: { what: 'Cursor是AI原生的代码编辑器(基于VSCode)。核心功能：Cmd+K用自然语言编辑代码、Chat问答、Agent自动开发。', why: '2024-2025年最火的开发者工具，代表AI编程的未来形态——自然语言驱动开发。', remember: 'Cursor=VSCode+深度AI集成。用中文描述需求→AI直接改代码。', example: '"把这个函数改成async并加错误处理"→Cursor直接在代码中完成修改，不用手动写。' } },
                { id: 'vibe-coding', name: 'Vibe Coding', fullName: 'Vibe Coding (by Andrej Karpathy)', desc: '氛围编程、用自然语言描述需求、AI全程生成', content: { what: 'Karpathy提出的概念：不再逐行写代码，而是用自然语言描述你想要什么让AI全程生成，你只负责验收和引导。', why: '代表编程范式的根本转变——从写代码变成描述意图。2025年非程序员也能用Vibe Coding做app。', remember: 'Vibe Coding=你描述想法，AI写全部代码。程序员变成AI的产品经理。', example: '对AI说"做一个待办清单app，要能拖拽排序，暗色主题"——10分钟后一个完整app出来了。' } },
                { id: 'claude-code', name: 'Claude Code', fullName: 'Claude Code (CLI Agent by Anthropic)', desc: '终端AI Agent、自动读写文件、执行命令', content: { what: 'Claude Code是命令行里的AI开发Agent，能自主阅读代码库、修改文件、运行测试、提交代码。', why: '比Chat更进一步——它能直接操作你的项目。代表AI从建议者变成执行者的转变。', remember: 'Claude Code=终端里的AI程序员。自己读代码→改代码→跑测试→修bug。', example: '"帮我给这个项目加单元测试覆盖率到80%"→Claude Code自动分析代码、写测试、运行验证。' } },
                { id: 'v0-bolt', name: 'v0 / Bolt.new', fullName: 'v0 (Vercel) / Bolt.new (StackBlitz)', desc: '前端AI生成、即时预览、一键部署', content: { what: 'v0和Bolt.new可以用自然语言描述UI→AI即时生成前端代码并实时预览。像和设计师对话。', why: '让非前端开发者也能快速做出漂亮界面。从描述到部署可能只需5分钟。', remember: 'v0/Bolt=说出你想要的界面→AI秒级生成并可预览部署。', example: '"做一个像Notion的侧边栏导航+暗色主题的Dashboard"→v0几秒生成完整React组件。' } }
            ]
        },
        {
            id: 'productivity-tools', name: '效率工具',
            children: [
                { id: 'chatgpt-app', name: 'ChatGPT', fullName: 'ChatGPT (by OpenAI)', desc: '通用AI助手、GPTs定制、联网搜索、代码执行', content: { what: 'ChatGPT是使用最广泛的AI对话产品，月活用户数亿。支持联网、代码执行、图像生成、GPTs应用商店。', why: '它定义了AI产品的交互范式——对话式AI助手。是大多数人接触AI的第一站。', remember: 'ChatGPT=AI时代的入口级产品。免费版也够日常用，Plus解锁GPT-4o和工具。', example: '让ChatGPT帮你写邮件、分析Excel、画流程图、做旅行计划——一个工具覆盖百种场景。' } },
                { id: 'notion-ai', name: 'AI 文档工具', fullName: 'AI Writing & Documentation Tools', desc: 'Notion AI、飞书AI、文档智能助手', content: { what: '文档工具内嵌AI功能：自动续写、改写润色、摘要生成、翻译、会议纪要提取。', why: '这是AI"润物细无声"的最佳案例——不需要单独打开AI，在你日常写文档时就在帮忙。', remember: '未来每个文档工具都会内嵌AI。写作辅助是AI最无感且高频的应用。', example: '在Notion中选中一段文字→"让它更简洁"/"翻译成英文"/"扩写成段落"——一键完成。' } },
                { id: 'midjourney-tool', name: 'Midjourney', fullName: 'Midjourney (AI Art Generator)', desc: 'AI绘画、文字生成图、风格化、商业级质量', content: { what: 'Midjourney是目前质量最高的AI图像生成工具，通过Discord输入文字描述即可生成惊艳图片。', why: '已被广泛用于商业设计、概念艺术、广告素材——质量达到专业商用标准。', remember: 'Midjourney=最美的AI画家。输入描述→四张惊艳候选图→选中放大。', example: '输入"/imagine a cozy coffee shop in rain, Studio Ghibli style"→宫崎骏风格的温馨咖啡馆。' } },
                { id: 'ai-search', name: 'AI 搜索引擎', fullName: 'AI Search (Perplexity/SearchGPT)', desc: 'Perplexity、SearchGPT、AI问答式搜索', content: { what: 'AI搜索=问问题→AI搜索全网→综合多个来源→给出带引用的结构化回答(而非链接列表)。', why: '正在挑战Google传统搜索。不用自己点开10个链接——AI帮你读完总结好了。', remember: 'AI搜索=Google的进化版。问问题→直接给答案(附来源)而非给链接。', example: 'Perplexity问"2025年最好的降噪耳机"→综合20篇评测给出结论+对比表格+引用来源。' } },
                { id: 'suno-music', name: 'Suno AI 音乐', fullName: 'Suno AI (Music Generation)', desc: 'AI作曲、文字生成歌曲、含人声旋律歌词', content: { what: 'Suno AI输入歌曲描述(风格/主题/歌词)→AI生成完整歌曲含旋律编曲人声。', why: '以前做一首歌需要作曲编曲录音混音几周+几万元。现在30秒+免费。创作门槛归零。', remember: 'Suno=说出想要什么歌→30秒生成完整歌曲含人声。创作门槛归零。', example: '"一首关于程序员加班的搞笑说唱"→Suno生成2分钟完整歌曲，旋律洗脑歌词搞笑。' } }
            ]
        },
        {
            id: 'workflow-tools', name: '工作流与自动化',
            children: [
                { id: 'langchain', name: 'LangChain', fullName: 'LangChain (LLM Application Framework)', desc: 'LLM应用开发框架、链式调用、集成工具', content: { what: 'LangChain是构建LLM应用的主流框架。把大模型和工具串联起来形成工作流(Chain)。', why: '想做RAG知识库/Agent/对话机器人？LangChain是大多数开发者的首选起点。', remember: 'LangChain=搭建AI应用的乐高积木。把模型+工具+数据串联起来。', example: '用LangChain 50行代码就能搭一个RAG系统：加载PDF→切片→向量化→检索→生成回答。' } },
                { id: 'dify-coze', name: 'Dify / Coze', fullName: 'Dify / Coze (No-Code AI Platform)', desc: '可视化AI应用搭建、无代码、工作流编排', content: { what: '低代码/无代码AI应用平台。拖拽式搭建AI工作流——不会写代码也能做AI应用。', why: '降低AI应用开发门槛。产品经理/运营也能自己搭AI机器人和自动化流程。', remember: 'Dify/Coze=不会写代码也能搭AI应用。拖拽组合=AI乐高。', example: '在Coze中拖拽：用户输入→搜索知识库→大模型生成→发送回复——10分钟做一个客服机器人。' } },
                { id: 'n8n-zapier', name: 'n8n / Zapier AI', fullName: 'n8n / Zapier (AI Automation)', desc: '自动化工作流、AI触发器、跨平台集成', content: { what: '自动化工具+AI=智能工作流。用AI判断邮件重要性→自动分类→重要的发通知→自动回复模板。', why: 'AI+自动化=把重复劳动彻底消灭。不是单次用AI而是让AI持续自动工作。', remember: 'n8n/Zapier=让AI自动帮你处理重复性工作，24小时不停。', example: '新简历来了→AI评分筛选→合格的自动约面试→不合格的自动发感谢信。全自动。' } },
                { id: 'manus-agent', name: 'Manus', fullName: 'Manus (General AI Agent)', desc: '2025通用Agent、自主完成复杂任务、操作电脑', content: { what: 'Manus是2025年爆火的通用AI Agent。能自主操作电脑完成复杂多步任务：搜索比较分析报告一条龙。', why: '代表Agent从概念到产品的落地。不是聊天而是真正帮你做事的AI员工。', remember: 'Manus=能操作电脑的AI员工。给它一个任务→它自己搜索分析操作交付结果。', example: '"帮我调研5家竞品的定价策略并做对比表格"→Manus自动上网搜索→逐个分析→生成报告。' } }
            ]
        }
    ]
};
