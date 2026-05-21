// AI 应用技术
const DATA_APPLICATIONS = {
    id: 'applications', name: 'AI 应用技术',
    children: [
        {
            id: 'nlp-apps', name: '自然语言处理',
            children: [
                { id: 'rag', name: 'RAG 检索增强生成', fullName: 'Retrieval-Augmented Generation', desc: '向量检索+生成、知识库问答、减少幻觉', content: { what: 'RAG=先检索相关文档再让大模型基于结果生成回答，给AI配了个可搜索的笔记本。', why: '大模型知识有时效性且会幻觉。RAG让它查阅最新/私有资料后再回答——企业AI落地主流方案。', remember: '先搜再答=RAG。大模型+知识库=不幻觉+有时效+有根据。', example: '企业客服AI：用户问退货政策→先从知识库检索公司规定→基于规定生成准确回答。' } },
                { id: 'prompt-engineering', name: 'Prompt Engineering', fullName: 'Prompt Engineering', desc: '提示词设计、Few-shot、System Prompt、结构化提示', content: { what: '设计输入提示词的技巧让AI给出更好输出，包括角色设定、格式要求、示例引导等。', why: '好prompt和差prompt效果天差地别。零成本提升效果的最佳技能。', remember: '不需写代码，只需学会怎么问就能让AI效果翻倍。', example: '"写文章"→普通。"你是资深记者，用通俗语言为高中生写800字含3个案例"→优秀。' } },
                { id: 'text-summary', name: '文本摘要', fullName: 'Text Summarization', desc: '抽取式/生成式摘要、长文档压缩、会议纪要', content: { what: '让AI把长文本压缩成短摘要。生成式=用自己的话重新表述。', why: '信息过载时代刚需。50页报告→3段摘要，2小时会议→要点纪要。', remember: '长变短抓重点。大模型生成式摘要已全面超越传统方法。', example: '飞书AI纪要：2小时会议自动生成结构化要点摘要+待办事项。' } },
                { id: 'sentiment', name: '情感分析', fullName: 'Sentiment Analysis', desc: '正面/负面/中性、评论分析、舆情监控', content: { what: '让AI判断文本情感倾向——正面、负面还是中性，可细分到具体方面。', why: '电商评论分析、品牌舆情监控——NLP最成熟的商业应用之一。', remember: '判断说的是好话还是坏话=情感分析，看似简单但商业价值极大。', example: '外卖平台自动分析百万评价：提取"配送慢""菜品凉"等负面关键词反馈商家。' } },
                { id: 'machine-translation', name: '机器翻译', fullName: 'Neural Machine Translation (NMT)', desc: '神经机器翻译、多语言、大模型直接翻译', content: { what: '用AI自动翻译语言，从规则到统计到神经网络到大模型直译，质量接近专业译员。', why: '大模型翻译很强，但专业领域仍需人工校对。未来是AI翻译+人类审核模式。', remember: '大模型翻译质量飞跃——日常很准，专业领域仍需把关。', example: 'GPT-4翻译已超Google翻译——尤其擅长保留语境和文化细微差别。' } }
            ]
        },
        {
            id: 'cv-apps', name: '计算机视觉应用',
            children: [
                { id: 'object-detection', name: '目标检测', fullName: 'Object Detection (YOLO/DETR)', desc: 'YOLO系列、实时检测、自动驾驶感知', content: { what: '在图片/视频中精确定位并识别物体（画框+分类）。YOLO系列是实时检测代表。', why: '自动驾驶识别行人车辆、安防监控、工业质检——视觉AI最广泛应用之一。', remember: '找到图中物体在哪+是什么=目标检测。YOLO=实时检测之王。', example: '特斯拉自动驾驶每秒处理几十帧，实时识别周围所有车辆行人路标。' } },
                { id: 'image-gen', name: 'AI 图像生成', fullName: 'AI Image Generation (Text-to-Image)', desc: 'Midjourney、DALL-E、Stable Diffusion、Flux', content: { what: '输入文字描述→AI生成对应图片。质量已达专业摄影/插画水平。', why: '正在颠覆设计广告游戏等视觉行业。一个提示词几秒出图。', remember: 'Midjourney=最美，SD=最开放可控，DALL-E=最易用，Flux=新锐。', example: '游戏公司用Midjourney几分钟生成概念图——以前设计师要画一周。' } },
                { id: 'video-gen', name: 'AI 视频生成', fullName: 'AI Video Generation (Sora/Kling)', desc: 'Sora、Runway Gen-3、Kling可灵、文本生成视频', content: { what: '输入文字或图片→AI生成视频。2025年多家产品可生成1分钟高质量视频。', why: '继图像生成后下一个颠覆领域，短视频创作和广告制作正在被改变。', remember: 'Sora(OpenAI)、可灵(快手)、Runway——文生视频三大代表。', example: '输入"柴犬海边跑步慢动作"，Sora生成物理真实光影完美的10秒视频。' } },
                { id: 'ocr', name: 'OCR 文字识别', fullName: 'Optical Character Recognition', desc: '图片转文字、证件识别、文档数字化', content: { what: 'OCR让AI从图片中识别文字，能处理街拍手写扭曲多语言混排。', why: '纸质文档数字化、发票录入、车牌识别——最成熟的视觉AI应用。', remember: '图片中有字→变成可编辑文本=OCR。', example: '手机扫描纸质合同→OCR识别全部文字→自动录入系统，比人工快100倍。' } }
            ]
        },
        {
            id: 'agent-apps', name: 'AI Agent 智能体',
            children: [
                { id: 'agent-concept', name: 'Agent 概念', fullName: 'AI Agent / Autonomous Agent', desc: '感知-推理-行动循环、自主决策、任务分解', content: { what: 'AI Agent=自主感知环境→推理决策→执行行动的AI系统，自己规划多步操作完成复杂任务。', why: '2025年最火AI方向。从工具进化为同事——Agent能自己搜索写代码操作软件。', remember: 'Agent=会自主行动的AI。多步规划+工具使用+自我修正。', example: '"帮我订最便宜的机票"——Agent自动搜索、比价、填表、下单。' } },
                { id: 'tool-use', name: '工具使用', fullName: 'Tool Use / Function Calling', desc: 'API调用、Function Calling、插件系统', content: { what: 'Tool Use让大模型调用外部工具——搜索引擎、计算器、数据库API——弥补自身短板。', why: '大模型不能上网不能精确计算。Tool Use让它接入无限外部能力。', remember: '大模型+工具=超能力。Function Calling=AI决定该调哪个API。', example: '问AI天气→调天气API→拿实时数据→自然语言回答。模型本身不知天气但工具补上。' } },
                { id: 'mcp-protocol', name: 'MCP 协议', fullName: 'Model Context Protocol (by Anthropic)', desc: '开放标准、AI工具互操作、统一接口协议', content: { what: 'MCP是Anthropic提出的开放协议，让AI模型与各种工具/数据源通过统一标准接口通信。类似AI世界的USB-C。', why: '没有MCP每接一个工具就要写适配代码。有了MCP，工具只需实现一次接口，所有AI都能用。', remember: 'MCP=AI工具的USB-C标准。写一次接口→所有AI通用。2025年快速普及中。', example: 'CatDesk通过MCP协议接入记忆系统——不用为每个AI重写记忆功能的接口。' } },
                { id: 'multi-agent', name: '多智能体协作', fullName: 'Multi-Agent Systems', desc: '分工协作、AutoGen、CrewAI、智能体团队', content: { what: '多个Agent分工合作完成复杂任务——一个负责搜索、一个写代码、一个审核，像一个AI团队。', why: '单Agent能力有限。多Agent协作能处理更复杂的任务，是AGI路径的重要探索方向。', remember: '一个Agent做不好→多个Agent分工合作=Multi-Agent。像组建AI团队。', example: 'AutoGen框架：产品经理Agent写需求→程序员Agent写代码→测试Agent审查bug。' } },
                { id: 'planning', name: '任务规划', fullName: 'Task Planning & Decomposition', desc: '任务分解、ReAct、Tree of Thought、递归规划', content: { what: 'Agent把复杂任务拆成小步骤的能力。ReAct=推理+行动交替；Tree of Thought=多路径探索选最优。', why: '没有好的规划能力Agent就像无头苍蝇。规划=Agent智能水平的核心指标之一。', remember: '大任务→拆小步→逐步执行→检查结果→调整计划=Agent规划能力。', example: '"写一篇市场分析报告"→Agent拆解为：搜集数据→分析趋势→组织大纲→撰写→检查。' } }
            ]
        },
        {
            id: 'infra-apps', name: 'AI 基础设施',
            children: [
                { id: 'gpu-computing', name: 'GPU 算力', fullName: 'GPU Computing (NVIDIA CUDA)', desc: 'NVIDIA H100/B200、CUDA生态、算力军备竞赛', content: { what: 'GPU是AI训练的核心硬件。NVIDIA凭借CUDA生态垄断AI算力市场，H100/B200是训练大模型的标配。', why: '算力是AI发展的物理瓶颈。理解GPU市场=理解AI产业的底层逻辑和竞争格局。', remember: '训练大模型=烧GPU。NVIDIA垄断90%+ AI算力市场，一卡难求。', example: '训练GPT-4据传用了约25000张A100 GPU，按市价约5亿美元的硬件资源。' } },
                { id: 'model-serving', name: '模型部署推理', fullName: 'Model Serving & Inference', desc: 'vLLM、TensorRT、量化、KV Cache、推理优化', content: { what: '把训练好的模型部署为可高并发服务的过程。关键优化：量化(减小精度省内存)、KV Cache(避免重复计算)。', why: '训练一次就够，但推理要服务百万用户。推理成本是AI公司最大开支，优化=省钱。', remember: '训练是一次性的，推理(serving)是持续的成本大头。量化/缓存/蒸馏都在降成本。', example: 'vLLM用PagedAttention让单GPU同时服务更多用户——吞吐量提升2-4倍，推理成本直降。' } },
                { id: 'vector-db', name: '向量数据库', fullName: 'Vector Database (Pinecone/Milvus/Qdrant)', desc: '向量相似度搜索、ANN近似最近邻、RAG底座', content: { what: '专门存储和检索向量(Embedding)的数据库。核心操作=给一个向量找到最相似的Top-K个向量。', why: '这是RAG和语义搜索的底座。传统数据库做不了"找语义最相似的内容"，向量数据库专门解决这个。', remember: '存向量+搜相似=向量数据库。是RAG知识库的必备组件。', example: '用户问"怎么退款"→转向量→在向量库中找到最相似的3条文档→交给大模型生成回答。' } },
                { id: 'mlops', name: 'MLOps', fullName: 'Machine Learning Operations', desc: '模型版本管理、CI/CD、监控、AB测试、自动化流水线', content: { what: 'MLOps=ML + DevOps。把机器学习模型的训练/部署/监控/迭代流程工程化和自动化。', why: '90%的ML项目死于"实验跑通了但上不了线"。MLOps让模型从实验室走向生产环境。', remember: '模型不是训完就完了——部署/监控/更新都需要工程体系=MLOps。', example: '模型上线后发现某类用户预测准确率下降→自动触发重训练→AB测试→灰度发布→全量。' } }
            ]
        }
    ]
};
