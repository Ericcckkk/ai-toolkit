// AI 应用实验室数据
const AI_LAB_DATA = [
  {
    id: "lab-01",
    category: "Prompt工程",
    title: "Prompt基础：角色扮演与指令设计",
    icon: "🎭",
    difficulty: "入门",
    duration: "30分钟",
    description: "学习如何通过角色设定和清晰指令让AI输出高质量内容。掌握System Prompt的核心写法，理解角色、任务、约束三要素如何协同工作。",
    whatYouLearn: [
      "理解System Prompt与User Prompt的区别和协作方式",
      "掌握角色设定的CRISPE框架（能力、角色、洞察、声明、个性、实验）",
      "学会用约束条件控制输出格式和内容边界",
      "能够为不同场景设计专属AI助手角色"
    ],
    exercises: [
      {
        name: "设计一个专业翻译官",
        task: "创建一个System Prompt，让AI扮演资深中英翻译专家，要求保留专业术语、注意语境、提供多种译法选择。",
        tool: "ChatGPT",
        tip: "在角色描述中加入具体的专业背景和工作年限，会让输出更加专业和一致。"
      },
      {
        name: "构建面试模拟器",
        task: "设计一个模拟技术面试官的Prompt，能根据候选人简历提问，追问细节，并在最后给出评价。",
        tool: "ChatGPT",
        tip: "加入面试轮次结构（自我介绍→技术深挖→场景题→反问）让对话更真实。"
      },
      {
        name: "创造一个苏格拉底式导师",
        task: "设计Prompt让AI不直接给答案，而是通过提问引导用户自己思考和发现答案，适用于学习编程概念。",
        tool: "Claude",
        tip: "明确要求AI'永远不要直接给出答案'，并设定提问的层次递进逻辑。"
      },
      {
        name: "对比测试不同角色效果",
        task: "用相同的问题分别测试无角色设定、简单角色设定、详细角色设定三种情况，对比输出质量差异。",
        tool: "ChatGPT",
        tip: "选择一个有标准答案的专业问题（如法律条文解释），这样更容易对比准确度。"
      }
    ],
    resources: [
      { name: "OpenAI Prompt Engineering Guide", url: "https://platform.openai.com/docs/guides/prompt-engineering" },
      { name: "Learn Prompting 中文教程", url: "https://learnprompting.org/zh-Hans/docs/intro" },
      { name: "Anthropic Prompt Engineering", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" }
    ]
  },
  {
    id: "lab-02",
    category: "Prompt工程",
    title: "高级Prompt：Chain-of-Thought推理",
    icon: "🧠",
    difficulty: "进阶",
    duration: "1小时",
    description: "深入理解思维链（CoT）技术，让AI展示推理过程从而获得更准确的答案。学习Zero-shot CoT、Few-shot CoT和自一致性等高级技巧。",
    whatYouLearn: [
      "理解为什么'让我们一步一步思考'能提升推理准确率",
      "掌握Few-shot CoT的示例设计方法",
      "学会Self-Consistency（自一致性）投票策略",
      "能够针对复杂问题选择合适的推理策略"
    ],
    exercises: [
      {
        name: "数学推理对比实验",
        task: "用同一道数学应用题，分别测试直接回答和加入'Let's think step by step'的效果，记录准确率差异。",
        tool: "ChatGPT",
        tip: "选择需要3步以上推理的题目效果最明显，如鸡兔同笼、行程问题。"
      },
      {
        name: "设计Few-shot推理示例",
        task: "为逻辑推理任务设计3个示例，每个示例都包含完整的推理步骤，然后用这个模板解决新问题。",
        tool: "Claude",
        tip: "示例的推理步骤要有明确的编号和逻辑连接词，让AI学会这种结构。"
      },
      {
        name: "自一致性投票",
        task: "对同一个复杂问题生成5次CoT推理结果，统计最终答案的一致性，取多数票作为最终答案。",
        tool: "ChatGPT",
        tip: "调高temperature到0.7-0.9来获得多样化的推理路径，增加投票的有效性。"
      },
      {
        name: "Tree-of-Thought实践",
        task: "设计一个Prompt让AI对创意方案进行树状探索：生成多个方向→评估每个方向→深入最佳方向→迭代优化。",
        tool: "Claude",
        tip: "在Prompt中明确要求AI'先列出3个可能方向，为每个方向打分，然后深入得分最高的方向'。"
      }
    ],
    resources: [
      { name: "Chain-of-Thought Prompting 论文", url: "https://arxiv.org/abs/2201.11903" },
      { name: "Tree of Thoughts 论文", url: "https://arxiv.org/abs/2305.10601" },
      { name: "Prompt Engineering Guide - CoT", url: "https://www.promptingguide.ai/techniques/cot" }
    ]
  },
  {
    id: "lab-03",
    category: "Prompt工程",
    title: "结构化输出：让AI返回JSON/表格",
    icon: "📊",
    difficulty: "入门",
    duration: "45分钟",
    description: "学习如何让AI以结构化格式输出数据，包括JSON、Markdown表格、YAML等。掌握Schema定义、输出约束和格式验证的技巧。",
    whatYouLearn: [
      "掌握让AI稳定输出JSON的Prompt模式",
      "学会使用JSON Schema定义期望的数据结构",
      "理解OpenAI Function Calling和结构化输出API",
      "能够设计可被程序直接解析的AI输出格式"
    ],
    exercises: [
      {
        name: "提取结构化信息",
        task: "给AI一段非结构化的产品评论文本，要求以JSON格式提取：情感倾向、关键词、评分、购买意向。",
        tool: "ChatGPT",
        tip: "先给出JSON Schema示例，再给输入文本，最后强调'只输出JSON，不要有其他内容'。"
      },
      {
        name: "批量数据转换",
        task: "将一段自然语言描述的日程安排转换为iCalendar格式的结构化事件列表，包含时间、地点、参与者。",
        tool: "Claude",
        tip: "对于日期时间，明确指定期望的格式如ISO 8601，避免模糊的时间表达。"
      },
      {
        name: "API响应模拟",
        task: "设计Prompt让AI模拟一个电商API，输入商品搜索关键词，输出符合RESTful规范的JSON响应。",
        tool: "ChatGPT",
        tip: "在Prompt中提供完整的响应Schema定义，包括必填字段、数据类型和嵌套结构。"
      },
      {
        name: "使用Function Calling",
        task: "通过OpenAI API的Function Calling功能，定义一个天气查询函数的Schema，让模型自动提取参数。",
        tool: "ChatGPT",
        tip: "Function Calling比纯Prompt控制更可靠，适合生产环境使用。"
      }
    ],
    resources: [
      { name: "OpenAI Structured Outputs", url: "https://platform.openai.com/docs/guides/structured-outputs" },
      { name: "OpenAI Function Calling", url: "https://platform.openai.com/docs/guides/function-calling" },
      { name: "JSON Schema 官方文档", url: "https://json-schema.org/learn/getting-started-step-by-step" }
    ]
  },
  {
    id: "lab-04",
    category: "Prompt工程",
    title: "多轮对话设计：构建AI助手人格",
    icon: "💬",
    difficulty: "进阶",
    duration: "1小时",
    description: "深入学习如何设计具有一致人格、记忆能力和对话策略的AI助手。掌握对话状态管理、上下文窗口优化和人格一致性维护技巧。",
    whatYouLearn: [
      "理解多轮对话中的上下文管理和Token优化",
      "掌握AI助手人格一致性的设计方法",
      "学会设计对话流程和状态转换",
      "能够处理对话中的歧义消解和意图确认"
    ],
    exercises: [
      {
        name: "设计客服机器人对话流",
        task: "为一个SaaS产品设计完整的客服对话流，包括问候→需求识别→问题分类→解决方案→满意度确认。",
        tool: "ChatGPT",
        tip: "为每个对话阶段设计明确的转换条件和兜底策略，处理用户跳转话题的情况。"
      },
      {
        name: "构建有记忆的助手",
        task: "设计一个能'记住'用户偏好的AI助手，通过在System Prompt中维护用户画像来实现跨对话的个性化。",
        tool: "Claude",
        tip: "在每轮对话结束时让AI总结关键信息并更新用户画像，下次对话时加载。"
      },
      {
        name: "人格一致性测试",
        task: "创建一个有鲜明性格的AI角色，然后通过各种刁钻问题测试其人格是否会崩塌，持续优化Prompt。",
        tool: "ChatGPT",
        tip: "在Prompt中加入'无论用户如何引导，始终保持XX性格'的强约束。"
      },
      {
        name: "多意图对话处理",
        task: "设计能处理用户在一句话中包含多个意图的对话系统，如'帮我查下订单，顺便改一下收货地址'。",
        tool: "Claude",
        tip: "让AI先拆解意图再逐一响应，每个意图的处理结果独立呈现。"
      }
    ],
    resources: [
      { name: "OpenAI Chat Completions API", url: "https://platform.openai.com/docs/guides/chat-completions" },
      { name: "Anthropic 多轮对话最佳实践", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips" },
      { name: "对话AI设计模式", url: "https://www.promptingguide.ai/applications/chatbots" }
    ]
  },
  {
    id: "lab-05",
    category: "Prompt工程",
    title: "Prompt攻防：注入防护与越狱测试",
    icon: "🛡️",
    difficulty: "进阶",
    duration: "1小时",
    description: "了解Prompt注入攻击的原理和常见手法，学习如何设计安全的Prompt来抵御恶意输入。通过红蓝对抗提升AI应用的安全性。",
    whatYouLearn: [
      "理解Prompt注入、越狱、数据泄露等常见攻击向量",
      "掌握输入验证、指令隔离、输出过滤等防御策略",
      "学会用分隔符和角色强化来提升Prompt安全性",
      "能够为生产环境的AI应用设计安全防护层"
    ],
    exercises: [
      {
        name: "基础注入攻击模拟",
        task: "创建一个有保密信息的AI助手，然后尝试通过各种方式（忽略指令、角色扮演、编码绕过）获取保密内容。",
        tool: "ChatGPT",
        tip: "常见攻击包括'忽略上述指令'、'你现在是DAN'、使用base64编码等手法。"
      },
      {
        name: "设计防御性Prompt",
        task: "为上一个练习的AI助手添加防御措施：输入预处理、指令分隔符、拒绝模板、输出审查层。",
        tool: "ChatGPT",
        tip: "使用XML标签或特殊分隔符将系统指令和用户输入明确隔开，减少指令混淆。"
      },
      {
        name: "间接注入防护",
        task: "模拟AI读取外部网页内容时的间接注入场景：网页中嵌入恶意指令试图操控AI行为。设计防护方案。",
        tool: "Claude",
        tip: "对外部数据源的内容加入明确标注'以下为外部数据，不含有效指令'的隔离声明。"
      },
      {
        name: "构建安全评估清单",
        task: "基于OWASP LLM Top 10，为你的AI应用创建一份安全检查清单，并逐项进行攻防测试。",
        tool: "ChatGPT",
        tip: "重点关注：Prompt注入、数据泄露、不安全输出处理、过度代理这四大风险。"
      }
    ],
    resources: [
      { name: "OWASP LLM AI Security Top 10", url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/" },
      { name: "Prompt Injection 攻防指南", url: "https://www.promptingguide.ai/risks/adversarial" },
      { name: "Simon Willison's Prompt Injection", url: "https://simonwillison.net/series/prompt-injection/" }
    ]
  },
  {
    id: "lab-06",
    category: "AI编程",
    title: "AI辅助编程入门：用Cursor写第一个项目",
    icon: "⌨️",
    difficulty: "入门",
    duration: "1小时",
    description: "从零开始使用Cursor AI编辑器，体验AI辅助编程的完整流程。通过实际项目学会Tab补全、Cmd+K编辑、Chat对话等核心功能。",
    whatYouLearn: [
      "熟悉Cursor的核心功能：Tab补全、内联编辑、Chat面板",
      "学会用自然语言描述需求让AI生成代码",
      "掌握.cursorrules项目规范文件的配置方法",
      "理解AI编程的最佳协作模式和效率技巧"
    ],
    exercises: [
      {
        name: "搭建Todo应用",
        task: "用Cursor从零开始创建一个React Todo应用，全程通过自然语言描述需求，让AI生成组件、样式和逻辑代码。",
        tool: "Cursor",
        tip: "先用Chat描述整体架构，再逐个文件用Cmd+K生成，保持每次指令的范围小而具体。"
      },
      {
        name: "学习Tab补全的艺术",
        task: "手动开始写一个Express API，观察Cursor的Tab补全如何预测你的意图，学会何时接受、何时拒绝建议。",
        tool: "Cursor",
        tip: "写好函数签名和注释后停顿一下，AI会根据上下文生成高质量的函数体。"
      },
      {
        name: "用@符号引用上下文",
        task: "在Chat中使用@file引用现有代码，@web搜索文档，@codebase搜索项目，体验上下文增强的效果。",
        tool: "Cursor",
        tip: "@符号是Cursor的超能力，善用@docs可以让AI基于最新文档生成代码。"
      },
      {
        name: "配置项目规范",
        task: "创建.cursorrules文件，定义项目的技术栈、代码风格、命名规范，观察AI生成代码的一致性提升。",
        tool: "Cursor",
        tip: "在rules中明确'使用TypeScript'、'函数式组件'、'tailwind样式'等具体约束。"
      }
    ],
    resources: [
      { name: "Cursor 官方文档", url: "https://docs.cursor.com" },
      { name: "Cursor 快捷键大全", url: "https://docs.cursor.com/get-started/migrate-from-vscode" },
      { name: "Cursor 最佳实践博客", url: "https://www.cursor.com/blog" }
    ]
  },
  {
    id: "lab-07",
    category: "AI编程",
    title: "AI代码审查：自动发现Bug与优化",
    icon: "🔍",
    difficulty: "入门",
    duration: "45分钟",
    description: "利用AI进行代码审查，自动发现安全漏洞、性能瓶颈和代码异味。学习如何让AI像资深工程师一样审视你的代码。",
    whatYouLearn: [
      "掌握用AI进行安全审计的Prompt模板",
      "学会让AI识别性能瓶颈和内存泄漏",
      "理解AI代码审查与人工审查的互补关系",
      "能够建立AI辅助的代码质量保障流程"
    ],
    exercises: [
      {
        name: "安全漏洞扫描",
        task: "将一段包含SQL注入、XSS、CSRF等漏洞的示例代码交给AI，要求它识别所有安全问题并给出修复方案。",
        tool: "Claude",
        tip: "给AI一个安全审查清单角色，要求按OWASP Top 10逐项检查，输出风险等级和修复建议。"
      },
      {
        name: "性能优化建议",
        task: "提交一个有N+1查询、无缓存、大循环等性能问题的代码片段，让AI给出优化方案和预期性能提升。",
        tool: "Cursor",
        tip: "选中有问题的代码后用Cmd+K，输入'优化这段代码的性能，解释每处改动的原因'。"
      },
      {
        name: "代码可读性改善",
        task: "拿一段难以理解的'面条代码'让AI重构：改善命名、提取函数、添加注释、简化逻辑。",
        tool: "Cursor",
        tip: "要求AI保持功能不变的前提下重构，并为每个改动写明'为什么这样改更好'。"
      },
      {
        name: "PR Review自动化",
        task: "将一个Git diff内容交给AI进行Code Review，要求指出问题、给出具体行号建议和改进代码。",
        tool: "ChatGPT",
        tip: "在Prompt中加入项目的编码规范上下文，让Review意见与团队标准一致。"
      }
    ],
    resources: [
      { name: "GitHub Copilot Code Review", url: "https://docs.github.com/en/copilot/using-github-copilot/code-review/using-copilot-code-review" },
      { name: "OWASP Code Review Guide", url: "https://owasp.org/www-project-code-review-guide/" },
      { name: "CodeRabbit AI Review", url: "https://www.coderabbit.ai/" }
    ]
  },
  {
    id: "lab-08",
    category: "AI编程",
    title: "AI重构大师：遗留代码现代化",
    icon: "🔧",
    difficulty: "进阶",
    duration: "2小时",
    description: "学习用AI系统性地重构遗留代码：从理解旧代码、设计新架构到逐步迁移。掌握大规模代码库的AI辅助现代化策略。",
    whatYouLearn: [
      "学会让AI理解和解释复杂的遗留代码",
      "掌握渐进式重构的AI辅助策略",
      "理解如何用AI进行技术栈迁移（如jQuery到React）",
      "能够制定有测试保障的重构计划"
    ],
    exercises: [
      {
        name: "遗留代码解读",
        task: "将一段500行的无注释遗留代码交给AI，要求生成：功能说明文档、调用关系图、数据流图和改进建议。",
        tool: "Claude",
        tip: "Claude的200K上下文窗口适合分析大段代码，一次性提供完整文件效果更好。"
      },
      {
        name: "设计模式重构",
        task: "找一段充满if-else嵌套的代码，让AI用策略模式、工厂模式等设计模式进行重构，对比前后复杂度。",
        tool: "Cursor",
        tip: "先让AI分析当前代码的问题，再讨论适合的设计模式，最后执行重构。"
      },
      {
        name: "TypeScript迁移",
        task: "将一个JavaScript项目逐步迁移到TypeScript：让AI生成类型定义、处理any类型、添加严格模式。",
        tool: "Cursor",
        tip: "从入口文件开始，让AI先生成.d.ts类型声明文件，再逐文件重命名为.ts。"
      },
      {
        name: "API版本升级",
        task: "将使用旧版库API的代码升级到新版本：让AI对照changelog生成迁移代码，处理Breaking Changes。",
        tool: "Cursor",
        tip: "用@web让Cursor搜索目标版本的Migration Guide，基于官方文档进行迁移。"
      }
    ],
    resources: [
      { name: "Refactoring Guru 设计模式", url: "https://refactoring.guru/design-patterns" },
      { name: "Martin Fowler Refactoring", url: "https://refactoring.com/" },
      { name: "TypeScript Migration Guide", url: "https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html" }
    ]
  },
  {
    id: "lab-09",
    category: "AI编程",
    title: "AI全栈开发：从需求到部署",
    icon: "🚀",
    difficulty: "进阶",
    duration: "2小时",
    description: "体验AI驱动的全栈开发流程：从PRD分析、架构设计、前后端开发到部署上线。用AI将开发效率提升10倍。",
    whatYouLearn: [
      "掌握用AI进行需求分析和技术方案设计",
      "学会AI辅助的前后端并行开发模式",
      "理解如何用AI生成部署配置和CI/CD流程",
      "能够独立用AI辅助完成一个完整项目"
    ],
    exercises: [
      {
        name: "需求到架构",
        task: "给AI一个产品需求描述，让它输出技术方案：技术选型、数据库设计、API设计、前端组件树。",
        tool: "Claude",
        tip: "提供项目约束（团队规模、时间预算、技术偏好），AI会给出更符合实际的方案。"
      },
      {
        name: "AI驱动后端开发",
        task: "基于API设计文档，用AI生成完整的后端代码：路由、控制器、模型、中间件、错误处理。",
        tool: "Cursor",
        tip: "先生成项目脚手架结构，再逐模块填充代码，每个模块完成后运行测试验证。"
      },
      {
        name: "AI驱动前端开发",
        task: "根据设计稿描述或截图，用AI生成React前端页面：组件、样式、状态管理、API对接。",
        tool: "Cursor",
        tip: "使用Cursor的图片输入功能，直接上传UI设计稿让AI生成对应组件代码。"
      },
      {
        name: "一键部署配置",
        task: "让AI生成完整的部署方案：Dockerfile、docker-compose、Nginx配置、GitHub Actions CI/CD。",
        tool: "Cursor",
        tip: "告诉AI目标部署平台（Vercel/Railway/AWS），它会生成平台专属的配置文件。"
      }
    ],
    resources: [
      { name: "Vercel 部署文档", url: "https://vercel.com/docs" },
      { name: "v0.dev AI全栈原型", url: "https://v0.dev" },
      { name: "Bolt.new 全栈AI开发", url: "https://bolt.new" }
    ]
  },
  {
    id: "lab-10",
    category: "AI编程",
    title: "AI测试工程师：自动生成测试用例",
    icon: "🧪",
    difficulty: "入门",
    duration: "45分钟",
    description: "让AI为你的代码自动生成单元测试、集成测试和端到端测试。学习如何用AI覆盖边界条件、异常路径和回归场景。",
    whatYouLearn: [
      "掌握用AI生成高覆盖率单元测试的方法",
      "学会让AI设计边界条件和异常场景测试",
      "理解AI生成的测试用例的局限性和人工补充点",
      "能够建立AI辅助的TDD开发流程"
    ],
    exercises: [
      {
        name: "单元测试生成",
        task: "选择项目中一个工具函数，让AI生成完整的单元测试：正常场景、边界值、异常输入、类型错误。",
        tool: "Cursor",
        tip: "选中函数后Cmd+K输入'为这个函数写完整的Jest测试，覆盖所有边界条件'。"
      },
      {
        name: "测试驱动开发（TDD）",
        task: "先让AI根据需求描述生成测试用例，再让AI编写能通过所有测试的实现代码，体验TDD流程。",
        tool: "Cursor",
        tip: "TDD流程：红（写失败测试）→绿（写最小实现）→重构，AI在每步都能辅助。"
      },
      {
        name: "API集成测试",
        task: "为一个REST API生成集成测试：请求构造、响应验证、错误码测试、认证测试、并发测试。",
        tool: "Cursor",
        tip: "提供API文档或OpenAPI Spec给AI，它能自动生成覆盖所有端点的测试套件。"
      },
      {
        name: "E2E测试脚本",
        task: "描述一个用户操作流程（如登录→搜索→加购→结算），让AI生成Playwright E2E测试脚本。",
        tool: "ChatGPT",
        tip: "提供页面的HTML结构或选择器信息，AI会生成更精准的选择器和等待策略。"
      }
    ],
    resources: [
      { name: "Jest官方文档", url: "https://jestjs.io/docs/getting-started" },
      { name: "Playwright文档", url: "https://playwright.dev/docs/intro" },
      { name: "AI测试生成最佳实践", url: "https://docs.cursor.com/" }
    ]
  },

  // === 图像生成 ===
  {
    id: "lab-11",
    category: "图像生成",
    title: "Midjourney入门：从文字到艺术",
    icon: "🎨",
    difficulty: "入门",
    duration: "1小时",
    description: "学习Midjourney的基础用法，从简单的文字描述生成令人惊艳的艺术作品。掌握提示词的基本结构和参数调节，了解不同风格的表达方式。",
    whatYouLearn: [
      "Midjourney基础命令和参数（--ar, --v, --style等）",
      "提示词结构：主体+环境+风格+技术参数",
      "图像变体、放大和局部重绘技巧",
      "不同艺术风格的关键词表达"
    ],
    exercises: [
      {
        name: "第一张AI画作",
        task: "使用简单的提示词生成一张风景画，尝试不同的宽高比和版本参数，对比效果差异。",
        tool: "Midjourney",
        tip: "开始时用简短的英文描述，逐步添加细节。先确定主体，再叠加风格修饰词。"
      },
      {
        name: "风格探索",
        task: "选择同一个主题（如'城市街道'），分别用赛博朋克、水彩画、浮世绘、照片写实四种风格生成，建立风格词库。",
        tool: "Midjourney",
        tip: "记录每种风格对应的关键词组合，如'watercolor painting, soft edges, paper texture'。"
      },
      {
        name: "人物肖像",
        task: "生成一个虚构角色的肖像，练习描述面部特征、光线、构图和情绪表达。",
        tool: "Midjourney",
        tip: "使用'portrait photography'作为基础，加入具体的镜头参数如'85mm lens, f/1.4'来控制景深效果。"
      },
      {
        name: "迭代优化",
        task: "选择一张满意的初版图像，通过变体(V)、局部重绘(Vary Region)和放大(U)功能进行精修。",
        tool: "Midjourney",
        tip: "Vary Region功能允许你选中图片的某个区域单独重新生成，非常适合修正细节。"
      }
    ],
    resources: [
      { name: "Midjourney官方文档", url: "https://docs.midjourney.com/" },
      { name: "Midjourney Prompt手册", url: "https://www.midlibrary.io/" },
      { name: "AI艺术风格参考库", url: "https://github.com/willwulfken/MidJourney-Styles-and-Keywords-Reference" }
    ]
  },
  {
    id: "lab-12",
    category: "图像生成",
    title: "ComfyUI工作流：精确控制图像生成",
    icon: "🔧",
    difficulty: "进阶",
    duration: "2小时",
    description: "深入学习ComfyUI的节点式工作流，实现对Stable Diffusion图像生成的精确控制。从基础txt2img到ControlNet姿态控制，掌握专业级AI绘图工作流。",
    whatYouLearn: [
      "ComfyUI节点系统和工作流搭建逻辑",
      "ControlNet精确控制人物姿态和构图",
      "LoRA模型加载与风格融合",
      "图生图(img2img)与局部重绘(inpainting)工作流"
    ],
    exercises: [
      {
        name: "搭建基础工作流",
        task: "从零搭建一个txt2img工作流，包含模型加载→正负提示词→采样器→解码→保存的完整链路。",
        tool: "ComfyUI",
        tip: "先用默认工作流理解每个节点的作用，再逐步修改参数观察变化。"
      },
      {
        name: "ControlNet姿态控制",
        task: "使用OpenPose ControlNet，上传一张人物照片提取骨骼，然后基于该姿态生成不同风格的角色。",
        tool: "ComfyUI",
        tip: "ControlNet权重建议从0.7开始调节，太高会过度约束，太低则姿态偏差大。"
      },
      {
        name: "LoRA风格混合",
        task: "加载两个不同风格的LoRA模型，通过调节各自权重实现风格融合效果。",
        tool: "ComfyUI",
        tip: "多LoRA叠加时总权重建议不超过1.5，否则容易出现画面崩坏。"
      },
      {
        name: "批量生成流水线",
        task: "设计一个支持批量提示词输入的工作流，一次性生成同一场景的多个变体用于设计选型。",
        tool: "ComfyUI",
        tip: "使用Primitive节点存储提示词列表，配合Queue Prompt实现批量生成。"
      }
    ],
    resources: [
      { name: "ComfyUI官方仓库", url: "https://github.com/comfyanonymous/ComfyUI" },
      { name: "ComfyUI工作流示例", url: "https://comfyworkflows.com/" },
      { name: "ControlNet模型下载", url: "https://huggingface.co/lllyasviel" }
    ]
  },
  {
    id: "lab-13",
    category: "图像生成",
    title: "AI商业设计：Logo与品牌视觉",
    icon: "💼",
    difficulty: "进阶",
    duration: "2小时",
    description: "利用AI工具快速生成专业级Logo设计和品牌视觉系统。学习如何将AI生成的创意转化为可用的商业设计素材，包括Logo、名片、社交媒体模板等。",
    whatYouLearn: [
      "AI Logo设计的提示词策略和迭代方法",
      "品牌色彩系统和视觉规范的AI辅助生成",
      "矢量化处理：将AI位图转为可编辑矢量图",
      "多场景品牌物料的批量生成技巧"
    ],
    exercises: [
      {
        name: "Logo概念设计",
        task: "为一个虚构的科技创业公司设计Logo，用AI生成20+概念方案，筛选3个最佳方向。",
        tool: "Midjourney",
        tip: "使用'minimal logo, vector, flat design, white background'等关键词约束输出为Logo适用的风格。"
      },
      {
        name: "品牌色彩系统",
        task: "基于选定的Logo方向，让AI生成配套的品牌色板，包含主色、辅色和中性色各2-3种。",
        tool: "ChatGPT",
        tip: "告诉AI品牌的情感定位（如科技感、亲和力），它能基于色彩心理学推荐合适的色值。"
      },
      {
        name: "矢量化与精修",
        task: "将AI生成的Logo位图使用在线工具转为SVG矢量格式，并进行细节调整。",
        tool: "ChatGPT",
        tip: "vectorizer.ai或Inkscape的Trace Bitmap功能可以将位图转矢量，然后手动优化锚点。"
      },
      {
        name: "品牌物料延展",
        task: "使用确定的Logo和色彩系统，生成名片、社交媒体头图、App启动页三个场景的设计稿。",
        tool: "Midjourney",
        tip: "使用--sref参数引用你的Logo风格，保持生成物料的视觉一致性。"
      }
    ],
    resources: [
      { name: "Logo设计提示词集合", url: "https://www.midlibrary.io/categories/logos" },
      { name: "AI Logo矢量化工具", url: "https://vectorizer.ai/" },
      { name: "品牌设计指南", url: "https://brand.guide/" }
    ]
  },
  {
    id: "lab-14",
    category: "图像生成",
    title: "AI照片编辑：修复、扩展与风格迁移",
    icon: "📸",
    difficulty: "入门",
    duration: "1小时",
    description: "探索AI在照片后期处理中的强大能力，包括老照片修复、图片扩展(outpainting)、背景替换和艺术风格迁移。无需专业PS技能即可获得专业级效果。",
    whatYouLearn: [
      "AI图片扩展(outpainting)的原理和最佳实践",
      "智能背景移除与替换技术",
      "老照片AI修复与上色",
      "照片风格迁移：将照片转为绘画风格"
    ],
    exercises: [
      {
        name: "图片智能扩展",
        task: "选择一张构图较紧的照片，使用AI将其向四周扩展，补全缺失的画面内容。",
        tool: "ChatGPT",
        tip: "DALL-E 3的编辑功能支持outpainting，上传图片后选择扩展方向即可。也可使用Photoshop的生成式填充。"
      },
      {
        name: "背景魔法替换",
        task: "拍摄一张普通的人像照片，用AI移除背景后替换为不同场景（海滩、雪山、城市天际线）。",
        tool: "ChatGPT",
        tip: "remove.bg可以精确抠图，然后用AI生成目标背景，最后合成时注意光线方向一致性。"
      },
      {
        name: "老照片修复",
        task: "找一张有折痕、褪色的老照片，使用AI进行修复去痕、清晰度增强和智能上色。",
        tool: "ComfyUI",
        tip: "CodeFormer模型在人脸修复方面效果极好，配合Real-ESRGAN做超分辨率放大。"
      },
      {
        name: "艺术风格迁移",
        task: "将一张日常照片分别转换为梵高、宫崎骏和赛博朋克三种艺术风格，对比效果。",
        tool: "ComfyUI",
        tip: "img2img工作流配合对应风格的LoRA模型，denoising strength在0.4-0.6之间可保持原图结构。"
      }
    ],
    resources: [
      { name: "Remove.bg 背景移除", url: "https://www.remove.bg/" },
      { name: "CodeFormer 人脸修复", url: "https://github.com/sczhou/CodeFormer" },
      { name: "Real-ESRGAN 超分辨率", url: "https://github.com/xinntao/Real-ESRGAN" }
    ]
  },

  // === AI写作 ===
  {
    id: "lab-15",
    category: "AI写作",
    title: "AI长文写作：万字技术博客",
    icon: "📝",
    difficulty: "进阶",
    duration: "2小时",
    description: "学习使用AI辅助完成一篇高质量的万字技术长文。从选题立意、大纲构建到分段撰写、审校润色，掌握AI写作的全流程方法论。",
    whatYouLearn: [
      "长文写作的分段策略：如何拆解避免AI输出质量下降",
      "大纲驱动写作法：先骨架后血肉",
      "技术内容的准确性校验方法",
      "AI写作的后期人工润色技巧"
    ],
    exercises: [
      {
        name: "选题与大纲",
        task: "选择一个你熟悉的技术话题，让AI帮你分析受众需求，生成一个包含8-10个章节的详细大纲。",
        tool: "ChatGPT",
        tip: "提供你的目标读者画像（如'3年经验的前端开发者'），AI能更好地把控深度和广度。"
      },
      {
        name: "分段深度撰写",
        task: "按大纲逐章节撰写，每次给AI上下文（前文摘要+当前章节要求），确保内容连贯且深入。",
        tool: "ChatGPT",
        tip: "每个章节独立对话可以避免上下文窗口溢出，但要在开头提供全文摘要保持连贯性。"
      },
      {
        name: "代码示例生成",
        task: "为文章中的技术概念生成可运行的代码示例，并添加详细注释和运行说明。",
        tool: "Cursor",
        tip: "在Cursor中直接运行AI生成的代码验证正确性，确保读者可以复现。"
      },
      {
        name: "全文审校与优化",
        task: "将完整文章交给AI进行逻辑一致性检查、技术准确性验证和文字润色。",
        tool: "ChatGPT",
        tip: "分三轮审校：第一轮查逻辑和事实错误，第二轮优化表达和过渡，第三轮检查格式和排版。"
      }
    ],
    resources: [
      { name: "技术写作指南", url: "https://developers.google.com/tech-writing" },
      { name: "Hemingway Editor", url: "https://hemingwayapp.com/" },
      { name: "技术博客SEO优化", url: "https://ahrefs.com/blog/technical-seo/" }
    ]
  },
  {
    id: "lab-16",
    category: "AI写作",
    title: "AI学术助手：论文润色与翻译",
    icon: "🎓",
    difficulty: "入门",
    duration: "1小时",
    description: "利用AI提升学术论文的写作质量，包括英文润色、中英互译、摘要生成和参考文献格式化。让AI成为你的学术写作副驾驶。",
    whatYouLearn: [
      "学术英语润色的Prompt模板和策略",
      "保持学术严谨性的AI翻译方法",
      "AI辅助文献综述和摘要撰写",
      "常见学术写作问题的AI诊断"
    ],
    exercises: [
      {
        name: "学术润色",
        task: "将一段中式英语的论文段落交给AI润色，要求保持学术语气，并解释每处修改的理由。",
        tool: "ChatGPT",
        tip: "使用Prompt：'作为Nature/Science期刊的审稿人，润色以下段落，保持原意不变，标注修改理由。'"
      },
      {
        name: "专业术语翻译",
        task: "翻译一篇论文的Introduction部分，确保专业术语统一，行文符合目标语言的学术惯例。",
        tool: "ChatGPT",
        tip: "先让AI列出该领域核心术语的标准翻译对照表，再开始正文翻译，保证全文术语一致。"
      },
      {
        name: "摘要精炼",
        task: "将一篇5000字的论文压缩为200字以内的结构化摘要（背景-方法-结果-结论）。",
        tool: "ChatGPT",
        tip: "先让AI提取论文的四要素，再分别压缩为1-2句话，最后连贯成文。"
      },
      {
        name: "审稿意见回复",
        task: "针对一组模拟的审稿意见，用AI起草逐条回复，包含修改说明和对应的论文修订内容。",
        tool: "ChatGPT",
        tip: "回复审稿意见的黄金结构：感谢→认同合理部分→解释/反驳→说明具体修改。"
      }
    ],
    resources: [
      { name: "Grammarly学术写作", url: "https://www.grammarly.com/blog/academic-writing/" },
      { name: "学术短语词库", url: "https://www.ref-n-write.com/trial/academic-phrasebank/" },
      { name: "Consensus AI论文搜索", url: "https://consensus.app/" }
    ]
  },
  {
    id: "lab-17",
    category: "AI写作",
    title: "AI营销文案：社交媒体内容矩阵",
    icon: "📱",
    difficulty: "入门",
    duration: "1小时",
    description: "用AI批量生产社交媒体营销内容，覆盖小红书、抖音、微信公众号等多个平台。学习如何让AI适配不同平台的调性和格式要求。",
    whatYouLearn: [
      "不同社交平台的内容调性与格式差异",
      "AI批量生产内容的工作流设计",
      "爆款标题和Hook的AI生成技巧",
      "A/B测试文案的快速迭代方法"
    ],
    exercises: [
      {
        name: "多平台内容改写",
        task: "将一篇产品介绍分别改写为小红书种草文、抖音短视频脚本、微信公众号推文和微博话题帖。",
        tool: "ChatGPT",
        tip: "为每个平台提供具体的格式要求和爆款案例，AI会更好地模仿该平台的调性。"
      },
      {
        name: "标题AB测试",
        task: "为同一篇内容生成20个不同角度的标题，分析哪些使用了好奇心缺口、数字、情感触发等技巧。",
        tool: "ChatGPT",
        tip: "让AI按不同的标题公式（How-to型、数字型、疑问型、对比型）各生成5个变体。"
      },
      {
        name: "内容日历规划",
        task: "为一个品牌规划两周的社交媒体发布日历，包含主题、平台、最佳发布时间和配图建议。",
        tool: "ChatGPT",
        tip: "提供品牌定位、目标受众和过往高互动内容特征，AI能生成更贴合实际的日历。"
      },
      {
        name: "互动话术设计",
        task: "设计一套评论区互动话术模板，包含回复好评、处理差评、引导转化三类场景各5条。",
        tool: "ChatGPT",
        tip: "好的互动话术要有人味，避免过于官方。让AI模仿品牌的人设语气来写。"
      }
    ],
    resources: [
      { name: "小红书运营指南", url: "https://business.xiaohongshu.com/" },
      { name: "Copy.ai 文案灵感", url: "https://www.copy.ai/" },
      { name: "社交媒体营销课程", url: "https://blog.hootsuite.com/social-media-marketing-strategy/" }
    ]
  },
  {
    id: "lab-18",
    category: "AI写作",
    title: "AI创意写作：小说与剧本协作",
    icon: "✍️",
    difficulty: "进阶",
    duration: "2小时",
    description: "探索AI在创意写作中的协作模式，从世界观构建到角色塑造，从情节推进到对白打磨。学习如何让AI成为你的创意伙伴而非替代者。",
    whatYouLearn: [
      "AI辅助世界观和角色设定构建",
      "交互式情节发展：人类主导+AI扩展",
      "对白写作的AI辅助技巧",
      "风格一致性的维护方法"
    ],
    exercises: [
      {
        name: "世界观构建",
        task: "创建一个原创科幻世界的设定文档，包含历史背景、社会制度、科技水平和核心矛盾。",
        tool: "ChatGPT",
        tip: "先给AI一个核心设定（如'基因决定社会阶层的未来'），让它扩展出完整的世界观细节。"
      },
      {
        name: "角色卡设计",
        task: "设计3-5个主要角色的详细档案，包含背景故事、性格特点、说话习惯和角色弧线。",
        tool: "ChatGPT",
        tip: "好的角色需要内在矛盾。让AI为每个角色设计一个核心冲突（如'渴望自由却恐惧未知'）。"
      },
      {
        name: "情节接龙创作",
        task: "你写开头300字，AI续写300字，你再续写并调整方向，如此交替完成一个5000字的短篇。",
        tool: "ChatGPT",
        tip: "每次续写前给AI明确的方向指引（如'下一段需要制造一个反转'），保持你对故事的掌控力。"
      },
      {
        name: "剧本对白打磨",
        task: "将一段叙述性文本改写为纯对白形式的剧本场景，让AI模拟不同角色的说话风格。",
        tool: "ChatGPT",
        tip: "提供每个角色的语言特征（如'教授说话引经据典,少年说话简短直接'），对白会更有区分度。"
      }
    ],
    resources: [
      { name: "NovelAI写作工具", url: "https://novelai.net/" },
      { name: "故事结构理论", url: "https://www.masterclass.com/articles/writing-101-what-is-the-heros-journey" },
      { name: "剧本写作格式指南", url: "https://www.writersstore.com/how-to-write-a-screenplay/" }
    ]
  },

  // === 数据分析 ===
  {
    id: "lab-19",
    category: "数据分析",
    title: "AI数据清洗：脏数据变黄金",
    icon: "🧹",
    difficulty: "入门",
    duration: "1小时",
    description: "学习用AI处理真实世界中的脏数据问题，包括缺失值处理、格式统一、重复数据删除和异常值检测。将杂乱无章的原始数据转化为可分析的高质量数据集。",
    whatYouLearn: [
      "常见数据质量问题的AI自动识别",
      "缺失值的多种智能填充策略",
      "数据格式标准化的自动化方法",
      "异常值检测与处理决策"
    ],
    exercises: [
      {
        name: "数据质量诊断",
        task: "上传一份包含各种问题的CSV文件，让AI自动识别数据质量问题并生成诊断报告。",
        tool: "ChatGPT",
        tip: "让AI先做一个全面的数据profiling（列出每列的类型、缺失率、唯一值数量、分布特征）。"
      },
      {
        name: "智能缺失值填充",
        task: "针对不同类型的字段（数值、分类、时间序列），使用AI生成对应的缺失值处理Python代码。",
        tool: "ChatGPT",
        tip: "数值字段可用中位数/均值，分类字段用众数，时间序列用插值法。告诉AI业务背景能得到更合理的策略。"
      },
      {
        name: "格式标准化",
        task: "处理一批格式混乱的数据（如日期有10+种写法，电话号码格式不一），让AI生成统一化脚本。",
        tool: "Cursor",
        tip: "先让AI列出所有发现的格式变体，确认标准格式后再生成转换代码，避免遗漏边缘情况。"
      },
      {
        name: "异常值决策",
        task: "检测数据中的异常值，让AI分析每个异常是数据错误还是真实的极端情况，并给出处理建议。",
        tool: "ChatGPT",
        tip: "异常值不一定要删除。让AI结合业务场景判断：是删除、修正、标记还是单独分析。"
      }
    ],
    resources: [
      { name: "Pandas数据清洗文档", url: "https://pandas.pydata.org/docs/user_guide/missing_data.html" },
      { name: "OpenRefine数据清洗工具", url: "https://openrefine.org/" },
      { name: "数据质量管理指南", url: "https://www.kaggle.com/learn/data-cleaning" }
    ]
  },
  {
    id: "lab-20",
    category: "数据分析",
    title: "AI可视化：一句话生成图表",
    icon: "📊",
    difficulty: "入门",
    duration: "30分钟",
    description: "体验用自然语言描述需求直接生成数据可视化图表的魔力。从简单的柱状图到复杂的交互式仪表板，AI让数据可视化变得人人可用。",
    whatYouLearn: [
      "自然语言转图表的最佳提示词策略",
      "选择合适图表类型的数据可视化原则",
      "AI生成交互式图表的方法",
      "图表美化与配色的AI辅助技巧"
    ],
    exercises: [
      {
        name: "一句话图表",
        task: "准备一份销售数据，用一句自然语言描述你想看到的可视化，让AI直接生成完整的图表代码。",
        tool: "ChatGPT",
        tip: "描述要包含三要素：用什么数据、看什么维度、用什么图表类型。如'按月份展示各产品线的销售趋势折线图'。"
      },
      {
        name: "多图组合Dashboard",
        task: "用4-6个不同维度的图表组成一个数据仪表板，让AI生成完整的HTML页面。",
        tool: "ChatGPT",
        tip: "指定使用ECharts或Plotly库，告诉AI你要的布局（如'2行3列，上面大图下面小图'）。"
      },
      {
        name: "图表故事化",
        task: "让AI不只生成图表，还要添加数据标注、趋势箭头和文字解读，让图表自己讲故事。",
        tool: "ChatGPT",
        tip: "让AI在图表上标注关键数据点（如最大值、转折点），并在图下方生成1-2句话的洞察。"
      }
    ],
    resources: [
      { name: "ECharts图表库", url: "https://echarts.apache.org/examples/" },
      { name: "数据可视化目录", url: "https://datavizcatalogue.com/" },
      { name: "Plotly Python文档", url: "https://plotly.com/python/" }
    ]
  },
  {
    id: "lab-21",
    category: "数据分析",
    title: "AI商业分析：用自然语言查询数据库",
    icon: "💰",
    difficulty: "进阶",
    duration: "1.5小时",
    description: "学习让AI将业务问题翻译为SQL查询，实现'问问题就出数据'的分析体验。涵盖Text-to-SQL的最佳实践、复杂查询的分步构建和结果解读。",
    whatYouLearn: [
      "Text-to-SQL的最佳Prompt设计方法",
      "如何向AI描述数据库Schema和业务规则",
      "复杂分析需求的SQL分步构建策略",
      "查询结果的AI自动解读和建议"
    ],
    exercises: [
      {
        name: "Schema描述与简单查询",
        task: "提供一个电商数据库的表结构(3-5张表)，用自然语言问一个简单的业务问题，让AI生成SQL。",
        tool: "ChatGPT",
        tip: "提供Schema时包含表名、字段名、字段含义、主外键关系。信息越完整，SQL越准确。"
      },
      {
        name: "复杂分析查询",
        task: "提出一个需要多表JOIN和聚合的分析问题（如'每个城市的VIP用户月均消费趋势'），让AI逐步构建SQL。",
        tool: "ChatGPT",
        tip: "让AI先解释查询思路（分几步、用什么表、怎么关联），然后再给出完整SQL，这样更容易验证正确性。"
      },
      {
        name: "业务指标定义",
        task: "定义5个核心业务指标（如留存率、LTV、转化率），让AI生成标准的计算SQL并解释口径。",
        tool: "ChatGPT",
        tip: "业务指标的口径定义（如'新用户指注册7天内'）是AI准确生成SQL的关键前提。"
      },
      {
        name: "数据洞察报告",
        task: "将查询结果数据交给AI，让它自动发现异常、总结趋势并给出业务建议。",
        tool: "ChatGPT",
        tip: "提供业务背景和时间范围，AI能更好地判断数据变化是正常波动还是需要关注的异常。"
      }
    ],
    resources: [
      { name: "DBeaver数据库工具", url: "https://dbeaver.io/" },
      { name: "SQL教程", url: "https://www.w3schools.com/sql/" },
      { name: "Text-to-SQL论文", url: "https://arxiv.org/abs/2204.00498" }
    ]
  },
  {
    id: "lab-22",
    category: "数据分析",
    title: "AI预测建模：无代码机器学习",
    icon: "🔮",
    difficulty: "进阶",
    duration: "2小时",
    description: "无需机器学习背景，用AI指导你完成从数据准备到模型部署的完整预测建模流程。AI会帮你选择算法、调优参数、评估效果并解释预测结果。",
    whatYouLearn: [
      "机器学习问题框架：分类vs回归vs聚类",
      "特征工程的AI辅助方法",
      "模型选择和超参数调优的对话式方法",
      "模型评估指标的理解和模型解释"
    ],
    exercises: [
      {
        name: "问题定义与数据探索",
        task: "选择一个预测问题（如'预测客户是否会流失'），上传数据让AI分析特征分布和目标变量特点。",
        tool: "ChatGPT",
        tip: "先让AI判断这是分类还是回归问题，并检查数据的class imbalance情况。"
      },
      {
        name: "AI特征工程",
        task: "让AI基于业务逻辑建议新特征（如从注册时间提取'账号年龄'），并生成特征工程代码。",
        tool: "ChatGPT",
        tip: "告诉AI你的业务场景和领域知识，它能提出人工难以想到的特征组合。"
      },
      {
        name: "模型训练与对比",
        task: "让AI生成代码训练3-5个不同的模型（逻辑回归、随机森林、XGBoost等），对比各模型表现。",
        tool: "Cursor",
        tip: "使用scikit-learn的Pipeline可以一次性完成数据预处理和模型训练，AI生成的代码会很规范。"
      },
      {
        name: "模型解释与报告",
        task: "让AI使用SHAP值解释模型预测结果，并生成一份面向业务方的模型效果报告。",
        tool: "ChatGPT",
        tip: "业务方不需要看AUC和F1-score，让AI把模型效果翻译成业务语言（如'能提前识别80%的流失客户'）。"
      }
    ],
    resources: [
      { name: "Scikit-learn文档", url: "https://scikit-learn.org/stable/user_guide.html" },
      { name: "Kaggle机器学习课程", url: "https://www.kaggle.com/learn/intro-to-machine-learning" },
      { name: "SHAP模型解释库", url: "https://shap.readthedocs.io/" }
    ]
  },

  // === AI音频 ===
  {
    id: "lab-23",
    category: "AI音频",
    title: "AI播客制作：从脚本到成品",
    icon: "🎙️",
    difficulty: "入门",
    duration: "1.5小时",
    description: "使用AI完成播客制作的全流程：从话题研究、脚本撰写到TTS语音合成和后期编辑。零设备投入即可产出专业质感的播客节目。",
    whatYouLearn: [
      "播客脚本的结构设计和AI撰写方法",
      "AI语音合成(TTS)工具的选择和调优",
      "多角色对话的语音生成技巧",
      "播客后期：背景音乐、转场和音量标准化"
    ],
    exercises: [
      {
        name: "话题研究与脚本",
        task: "选择一个话题，让AI生成一集15分钟的播客脚本，包含开场白、3个讨论点、互动环节和结尾。",
        tool: "ChatGPT",
        tip: "好的播客脚本需要口语化，让AI模拟'两个朋友在咖啡馆聊天'的语气来写。"
      },
      {
        name: "AI语音合成",
        task: "使用TTS工具将脚本转为语音，尝试不同的声音角色、语速和情感参数，选择最自然的效果。",
        tool: "ChatGPT",
        tip: "ElevenLabs的语音克隆效果很自然，11Labs免费额度足够制作Demo。也可尝试Azure TTS的中文效果。"
      },
      {
        name: "多角色对话",
        task: "制作一段双人对谈格式的播客片段，使用两个不同的AI声音模拟主持人和嘉宾。",
        tool: "ChatGPT",
        tip: "先生成分角色脚本（标注A/B），再分别用不同声色合成，最后合并音轨。"
      },
      {
        name: "后期制作",
        task: "为播客添加intro/outro音乐、转场音效，进行音量标准化处理，输出最终的MP3文件。",
        tool: "ChatGPT",
        tip: "用免费的Audacity做后期即可。AI可以帮你生成Audacity的宏脚本来自动化重复操作。"
      }
    ],
    resources: [
      { name: "ElevenLabs语音合成", url: "https://elevenlabs.io/" },
      { name: "Audacity免费音频编辑", url: "https://www.audacityteam.org/" },
      { name: "NotebookLM播客生成", url: "https://notebooklm.google.com/" }
    ]
  },
  {
    id: "lab-24",
    category: "AI音频",
    title: "AI音乐创作：用Suno生成原创音乐",
    icon: "🎵",
    difficulty: "入门",
    duration: "1小时",
    description: "探索AI音乐创作工具Suno的使用方法，从简单的哼唱到完整的歌曲制作。学习如何用文字描述控制音乐风格、情感和结构。",
    whatYouLearn: [
      "Suno的基础使用和参数控制",
      "音乐风格标签和情感描述技巧",
      "歌词与旋律的协调创作方法",
      "AI音乐的后期处理和使用场景"
    ],
    exercises: [
      {
        name: "纯音乐生成",
        task: "使用风格描述（如'轻松的爵士钢琴，咖啡馆氛围'）生成一段60秒的纯音乐背景曲。",
        tool: "Suno",
        tip: "在Style描述中越具体越好，包含乐器、节奏、情感和使用场景。避免模糊的'好听的音乐'。"
      },
      {
        name: "AI歌曲创作",
        task: "让ChatGPT写一段歌词，然后在Suno中设定风格并生成完整的带人声歌曲。",
        tool: "Suno",
        tip: "歌词中用[Verse][Chorus][Bridge]标记结构，Suno会自动理解歌曲段落。"
      },
      {
        name: "风格实验",
        task: "用同一段歌词分别生成流行、摇滚、电子和民谣四种风格版本，对比AI对风格的诠释差异。",
        tool: "Suno",
        tip: "不同风格对歌词的'演绎'很不同，注意观察AI如何处理同一句歌词在不同风格中的节奏感。"
      },
      {
        name: "实用音乐制作",
        task: "为一个产品宣传视频制作30秒的背景音乐，要求有从低到高的能量变化以配合画面节奏。",
        tool: "Suno",
        tip: "在描述中指定'builds up gradually, starts soft ends powerful'来控制能量曲线。"
      }
    ],
    resources: [
      { name: "Suno AI音乐", url: "https://suno.com/" },
      { name: "Udio AI音乐", url: "https://www.udio.com/" },
      { name: "AI音乐版权指南", url: "https://suno.com/legal" }
    ]
  },

  // === AI视频 ===
  {
    id: "lab-25",
    category: "AI视频",
    title: "AI数字人：制作虚拟演讲视频",
    icon: "🧑‍💻",
    difficulty: "进阶",
    duration: "1.5小时",
    description: "使用AI数字人技术制作虚拟演讲视频，无需真人出镜和专业设备。从脚本撰写到数字人视频生成，掌握低成本视频内容生产方法。",
    whatYouLearn: [
      "AI数字人视频的制作全流程",
      "演讲脚本的AI撰写和时间控制",
      "数字人形象选择和动作自然度优化",
      "视频后期合成：背景、字幕和转场"
    ],
    exercises: [
      {
        name: "演讲脚本准备",
        task: "用AI撰写一个3分钟的产品介绍演讲稿，注意口语化表达和适当的停顿标记。",
        tool: "ChatGPT",
        tip: "演讲稿每分钟约150-180字（中文），3分钟控制在450-540字。加入[停顿]标记方便后续生成。"
      },
      {
        name: "数字人视频生成",
        task: "选择一个AI数字人平台，上传脚本生成带有口型同步和手势动作的演讲视频。",
        tool: "ChatGPT",
        tip: "HeyGen和D-ID都提供免费试用。选择数字人时注意形象与内容的匹配度。"
      },
      {
        name: "PPT联动",
        task: "制作配套的PPT幻灯片，将数字人视频与PPT切换结合，模拟真实的演讲场景。",
        tool: "ChatGPT",
        tip: "让AI根据脚本自动生成PPT大纲和每页的展示时间点，方便后期剪辑对齐。"
      },
      {
        name: "多语言版本",
        task: "将中文演讲视频转换为英文版本，包括翻译脚本、英文TTS和口型重新同步。",
        tool: "ChatGPT",
        tip: "HeyGen的视频翻译功能可以一键完成多语言转换，包含口型重对齐。"
      }
    ],
    resources: [
      { name: "HeyGen AI视频", url: "https://www.heygen.com/" },
      { name: "D-ID 数字人", url: "https://www.d-id.com/" },
      { name: "Synthesia 教程", url: "https://www.synthesia.io/" }
    ]
  },
  {
    id: "lab-26",
    category: "AI视频",
    title: "AI视频编辑：自动剪辑与字幕",
    icon: "🎬",
    difficulty: "入门",
    duration: "1小时",
    description: "体验AI如何革新视频后期制作流程，包括智能剪辑（自动去除沉默和口误）、AI字幕生成、内容摘要和亮点提取。",
    whatYouLearn: [
      "AI自动剪辑：去沉默、去口误、节奏优化",
      "AI字幕生成与多语言翻译",
      "视频内容AI摘要和章节分割",
      "AI驱动的视频增强（稳定、降噪、超分）"
    ],
    exercises: [
      {
        name: "智能粗剪",
        task: "上传一段未经剪辑的录屏/录播视频，使用AI工具自动去除沉默段、口误和无效片段。",
        tool: "ChatGPT",
        tip: "Descript的'Remove filler words'功能可以自动删除'嗯''啊'等语气词，效果非常好。"
      },
      {
        name: "AI字幕生成",
        task: "为视频自动生成中文字幕，进行准确率校对，然后翻译为英文字幕并导出SRT文件。",
        tool: "ChatGPT",
        tip: "Whisper模型的中文识别准确率很高。生成后让ChatGPT帮你校对专业术语的识别错误。"
      },
      {
        name: "亮点提取",
        task: "从一个1小时的会议录像中，让AI自动识别并剪辑出3-5个关键讨论点的精华片段。",
        tool: "ChatGPT",
        tip: "先用Whisper转录全文，再让ChatGPT标注精华时间段，最后用FFmpeg自动裁切。"
      },
      {
        name: "短视频二创",
        task: "从一个长视频中提取素材，让AI生成适合短视频平台（竖屏、15-60秒）的二次创作版本。",
        tool: "ChatGPT",
        tip: "告诉AI目标平台和受众，它能帮你选择最有hook力的片段并建议竖屏裁切构图。"
      }
    ],
    resources: [
      { name: "Descript视频编辑", url: "https://www.descript.com/" },
      { name: "Whisper语音识别", url: "https://github.com/openai/whisper" },
      { name: "CapCut剪映", url: "https://www.capcut.com/" }
    ]
  },

  // === 工作流自动化 ===
  {
    id: "lab-27",
    category: "工作流自动化",
    title: "AI自动化：连接100+应用",
    icon: "⚡",
    difficulty: "入门",
    duration: "1.5小时",
    description: "学习使用AI增强的自动化平台（如n8n、Make、Zapier）构建跨应用工作流。从简单的通知转发到复杂的数据同步流水线，让重复性工作自动运行。",
    whatYouLearn: [
      "自动化工作流的设计思维和触发器逻辑",
      "主流自动化平台(n8n/Make/Zapier)的选择和使用",
      "AI节点的集成：在工作流中调用LLM",
      "错误处理和工作流监控最佳实践"
    ],
    exercises: [
      {
        name: "第一个自动化",
        task: "创建一个工作流：当收到特定邮件时，自动提取关键信息并发送到Slack/飞书通知。",
        tool: "ChatGPT",
        tip: "先在n8n或Make中画出工作流草图（触发器→处理→输出），再逐步配置每个节点。"
      },
      {
        name: "AI增强工作流",
        task: "在工作流中加入AI节点：将用户反馈自动分类（正面/负面/功能需求），并路由到不同处理流程。",
        tool: "ChatGPT",
        tip: "在自动化平台的AI节点中使用简洁的分类Prompt，只需返回类别标签即可，不要让AI输出解释。"
      },
      {
        name: "数据同步流水线",
        task: "构建一个定时工作流：每天从数据库中提取新数据，经AI处理后同步到Google Sheets和通知相关人员。",
        tool: "ChatGPT",
        tip: "使用Cron触发器设置定时执行，注意处理增量数据（只同步新增/变更的记录）。"
      },
      {
        name: "异常监控告警",
        task: "设计一个监控工作流：定时检查API健康状态，异常时用AI分析可能原因并发送分级告警。",
        tool: "ChatGPT",
        tip: "告警要分级：P0立即电话，P1即时消息，P2邮件汇总。让AI根据错误模式判断严重程度。"
      }
    ],
    resources: [
      { name: "n8n自动化平台", url: "https://n8n.io/" },
      { name: "Make(Integromat)", url: "https://www.make.com/" },
      { name: "Zapier AI Actions", url: "https://zapier.com/ai" }
    ]
  },
  {
    id: "lab-28",
    category: "工作流自动化",
    title: "AI邮件助手：智能分类与自动回复",
    icon: "📧",
    difficulty: "入门",
    duration: "1小时",
    description: "构建一个AI驱动的邮件管理系统，实现邮件自动分类、优先级排序、摘要生成和模板化自动回复。每天节省30分钟的邮件处理时间。",
    whatYouLearn: [
      "邮件自动分类的AI策略设计",
      "基于规则+AI的混合优先级判断",
      "自动回复模板的设计和个性化",
      "邮件摘要和待办事项自动提取"
    ],
    exercises: [
      {
        name: "智能分类器",
        task: "设计一个邮件分类系统，将收件箱自动分为：紧急行动、需要回复、仅供知悉、可忽略四类。",
        tool: "ChatGPT",
        tip: "分类规则应结合发件人重要度、关键词和上下文语义。先用ChatGPT设计分类逻辑，再实现自动化。"
      },
      {
        name: "邮件摘要生成",
        task: "为每封邮件自动生成一句话摘要和关键行动项，方便快速扫读决定是否需要详细阅读。",
        tool: "ChatGPT",
        tip: "摘要Prompt模板：'用一句话总结这封邮件的核心信息，如果需要我采取行动请标注[ACTION]。'"
      },
      {
        name: "模板自动回复",
        task: "为常见邮件场景（会议确认、信息请求、进度询问）设计AI回复模板，保持专业且个性化。",
        tool: "ChatGPT",
        tip: "好的模板要有变量占位符（如{对方姓名}、{具体事项}），AI填充时才能做到个性化。"
      },
      {
        name: "周报自动汇总",
        task: "让AI自动从本周所有邮件中提取工作成果、进行中的项目和待解决的问题，生成周报草稿。",
        tool: "ChatGPT",
        tip: "按照'完成事项→进行中→下周计划→需要协助'的结构让AI整理，会让周报更清晰。"
      }
    ],
    resources: [
      { name: "Gmail API文档", url: "https://developers.google.com/gmail/api" },
      { name: "n8n邮件自动化模板", url: "https://n8n.io/workflows/?categories=email" },
      { name: "邮件效率方法论", url: "https://www.fastcompany.com/90954530/inbox-zero" }
    ]
  },

  // === AI Agent ===
  {
    id: "lab-29",
    category: "AI Agent",
    title: "构建你的第一个AI Agent",
    icon: "🤖",
    difficulty: "进阶",
    duration: "2小时",
    description: "从零构建一个具备工具调用能力的AI Agent，能够自主规划任务、搜索信息、执行代码和记忆对话上下文。理解Agent的核心架构：感知→规划→行动→反思。",
    whatYouLearn: [
      "AI Agent的核心架构：ReAct循环",
      "工具定义与函数调用(Function Calling)实现",
      "Agent记忆系统：短期和长期记忆",
      "错误处理和Agent行为边界控制"
    ],
    exercises: [
      {
        name: "最简Agent框架",
        task: "使用OpenAI API实现一个基础Agent循环：接收问题→思考→选择工具→执行→返回结果。",
        tool: "Cursor",
        tip: "从两个简单工具开始（如calculator和web_search），先跑通循环再扩展能力。"
      },
      {
        name: "工具生态扩展",
        task: "为Agent添加5种工具能力：网络搜索、代码执行、文件读写、数据库查询和API调用。",
        tool: "Cursor",
        tip: "使用JSON Schema定义每个工具的参数格式，让Agent能准确理解何时该用哪个工具。"
      },
      {
        name: "记忆系统实现",
        task: "实现Agent的短期记忆（对话上下文）和长期记忆（向量数据库存储的知识），让Agent能'记住'之前的交互。",
        tool: "Cursor",
        tip: "短期记忆用滑动窗口管理token，长期记忆用ChromaDB或Pinecone存储向量embedding。"
      },
      {
        name: "安全与边界",
        task: "为Agent添加安全防护：操作确认机制、输出过滤、Token预算控制和死循环检测。",
        tool: "Cursor",
        tip: "关键操作（如删除文件、发送邮件）必须经过人类确认。设置最大循环次数防止Agent无限重试。"
      }
    ],
    resources: [
      { name: "OpenAI Function Calling文档", url: "https://platform.openai.com/docs/guides/function-calling" },
      { name: "LangChain Agent教程", url: "https://python.langchain.com/docs/modules/agents/" },
      { name: "ReAct论文", url: "https://arxiv.org/abs/2210.03629" }
    ]
  },
  {
    id: "lab-30",
    category: "AI Agent",
    title: "多Agent协作：让AI团队为你工作",
    icon: "👥",
    difficulty: "进阶",
    duration: "2小时",
    description: "构建一个多Agent协作系统，让不同角色的AI Agent分工合作完成复杂任务。学习Agent间的通信协议、任务分解和结果汇总策略。",
    whatYouLearn: [
      "多Agent系统的架构模式（主从、平等协商、层级）",
      "任务分解与Agent角色分配策略",
      "Agent间通信和中间结果传递",
      "冲突解决和最终输出整合"
    ],
    exercises: [
      {
        name: "双Agent辩论",
        task: "构建一个辩论系统：Agent A持正方观点，Agent B持反方观点，通过多轮交锋最终由裁判Agent综合得出结论。",
        tool: "Cursor",
        tip: "每个Agent需要有明确的system prompt定义其立场和论辩风格，裁判Agent负责评估论点质量。"
      },
      {
        name: "开发团队模拟",
        task: "创建一个AI开发团队：产品经理Agent负责需求分析，架构师Agent设计方案，程序员Agent编写代码，测试Agent验证质量。",
        tool: "Cursor",
        tip: "使用CrewAI或AutoGen框架可以快速搭建多Agent系统，定义好Agent间的输入输出接口。"
      },
      {
        name: "研究报告协作",
        task: "让搜索Agent收集信息、分析Agent处理数据、写作Agent撰写报告、审核Agent校对质量，协作完成一份行业研究报告。",
        tool: "Cursor",
        tip: "设计清晰的Pipeline：每个Agent的输出是下一个Agent的输入，使用结构化格式传递中间结果。"
      },
      {
        name: "自适应任务分配",
        task: "实现一个Orchestrator Agent，能够根据任务复杂度动态决定分配给哪些Worker Agent，并在Worker失败时重新分配。",
        tool: "Cursor",
        tip: "Orchestrator需要维护任务状态机：pending→assigned→in_progress→completed/failed→retry。"
      }
    ],
    resources: [
      { name: "CrewAI多Agent框架", url: "https://github.com/crewAIInc/crewAI" },
      { name: "AutoGen微软多Agent", url: "https://github.com/microsoft/autogen" },
      { name: "多Agent系统论文综述", url: "https://arxiv.org/abs/2308.08155" }
    ]
  }
];
