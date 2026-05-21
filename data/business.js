// AI 商业化
const DATA_BUSINESS = {
    id: 'business', name: 'AI 商业化',
    children: [
        {
            id: 'biz-models', name: '商业模式',
            children: [
                { id: 'api-economy', name: 'API 经济', fullName: 'API Economy / AI-as-a-Service', desc: 'OpenAI API、按token计费、模型即服务', content: { what: 'AI公司通过API按调用量收费。用户不需要自己训练模型，调用API即可获得AI能力。', why: '这是目前AI最主流的商业模式。OpenAI年收入数十亿美元主要来自API。', remember: 'API经济=AI能力像水电一样按用量收费。降低了AI使用门槛。', example: 'GPT-4o API每百万token输入$2.5——一个创业公司零投入就能用世界最强AI。' } },
                { id: 'open-source-biz', name: '开源商业化', fullName: 'Open Source AI Business Model', desc: 'Meta/Mistral策略、开源模型+增值服务', content: { what: '模型开源免费，通过企业级部署支持、云服务、定制化等增值服务赚钱。', why: 'Meta通过开源Llama构建生态壁垒；Mistral靠企业服务年收入过亿。不靠卖模型靠卖服务。', remember: '模型免费开源→吸引用户→卖企业级增值服务。用开源打败闭源的策略。', example: 'Meta不靠Llama赚钱，而是让全世界都用Meta的AI标准——掌控生态比卖模型更值钱。' } },
                { id: 'vertical-ai', name: '垂直行业AI', fullName: 'Vertical AI / Domain-Specific AI', desc: '医疗AI、法律AI、金融AI、教育AI', content: { what: '针对特定行业训练/微调的专用AI系统，比通用大模型在该领域更精准专业。', why: '通用模型做不好专业领域。垂直AI=通用模型+行业数据+专业知识=高价值应用。', remember: '通用模型什么都会但不精→垂直AI在特定领域比GPT-4更好用。', example: '医疗AI能读CT片诊断肺结节，准确率超过90%资深放射科医生——但不会聊天写诗。' } },
                { id: 'ai-hardware', name: 'AI 硬件生态', fullName: 'AI Hardware Ecosystem', desc: 'NVIDIA/AMD/Apple芯片、AI PC、端侧AI', content: { what: 'AI需要专用硬件支撑。从云端GPU(NVIDIA H100)到端侧芯片(Apple M4 Neural Engine)形成完整生态。', why: 'NVIDIA市值超3万亿美元因为AI算力需求。端侧AI(手机/PC本地跑模型)是2025年新趋势。', remember: 'NVIDIA=AI时代的卖铲人，赚最稳的钱。端侧AI=不联网也能用AI。', example: 'iPhone 15 Pro本地跑Llama 3小模型——不发数据到云端，隐私+离线都能用。' } }
            ]
        },
        {
            id: 'industry-impact', name: '行业影响',
            children: [
                { id: 'ai-education', name: 'AI+教育', fullName: 'AI in Education (EdTech)', desc: '个性化学习、AI导师、自适应教育', content: { what: 'AI让教育个性化成为可能——每个学生有专属AI导师，根据掌握程度调整教学内容和节奏。', why: '教育是AI落地最确定的赛道之一。个性化辅导以前只有富人请得起，AI让它普惠。', remember: 'AI+教育=每人一个私人家教。千人千面的自适应学习。', example: 'Khan Academy的Khanmigo=GPT驱动的AI导师，能像苏格拉底一样通过提问引导学生思考。' } },
                { id: 'ai-healthcare', name: 'AI+医疗', fullName: 'AI in Healthcare', desc: '辅助诊断、药物发现、医学影像、基因分析', content: { what: 'AI在医疗的四大应用：辅助诊断(看片子)、药物研发(预测分子)、基因分析、临床决策支持。', why: '医疗AI能拯救生命——早期癌症筛查、罕见病诊断、新药研发加速。但监管严格落地慢。', remember: 'AI看片比医生快100倍不疲劳不遗漏，但最终决策权仍在医生。', example: 'AlphaFold预测了几乎所有已知蛋白质的3D结构——加速药物研发几十年的工作。' } },
                { id: 'ai-finance', name: 'AI+金融', fullName: 'AI in Finance (FinTech)', desc: '量化交易、风控、智能投顾、反欺诈', content: { what: 'AI在金融领域：量化交易(算法自动交易)、风险控制(信用评估)、反欺诈(异常检测)、智能投顾。', why: '金融数据丰富且数字化程度高——天然适合AI。量化基金已占美股交易量70%+。', remember: 'AI+金融=用数据和算法替代人工判断。速度快/不情绪化/24小时不停。', example: '你的信用卡每笔消费都被AI实时判断是否异常——毫秒级风控比人工快1000倍。' } },
                { id: 'ai-creative', name: 'AI+创意', fullName: 'AI in Creative Industries', desc: 'AI写作、AI音乐、AI设计、AI游戏', content: { what: 'AI进入所有创意领域：文案写作(Claude)、音乐创作(Suno)、平面设计(Midjourney)、游戏开发(NPC对话)。', why: '不是取代创作者而是提升10倍效率。AI做初稿/粗活，人类做创意判断和精细打磨。', remember: 'AI不会取代艺术家，但会取代不用AI的艺术家。它是创意的放大器。', example: 'Suno AI输入"一首关于下雨天咖啡馆的爵士乐"→30秒生成完整歌曲含人声旋律歌词。' } }
            ]
        },
        {
            id: 'ethics-safety', name: '伦理与安全',
            children: [
                { id: 'hallucination', name: '幻觉问题', fullName: 'AI Hallucination', desc: '模型胡编乱造、事实性错误、缓解策略', content: { what: '幻觉=AI自信满满地编造不存在的事实。因为它是按概率生成流畅文本而非检索事实。', why: '这是大模型最致命的缺陷。用AI写法律文书引用了不存在的判例——真实案例导致律师被罚款。', remember: '幻觉=AI胡编还特自信。原因：生成流畅性优先于事实准确性。', example: '让GPT列出参考文献，它可能编造出格式完美但根本不存在的论文——标题作者期刊全是假的。' } },
                { id: 'ai-alignment', name: 'AI 对齐', fullName: 'AI Alignment / AI Safety', desc: '确保AI目标与人类价值观一致、超级对齐', content: { what: 'AI对齐=确保AI系统的目标和行为与人类价值观和意图一致。防止AI追求偏离人类意愿的目标。', why: '如果超级AI的目标和人类不一致可能带来灾难。这是AI安全研究的核心问题。', remember: '对齐=让AI真正为人类服务而非失控。是AI安全最根本的研究方向。', example: '"最大化回形针产量"的AI可能把全球资源都变成回形针——目标对齐出了问题。' } },
                { id: 'bias-fairness', name: '偏见与公平', fullName: 'AI Bias & Fairness', desc: '训练数据偏见、算法歧视、公平性评估', content: { what: 'AI从数据中学习偏见：如果历史数据中某群体被歧视，AI会学到并放大这种歧视。', why: '招聘AI歧视女性、信贷AI歧视少数族裔——AI偏见已造成真实伤害。必须主动检测和缓解。', remember: '垃圾数据→偏见模型→歧视性决策。AI可能放大而非消除社会偏见。', example: 'Amazon曾用AI筛简历，发现它学会了给女性候选人扣分——因为历史数据中工程师大多是男性。' } },
                { id: 'deepfake-misuse', name: 'Deepfake 滥用', fullName: 'Deepfake & AI Misuse', desc: '换脸、AI诈骗、虚假信息、检测技术', content: { what: 'Deepfake用AI生成逼真的伪造音视频。被滥用于诈骗(伪造老板声音)、虚假信息、名人假视频等。', why: '2025年Deepfake诈骗损失已达数十亿美元。检测技术在与生成技术赛跑。', remember: 'AI生成的假视频假音频已经以假乱真——"眼见不为实"的时代到了。', example: '诈骗者用AI克隆某CFO的声音打电话指示转账2500万美元——财务人员完全没听出是假的。' } }
            ]
        }
    ]
};
