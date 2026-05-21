// AI 基础原理
const DATA_FUNDAMENTALS = {
    id: 'fundamentals', name: 'AI 基础原理',
    children: [
        {
            id: 'ml-basics', name: '机器学习基础',
            children: [
                { id: 'supervised', name: '监督学习', fullName: 'Supervised Learning', desc: '分类与回归、损失函数、过拟合与正则化', content: { what: '监督学习就像有老师批改作业——你给机器一堆"题目"和"标准答案"（带标签的数据），让它学会从题目推出答案的规律。', why: '这是 AI 最常用的学习方式。推荐系统、垃圾邮件过滤、人脸识别，背后几乎都是监督学习。', remember: '有标签的数据 → 学规律 → 预测新数据，就是监督学习。', example: '给机器看 10000 张猫狗照片（每张标注了"猫"或"狗"），它就学会区分新照片里是猫还是狗。' } },
                { id: 'unsupervised', name: '无监督学习', fullName: 'Unsupervised Learning', desc: '聚类Clustering、降维、异常检测', content: { what: '无监督学习就像让小朋友自己整理玩具——没人告诉他怎么分类，但他会自己发现"这些是车、这些是积木"。', why: '现实中大量数据没有标签。无监督学习能自动发现数据中的隐藏结构，比如用户分群、异常交易检测。', remember: '没有标签，让机器自己发现数据中的规律和分组。', example: '电商把用户自动分成"价格敏感型""品质型""冲动型"，靠的就是聚类算法（如K-Means）。' } },
                { id: 'reinforcement', name: '强化学习', fullName: 'Reinforcement Learning (RL)', desc: 'Q-Learning、策略梯度、RLHF、奖励模型', content: { what: '强化学习就像训练宠物——做对了给奖励（正反馈），做错了惩罚（负反馈），通过不断试错学会最优行为。', why: '它是 ChatGPT 背后的关键技术（RLHF），也是 AlphaGo 击败人类围棋冠军的核心方法。', remember: '试错 + 奖惩 → 学会最优策略。Agent、Game AI、机器人控制都靠它。', example: 'AlphaGo 和自己下了几百万盘棋，每赢一盘就强化"好棋路"，最终超越所有人类棋手。' } },
                { id: 'self-supervised', name: '自监督学习', fullName: 'Self-Supervised Learning', desc: '对比学习、掩码预测、BERT/GPT预训练核心', content: { what: '自监督学习让 AI "自己出题自己做"——把数据一部分遮住当答案，用剩余部分当题目。不需要人类标注。', why: '人类标注成本极高。自监督学习让 AI 用无标签数据就能学习——GPT/BERT 等大模型能训练的核心秘密。', remember: '不靠人工标注，靠数据自身出题——遮住一部分让 AI 猜，就是自监督。', example: 'GPT 预训练就是自监督：遮住句子最后一个词让它预测。读了万亿文本后，学会了语言规律。' } },
                { id: 'transfer-learning', name: '迁移学习', fullName: 'Transfer Learning', desc: '预训练+微调、领域适应、知识迁移', content: { what: '迁移学习就是"举一反三"——先在海量通用数据上学基础能力，再用少量专业数据微调，快速适应新任务。', why: '没有迁移学习，每个新任务都要从零训练。有了它，一个预训练好的大模型可以快速适应几百种下游任务。', remember: '先学通识再学专业，把别处学到的知识"搬"到新任务上。', example: '用 ImageNet 训练好的视觉模型，只需少量X光片微调，就能变成医学影像诊断AI。' } },
                { id: 'evaluation', name: '模型评估指标', fullName: 'Model Evaluation Metrics', desc: '准确率、精确率Precision、召回率Recall、F1、AUC-ROC', content: { what: '模型评估就是给AI体检。Precision（精确率）看"说的对不对"，Recall（召回率）看"该找的找全没"，F1是二者平衡。', why: '只看准确率会被骗——99%正常人的数据中把所有人判定正常也能"准确率99%"，但患者全漏了（召回率=0）。', remember: 'Precision=抓得准，Recall=抓得全，F1=二者调和平均，AUC=整体排序能力。', example: '垃圾邮件：Precision低=正常邮件被误杀（烦人）；Recall低=垃圾漏进来（也烦）。F1帮你找平衡。' } },
                { id: 'overfitting', name: '过拟合与正则化', fullName: 'Overfitting & Regularization', desc: 'Dropout、L1/L2正则、Early Stopping、数据增强', content: { what: '过拟合就是"死记硬背"——训练集上满分，新数据上不行。正则化（Regularization）是防止死记硬背的方法集合。', why: '过拟合是ML最常见的问题。Dropout（随机关闭部分神经元）和Early Stopping（别训太久）是必备武器。', remember: '训练集99%准确 + 测试集60% = 过拟合。模型背了答案但没学会方法。', example: 'Dropout就像考试时随机蒙住一只眼——逼迫每个神经元独立学习，不能只依赖特定搭档。' } }
            ]
        },
        {
            id: 'dl-basics', name: '深度学习基础',
            children: [
                { id: 'neural-networks', name: '神经网络', fullName: 'Artificial Neural Network (ANN)', desc: '感知器、前馈网络、反向传播、激活函数ReLU', content: { what: '神经网络模仿人脑结构——多层"神经元"相连，每层提取不同层级的特征。反向传播（Backpropagation）是训练它的核心算法。', why: '它是所有深度学习的基石。CNN、RNN、Transformer都是在神经网络基础上的变体。', remember: '输入→多层神经元逐层提取特征→输出预测。层数越深，提取的特征越抽象越高级。', example: '识别手写数字：第一层识别"边缘"，第二层识别"笔画"，第三层组合为"形状"，最终判断是几。' } },
                { id: 'cnn', name: 'CNN 卷积网络', fullName: 'Convolutional Neural Network', desc: '卷积核Filter、池化Pooling、特征图、图像识别', content: { what: 'CNN是处理图片的专用网络。用小窗口（卷积核）在图片上滑动扫描提取局部特征，多层叠加后识别复杂物体。', why: '自动驾驶、人脸识别、医学影像——凡是"看图"的AI任务，CNN都是基础架构。', remember: '图像识别之王，核心操作=用小窗口滑动扫描提取局部特征。', example: '手机人脸解锁就是CNN在毫秒内完成你的脸和注册照片的比对。' } },
                { id: 'rnn-lstm', name: 'RNN / LSTM', fullName: 'Recurrent Neural Network / Long Short-Term Memory', desc: '序列建模、时序预测、梯度消失、门控机制', content: { what: 'RNN是有"记忆"的网络——处理序列时能记住前文帮助理解后文。LSTM通过"门控机制"解决了RNN记不住远距离信息的问题。', why: '虽被Transformer取代为主流，但RNN/LSTM在时序预测（股价、天气）和流式数据处理中仍有用武之地。', remember: '处理有先后顺序的数据，能记住前文语境。LSTM=长记忆力的RNN。', example: '手机输入法联想：打"今天天气"联想到"真好"，就是用了序列模型记住上下文。' } },
                { id: 'transformer', name: 'Transformer', fullName: 'Transformer Architecture', desc: '自注意力Self-Attention、位置编码、多头注意力、KQV', content: { what: 'Transformer是当今AI的核心引擎。关键创新是自注意力机制——处理文本时同时看到所有位置，通过Q(查询)K(键)V(值)计算找到最相关的部分。', why: 'GPT、Claude、Gemini、Llama全部基于Transformer。理解它=理解大模型时代的技术根基。', remember: '不像RNN逐词阅读，Transformer"一眼看全文"用注意力打分找重点。QKV是核心计算。', example: '翻译"it was too tired"时，Transformer通过注意力分数精确判断"it"指的是"animal"而非"street"。' } },
                { id: 'attention', name: '注意力机制', fullName: 'Attention Mechanism', desc: 'Self-Attention、Cross-Attention、Multi-Head、Flash Attention', content: { what: '注意力让AI学会"有选择地关注"——给每个输入位置打"重要性分数"，分高的重点看。Flash Attention是2023年的加速优化版。', why: '注意力是Transformer的灵魂。理解了注意力就理解了大模型为什么能处理复杂语言关系。', remember: '对所有输入打重要性分数→加权聚合。多头注意力=多个视角同时分析。', example: '多头注意力=8个人同时读文章：有人看主语、有人看情感、有人看时间——综合得到全面理解。' } },
                { id: 'gan', name: 'GAN 生成对抗', fullName: 'Generative Adversarial Network', desc: '生成器vs判别器、对抗训练、StyleGAN、Deepfake', content: { what: 'GAN由两个网络对抗训练：生成器像"造假高手"，判别器像"鉴定专家"。两者博弈导致双方越来越强。', why: '虽被Diffusion超越为生成主流，GAN在实时生成和Deepfake中仍活跃。理解它有助于理解生成式AI原理。', remember: '一个造假，一个鉴假，互相博弈→两者都变强→生成越来越逼真。', example: 'Deepfake换脸最早就是GAN实现的——生成器不断改进假脸，直到判别器无法分辨真假。' } },
                { id: 'diffusion', name: 'Diffusion 扩散模型', fullName: 'Denoising Diffusion Probabilistic Model (DDPM)', desc: '去噪过程、Stable Diffusion、图像生成、ControlNet', content: { what: '扩散模型思路巧妙：先把图片逐步加噪变成纯噪点，然后训练AI学会"去噪"。生成时从纯噪声出发逐步去噪就得到新图片。', why: 'Midjourney、DALL-E 3、Stable Diffusion背后都是它。生成质量比GAN更多样稳定可控。', remember: '加噪→学去噪→从纯噪声"雕刻"出图片。像把一滴墨滴入水中的过程逆转回来。', example: 'Midjourney输入"赛博朋克猫"，扩散模型从随机噪点出发经50步去噪，逐步"浮现"出这张图。' } }
            ]
        },
        {
            id: 'data-engineering', name: '数据工程',
            children: [
                { id: 'data-cleaning', name: '数据采集与清洗', fullName: 'Data Collection & Cleaning', desc: '爬虫、ETL、去重去噪、缺失值处理', content: { what: '数据采集是获取原始数据（爬虫/API/传感器），清洗是把"脏数据"变干净——去重复、填缺失、修格式。', why: '"垃圾进垃圾出"(GIGO)。再牛的模型，喂脏数据也只产出垃圾。数据质量决定AI效果上限。', remember: '训练前80%时间花在数据清洗——数据是AI的"食物"，不干净必然出问题。', example: 'GPT训练数据要过滤垃圾网页、去重复、去有害内容——光这一步就耗费数月和大量算力。' } },
                { id: 'feature-engineering', name: '特征工程', fullName: 'Feature Engineering', desc: '特征提取、特征选择、One-Hot、标准化', content: { what: '特征工程就是帮模型"找线索"——把原始数据变成模型更容易理解的形式。像侦探从杂乱信息中提取关键线索。', why: '好的特征设计能把模型效果提升数倍。在传统ML中，特征工程的重要性甚至超过模型选择。', remember: '原始数据→提取有价值的"线索"(特征)→喂给模型。好特征=好结果。', example: '预测房价时把"经纬度"转化为"到地铁站距离"——这个特征比原始坐标对模型有用得多。' } },
                { id: 'data-labeling', name: '数据标注', fullName: 'Data Annotation / Labeling', desc: '人工标注、众包平台、主动学习、RLHF标注', content: { what: '数据标注=给数据贴"标签"，告诉AI这张图是"猫"、这段话情感是"正面"。监督学习的前提是有标注数据。', why: '标注质量直接决定模型质量。ChatGPT的RLHF标注（人类给回答打分排序）费用高达数百万美元。', remember: '数据标注=给AI当老师，手动告诉它"正确答案"。质量>数量。', example: '自动驾驶公司雇几千名标注员每天框行人/车辆/红绿灯——一个标注错误可能导致事故。' } },
                { id: 'data-augmentation', name: '数据增强', fullName: 'Data Augmentation', desc: '图像翻转裁剪、文本回译、Mixup、对比学习', content: { what: '数据增强="用少量数据变出更多"——图片旋转翻转缩放，文本同义替换回译，让模型见到更多样的训练样本。', why: '数据越多模型越好，但采集贵。数据增强零成本把1000张图变出10000张，大幅提升泛化能力。', remember: '数据不够？把现有的翻转、拉伸、加噪、换说法——变着花样复制出更多样本。', example: '医学影像数据少且贵，通过旋转缩放调亮度，一张CT片衍生出20个训练样本。' } },
                { id: 'synthetic-data', name: '合成数据', fullName: 'Synthetic Data Generation', desc: 'AI生成训练数据、仿真引擎、隐私友好', content: { what: '合成数据是用AI或仿真程序"凭空生成"的训练数据——不从真实世界采集，而是模拟出来。2025年这成为主流趋势。', why: '真实数据有隐私问题、采集贵、稀缺场景难获取。用AI生成数据训练AI（自举/Self-Play）正在改变训练范式。', remember: '真实数据不够或不能用？让AI自己造数据训练自己。', example: '自动驾驶公司用3D仿真引擎生成极端天气驾驶场景——比等一年暴风雪高效百倍。' } },
                { id: 'tokenization', name: 'Tokenization 分词', fullName: 'Tokenization (BPE/WordPiece/SentencePiece)', desc: 'BPE字节对编码、Token数量与费用、中英文差异', content: { what: 'Tokenization是把文本切成"token"（词元）。大模型不逐字处理，而是切成子词片段。如"unhappiness"→"un"+"happiness"。', why: 'Token数直接决定API费用和上下文限制。中文约1字=1-2 token，英文1词=1-3 token。了解token能省钱。', remember: 'Token≈一个词或词的一部分。GPT按token收费，了解分词规则能帮你省钱。', example: 'ChatGPT按token计费：中文"人工智能"≈4个token，英文"AI"只1个。同样内容中文比英文"贵"。' } }
            ]
        },
        {
            id: 'math-foundations', name: '数学基础（直觉版）',
            children: [
                { id: 'linear-algebra', name: '线性代数', fullName: 'Linear Algebra', desc: '矩阵、向量、特征值分解、SVD分解', content: { what: '线性代数是AI的"计算语言"。所有数据在神经网络中都以矩阵/向量形式运算，一次矩阵乘法完成成千上万并行计算。', why: '理解向量和矩阵乘法的直觉是理解Embedding、注意力机制等核心概念的基础。不需证明，要直觉。', remember: 'AI看世界的方式：一切都是向量，一切运算都是矩阵乘法。GPU就是矩阵乘法加速器。', example: '"国王"变成向量后，国王-男人+女人≈王后——这就是向量空间中语义关系的魔法。' } },
                { id: 'probability', name: '概率与统计', fullName: 'Probability & Statistics', desc: '贝叶斯定理、概率分布、最大似然、采样', content: { what: '概率是AI处理不确定性的数学工具。每个AI预测本质上是概率——"95%确信这是猫"。大模型生成文字=逐步采样概率分布。', why: '理解概率才能理解AI为什么"幻觉"（采样到低概率但流畅的内容），以及temperature参数的含义。', remember: 'AI不是给确定答案，而是选概率最高的。temperature控制"多敢冒险"。', example: 'Temperature=0→AI总选概率最高的词（保守/重复），=1→敢选低概率词（创意/有时胡说）。' } },
                { id: 'optimization', name: '优化与梯度下降', fullName: 'Optimization & Gradient Descent', desc: '损失函数Loss、梯度、学习率、Adam优化器', content: { what: '优化=在高维空间找"最低点"。损失函数衡量预测有多错，梯度下降=沿最陡方向走一小步来减小损失。', why: '所有模型训练的本质都是优化问题。Adam（自适应学习率）是2025年最主流的优化器。', remember: '训练AI=反复微调参数让loss变小=在亿维空间里找最低谷。Adam帮你自动调步幅。', example: '学习率就像下山步幅：太大跨过谷底振荡，太小走一万年。Adam能自动根据地形调步伐。' } },
                { id: 'embedding', name: 'Embedding 向量嵌入', fullName: 'Embedding / Vector Representation', desc: '词向量Word2Vec、句向量、语义相似度、向量检索', content: { what: 'Embedding把文字/图片等内容变成固定长度的数字向量。语义相似的内容，向量距离近；语义不同的距离远。', why: '这是RAG、语义搜索、推荐系统的底层技术。所有"让AI理解内容相似度"的功能，底层都是Embedding。', remember: '把一切内容变成向量→相似的靠近、不同的远离。是语义搜索和RAG的核心。', example: '"苹果公司"和"iPhone"的向量很近(语义相关)，和"水果苹果"较远。搜索引擎靠这个理解你真正想找什么。' } }
            ]
        }
    ]
};
