// 大语言模型
const DATA_LLM = {
    id: 'llm', name: '大语言模型',
    children: [
        {
            id: 'llm-arch', name: '模型架构',
            children: [
                { id: 'gpt-series', name: 'GPT 系列', fullName: 'Generative Pre-trained Transformer', desc: 'GPT-4o、o1/o3、Decoder-Only自回归', content: { what: 'GPT是OpenAI核心产品线，Decoder-Only架构逐词生成。GPT-4o是多模态版，o1/o3是推理增强版。', why: '理解GPT=理解当今AI产业核心。它引领了大模型时代，是AI商业化最成功案例。', remember: 'GPT=大规模预训练+自回归生成。4o=多模态，o1/o3=深度推理。', example: 'o1遇到难题会"想一想"再答，推理准确率远超GPT-4普通模式。' } },
                { id: 'bert-encoder', name: 'BERT', fullName: 'Bidirectional Encoder Representations from Transformers', desc: 'Encoder-Only、MLM掩码语言模型、文本理解', content: { what: 'BERT用Encoder双向理解文本，训练时遮词让它猜，学会深度语言理解。', why: '生成任务被GPT碾压，但搜索/分类/NER等理解任务BERT仍是主力。', remember: 'GPT看左猜右(生成)；BERT左右都看(理解)。理解任务BERT更强。', example: 'Google搜索用BERT理解查询意图——"apple not fruit"它知道你要找苹果公司。' } },
                { id: 'llama-open', name: 'Llama 开源', fullName: 'Large Language Model Meta AI', desc: 'Meta开源、Llama 3.1 405B、社区生态', content: { what: 'Llama是Meta开源大模型系列，405B版本性能接近GPT-4，完全开源可本地部署商用。', why: '开源大模型标杆。任何人可免费下载修改部署——打破AI被少数公司垄断。', remember: 'Meta开源→社区繁荣→本地部署→不受API限制→数据隐私可控。', example: '很多公司用Llama微调专属模型——不把数据发给OpenAI，既省钱又安全。' } },
                { id: 'deepseek', name: 'DeepSeek', fullName: 'DeepSeek (Chinese AI Lab)', desc: 'V3/R1、MoE架构、开源、低成本训练', content: { what: 'DeepSeek是2024-2025中国最受关注AI公司。V3用MoE实现极低训练成本，R1是推理版，全开源。', why: '证明不需天价算力也能做顶级模型。开源+低成本冲击行业定价体系。', remember: 'DeepSeek=中国开源之光。V3对标GPT-4训练成本低10倍+，R1对标o1。', example: '2025年1月R1发布推理能力匹敌o1，导致OpenAI紧急降价震动全球。' } },
                { id: 'claude', name: 'Claude', fullName: 'Claude (by Anthropic)', desc: 'Constitutional AI、200K长上下文、安全对齐', content: { what: 'Claude是Anthropic的大模型。超长上下文200K token，强调安全对齐，Constitutional AI方法论。', why: '代码和长文本处理最强模型之一，AI安全赛道领军者。', remember: 'Claude=长上下文之王+安全对齐先锋。Constitutional AI=用原则约束AI行为。', example: 'Claude能一次读完10万字的书并回答细节——200K上下文远超大多数竞品。' } },
                { id: 'gemini', name: 'Gemini', fullName: 'Gemini (by Google DeepMind)', desc: '原生多模态、100万token、Google生态', content: { what: 'Gemini是Google最新大模型。原生多模态从底层联合训练文本图像音频视频，100万token窗口。', why: '背靠Google全生态可能是最终覆盖面最广的大模型。', remember: 'Gemini=Google全模态AI。原生多模态+百万token+Google生态深度整合。', example: 'Gemini可以直接看完整YouTube视频并回答视频内容问题——真正的视频理解。' } },
                { id: 'moe', name: 'MoE 混合专家', fullName: 'Mixture of Experts', desc: '稀疏激活、专家网络、Router路由', content: { what: 'MoE把模型分成多个专家子网络，每次推理只激活一小部分。总参数大但实际计算量小。', why: 'DeepSeek-V3和GPT-4据传都用MoE，是大模型降本扩展的主流方向。', remember: '100个专家每次只叫2个干活=参数多但算得快。大模型降本核心trick。', example: '1万亿参数但MoE让每个token只经过200亿参数计算——效率提升5-10倍。' } }
            ]
        },
        {
            id: 'llm-training', name: '训练与对齐',
            children: [
                { id: 'pretraining', name: '预训练', fullName: 'Pre-training (Next Token Prediction)', desc: '大规模语料、Scaling Law、万亿token', content: { what: '预训练是大模型的通识教育——读海量文本万亿token，任务就是预测下一个词。', why: 'Scaling Law：数据量+参数量+算力↑=能力持续涌现。这是能力的根本来源。', remember: '预训练=读遍互联网学语言规律。一切能力的基石。', example: 'GPT-4预训练耗费约1亿美元算力+约13万亿token数据。' } },
                { id: 'sft', name: 'SFT 监督微调', fullName: 'Supervised Fine-Tuning', desc: '指令微调、对话格式、人工编写示例', content: { what: 'SFT用人工编写的高质量指令-回答对微调基座模型，让它学会按指令格式回答。', why: '基座模型只会续写文本，SFT让它变成听懂指令的助手。从模型到产品的关键一步。', remember: '预训练后的模型像百科全书，SFT教会它你问我答的对话方式。', example: '基座输入"北京天气如何"可能写气象论文；SFT后回答"今天晴25度"。' } },
                { id: 'rlhf', name: 'RLHF', fullName: 'Reinforcement Learning from Human Feedback', desc: '奖励模型、PPO算法、人类偏好对齐', content: { what: 'RLHF让AI学会什么回答人类更喜欢：收集人类排序→训练奖励模型→强化学习生成高分回答。', why: '这是ChatGPT从能用变好用的秘密武器。没RLHF的模型经常胡说有害。', remember: 'RLHF=人类当裁判告诉AI哪个好→AI学会生成人类喜欢的回答。', example: 'ChatGPT上线前让数千标注员选"哪个回答更好"来训练。' } },
                { id: 'dpo', name: 'DPO', fullName: 'Direct Preference Optimization', desc: '无需奖励模型、更稳定、2024主流对齐方法', content: { what: 'DPO简化RLHF——不需单独训练奖励模型，直接用好坏回答对比优化，更简单稳定。', why: '2024-2025年DPO几乎取代RLHF成为主流对齐方法。', remember: 'DPO=简化版RLHF。不用训奖励模型，直接从偏好数据学。', example: '给模型看好答案A和差答案B的对比，直接调参数让它倾向生成A类。' } },
                { id: 'scaling-law', name: 'Scaling Law', fullName: 'Scaling Law (Kaplan/Chinchilla)', desc: '参数/数据/算力的幂律关系、最优比例', content: { what: 'Scaling Law揭示模型性能与参数量数据量算力呈可预测幂律关系。', why: '这是大模型军备竞赛的理论基础——只要砸够钱就能变强被数学证实。', remember: '参数x10→误差固定下降。Chinchilla说很多模型太大但数据喂少了。', example: 'GPT-3到GPT-4参数量约x10——性能提升完全符合Scaling Law预测。' } },
                { id: 'context-window', name: '上下文窗口', fullName: 'Context Window / Context Length', desc: '128K/200K/1M token、长文本处理', content: { what: '上下文窗口=模型一次能看到的最大文本量。从4K到1M扩展了250倍。', why: '窗口大小直接决定应用场景。4K只能聊天，128K能分析报告，1M能读代码库。', remember: '上下文窗口=AI的短期记忆容量。越大能处理信息越多，但也越贵越慢。', example: 'Claude 200K能读完哈利波特第一本并答任何细节，GPT-3时代只能看一页。' } }
            ]
        },
        {
            id: 'llm-capabilities', name: '核心能力',
            children: [
                { id: 'icl', name: '上下文学习', fullName: 'In-Context Learning (ICL)', desc: 'Few-shot、Zero-shot、无需训练即学新任务', content: { what: '不用重新训练，只在输入中给几个示例(Few-shot)模型就能学会新任务模式。', why: '大模型最魔法的能力——一个模型通过几个例子就能做无数任务。', remember: '给几个例子就会了不用重新训练=ICL。大模型的顿悟能力。', example: '告诉GPT"happy→快乐，sad→悲伤"两个例子，它就学会了翻译模式。' } },
                { id: 'cot', name: '思维链 CoT', fullName: 'Chain-of-Thought Reasoning', desc: '逐步推理、step by step、推理增强', content: { what: '让AI先想后答——给出最终答案前把推理过程一步步写出来。', why: '加一句step by step就让数学准确率提升40%+。o1核心就是自动化深度CoT。', remember: '别直接答先分步想——一个trick让推理能力暴增。', example: '"9.11和9.9谁大"GPT直接答常错，加step by step后正确率飙升。' } },
                { id: 'multimodal', name: '多模态能力', fullName: 'Multimodal AI (Vision/Audio/Video)', desc: '文本+图片+音频+视频理解与生成', content: { what: '多模态=AI同时处理多种信息：看图说话、听音回答、读视频总结。', why: '2024-2025所有顶级模型都奔向多模态。未来AI交互必然是多模态的。', remember: '多模态=看得见+听得到+能说话=全感官AI。', example: 'GPT-4o能实时语音对话：你说话它听懂思考然后用自然语调回答。' } },
                { id: 'code-gen', name: '代码生成', fullName: 'Code Generation (Copilot/Cursor)', desc: 'Copilot、Cursor、自动补全、从零生成', content: { what: '大模型能写代码，从自动补全到从零生成完整项目。2025年AI编程已成开发者标配。', why: '可能是AI目前投资回报率最高的应用——Copilot让效率提升55%。', remember: '2025年80%+新代码有AI参与（补全/生成/审查）。', example: 'Cursor中描述"写个React登录组件带表单验证"——AI几秒生成可运行代码。' } },
                { id: 'reasoning', name: '推理模型', fullName: 'Reasoning Models (o1/o3/R1)', desc: 'OpenAI o1/o3、DeepSeek-R1、慢思考', content: { what: '推理模型=AI学会慢思考——复杂问题不急着答，内部深度推理后再输出。', why: '2024-2025最重要突破。数学/编程/科学推理接近甚至超越人类专家。', remember: 'o1/o3=AI深度思考模式。用更多计算时间换推理准确率。', example: 'o3在ARC-AGI测试得分87.5%接近人类水平，是里程碑。' } }
            ]
        }
    ]
};
