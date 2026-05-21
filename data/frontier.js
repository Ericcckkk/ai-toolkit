// AI 前沿与趋势
const DATA_FRONTIER = {
    id: 'frontier', name: 'AI 前沿与趋势',
    children: [
        {
            id: 'frontier-2025', name: '2025 热点',
            children: [
                { id: 'agi-path', name: 'AGI 通用人工智能', fullName: 'Artificial General Intelligence', desc: '像人一样全面智能、OpenAI路线图、Level 1-5', content: { what: 'AGI=拥有人类级别的全面智能。能理解学习并完成任何人类能做的智力任务（目前AI还不是AGI）。', why: '这是整个AI领域的终极目标。OpenAI、DeepMind等宣称3-5年内可能实现。但定义有争议。', remember: '当前AI=某些任务超越人类但远非全面智能。AGI=所有任务都达人类水平。', example: 'GPT-4能写代码写诗但不能像5岁小孩一样理解物理世界——这就是距AGI的差距。' } },
                { id: 'test-time-compute', name: '测试时计算', fullName: 'Test-Time Compute / Inference Scaling', desc: 'o1/o3的推理时思考、用更多计算换更好结果', content: { what: '让AI在推理（回答问题）时花更多计算时间深度思考——而非只靠训练时学到的能力。', why: '这是2024-2025最重要的范式转变之一。以前只能堆训练算力，现在也能堆推理算力。', remember: '训练时Scaling Law→推理时也能Scaling。花更多时间想=答得更好。', example: 'o1解数学题花30秒思考（内部推理几千token）比GPT-4花1秒直接答准确率高50%。' } },
                { id: 'world-model', name: '世界模型', fullName: 'World Model / Predictive Model', desc: '理解物理规律、因果推理、视频预测、Sora背后', content: { what: '世界模型=AI对现实世界运转规律的内部模拟。Sora能生成物理逼真视频说明它学到了部分世界模型。', why: '真正的智能需要理解因果而非只是统计关联。世界模型可能是通向AGI的关键一步。', remember: '世界模型=AI心中的"物理引擎"。理解重力碰撞流体——不只是看像。', example: 'Sora生成球弹地视频时符合物理规律——说明它理解了重力和弹性而非只是复制看过的画面。' } },
                { id: 'ai-agent-2025', name: '2025 Agent 爆发', fullName: 'AI Agent Year 2025', desc: 'Agent元年、Computer Use、操作系统级AI', content: { what: '2025年被称为Agent元年——AI从对话助手升级为能自主操作电脑完成任务的智能体。', why: 'Claude Computer Use、Manus等证明Agent已从论文走向产品。接下来1-2年Agent将改变知识工作模式。', remember: '2025=Agent元年。AI从回答问题→自己操作电脑做事。', example: 'Claude Computer Use能自己打开浏览器、搜索信息、填写表格、保存文件——像远程操控你的电脑。' } },
                { id: 'ai-os', name: 'AI 操作系统', fullName: 'AI Operating System / AI-First OS', desc: '以AI为核心的操作系统、自然语言操控、个人AI管家', content: { what: 'AI OS=以大模型为核心的操作系统。不再通过点击图标操作，而是用自然语言告诉AI你想做什么。', why: '可能是继GUI(图形界面)→Touch(触摸)之后的第三次交互革命。', remember: 'AI OS=从点图标到说话操作电脑。界面不再重要因为AI帮你操作。', example: '"帮我把昨天会议录音整理成纪要发给团队"→AI OS自动找录音→转写→总结→发邮件。' } }
            ]
        },
        {
            id: 'emerging-tech', name: '新兴技术',
            children: [
                { id: 'neuro-symbolic', name: '神经符号融合', fullName: 'Neuro-Symbolic AI', desc: '神经网络+逻辑推理、结合直觉与理性', content: { what: '把神经网络(擅长模式识别/直觉)和符号AI(擅长逻辑推理/规则)结合——各取所长。', why: '大模型逻辑推理弱(会幻觉)、符号AI不灵活。融合二者可能解决推理可靠性问题。', remember: '神经网络=直觉，符号系统=逻辑。融合=既有直觉又讲逻辑的AI。', example: '让大模型理解自然语言→转化为逻辑表达式→用推理引擎精确推导→转回自然语言回答。' } },
                { id: 'embodied-ai', name: '具身智能', fullName: 'Embodied AI / Robotics AI', desc: '有身体的AI、机器人大模型、物理世界交互', content: { what: '具身智能=让AI拥有物理身体(机器人)并在真实世界中行动。大模型+机器人=能理解语言又能动手干活。', why: '纯数字AI终究活在屏幕里。具身智能让AI走入物理世界——做家务搬货物手术操作。', remember: '大模型是大脑，机器人是身体。具身智能=有脑有身的AI。', example: 'Figure 01机器人：你说"帮我把桌上的苹果放冰箱"→它听懂→识别苹果→抓起→放入冰箱。' } },
                { id: 'quantum-ai', name: '量子计算+AI', fullName: 'Quantum Computing for AI', desc: '量子加速、量子机器学习、未来10年', content: { what: '量子计算利用量子力学特性做计算。理论上某些AI问题(如组合优化)量子计算机能指数级加速。', why: '目前仍处早期但Google/IBM在突破。可能5-10年后量子+AI产生颠覆性应用。', remember: '量子+AI=未来方向但目前还早。可能大幅加速特定AI计算。', example: 'Google Willow量子芯片在特定问题上比最强超算快10的25次方倍——虽然还不能直接训练AI。' } },
                { id: 'brain-interface', name: '脑机接口', fullName: 'Brain-Computer Interface (BCI)', desc: 'Neuralink、意念控制、神经信号解码', content: { what: '脑机接口让大脑和计算机直接通信。读取脑电信号→翻译为指令（打字/控制机械臂/操作电脑）。', why: '目前主要帮助瘫痪患者。长期来看可能实现人脑与AI的直接融合。', remember: '脑机接口=大脑直接和电脑对话。目前主要是医疗用途。', example: 'Neuralink让瘫痪患者通过意念操控电脑光标——用想象就能打字和上网。' } },
                { id: 'synthetic-bio', name: 'AI+生物技术', fullName: 'AI for Biology / Synthetic Biology', desc: 'AlphaFold、蛋白质设计、基因编辑、药物AI', content: { what: 'AI解决生物学核心问题：蛋白质结构预测(AlphaFold)、新蛋白质设计、药物分子生成、基因功能预测。', why: 'AlphaFold被称为AI在科学领域最重大的突破。它将彻底加速药物研发和生命科学。', remember: 'AI+Bio=用AI理解和设计生命分子。AlphaFold=诺贝尔奖级别突破。', example: 'AlphaFold预测了2亿+蛋白质3D结构——过去50年人类实验只解出了约20万个。' } }
            ]
        },
        {
            id: 'learning-path', name: '学习路径建议',
            children: [
                { id: 'beginner-path', name: '小白入门路径', fullName: 'Beginner Learning Path', desc: '从零开始学AI、推荐顺序、避坑指南', content: { what: '建议路径：先用AI工具(ChatGPT/Cursor)→学提示词工程→理解基本概念→按兴趣深入技术或应用。', why: '先用起来再理解原理。很多人从数学公式入门然后放弃——不如先体验AI的强大再学为什么强。', remember: '先用→再懂→后深入。别从公式开始，从体验开始。', example: '第一周用ChatGPT完成各种任务→第二周学提示词→第三周读本地图→之后按兴趣选方向。' } },
                { id: 'developer-path', name: '开发者进阶', fullName: 'Developer Advanced Path', desc: 'API开发、RAG搭建、Agent构建、模型微调', content: { what: '开发者路径：调API做应用→搭RAG知识库→构建Agent→尝试微调→了解训练原理。', why: '不需要从零训练模型。90%的AI开发者工作是调用模型API并做应用层创新。', remember: '大多数人不需要训练模型——学会用模型做产品就能创造巨大价值。', example: '用OpenAI API + LangChain 搭一个公司内部知识库问答系统——这就是有价值的AI开发。' } },
                { id: 'keep-updated', name: '持续跟进前沿', fullName: 'Stay Updated with AI', desc: '信息源推荐、社区、论文解读、实践项目', content: { what: 'AI领域每周都有重大突破。推荐信息源：Twitter/X上AI研究者、机器之心、量子位、Hacker News。', why: 'AI知识半衰期极短——6个月前的最佳实践可能已过时。持续学习是必须的。', remember: 'AI变化太快。每周花1小时跟进最新动态是必要投资。', example: '关注@kaborney(Karpathy)、@AndrewYNg(吴恩达)、机器之心公众号——覆盖最重要的AI进展。' } }
            ]
        }
    ]
};
