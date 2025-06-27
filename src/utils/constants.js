// src/utils/constants.js
// 引入 Decimal 类用于大数运算

/*
    是什么: 定义了所有可购买升级的核心数据。这是一个配置对象，是游戏的"蓝图"。
    为什么: 将游戏平衡性相关的数值（如基础成本、成长率、产出）集中存放，便于调整和管理，而无需在代码逻辑中硬编码。
    如何关联:
        - 这段代码是《实现Level1.md》中"升级项目设计"表格的直接代码化实现。
        - `baseCost`和`growth`直接对应了《研究Level1.md》1.3节中的指数成本公式 `Cost_next = Cost_base * (Rate_growth)^Owned`。
        - `type`（manual, generator, converter）定义了升级的性质，体现了游戏从手动到自动（generator），再到资源转化（converter）的核心进程，这与《研究Level1.md》中描述的游戏阶段演进（词法分析 -> 语法分析）相符。
        - `unlockThreshold`实现了《研究Level1.md》中提到的"展开式机制"，避免一次性给玩家太多信息。
*/
export const UPGRADE_DATA = {
    'token-speed': { 
        name: '词法分析器 I', 
        description: '提升手动分词效率 (按Token数量)。', 
        baseCost: new Decimal(25), 
        growth: 1.25, 
        baseOutput: new Decimal(0.1), 
        type: 'manual' 
    },
    'auto-tokenizer-1': { 
        name: '自动化分词器', 
        description: '自动产生 Tokens。', 
        baseCost: new Decimal(50), 
        growth: 1.15, 
        baseOutput: new Decimal(1), 
        type: 'generator', 
        resource: 'tokens' 
    },
    'auto-scanner-2': { 
        name: '高速扫描器', 
        description: '更快速的自动化分词器。', 
        baseCost: new Decimal(500), 
        growth: 1.18, 
        baseOutput: new Decimal(5), 
        type: 'generator', 
        resource: 'tokens', 
        unlockThreshold: new Decimal(250) 
    },
    'parallel-lexer-3': { 
        name: '并行词法分析器', 
        description: '利用多核心并行处理，大幅提升效率。', 
        baseCost: new Decimal(8000), 
        growth: 1.22, 
        baseOutput: new Decimal(25), 
        type: 'generator', 
        resource: 'tokens', 
        unlockThreshold: new Decimal(4000) 
    },
    'auto-parser-1': { 
        name: '自动化解析器', 
        description: '消耗 Tokens 自动构建 AST 节点。', 
        baseCost: new Decimal(1000), 
        growth: 1.20, 
        baseOutput: new Decimal(0.5), 
        type: 'converter', 
        resource: 'astNodes', 
        costResource: 'tokens', 
        unlockThreshold: new Decimal(500) 
    },
};

export const PRESTIGE_UPGRADES = {
    'quantumTokenizer': { 
        name: "量子分词器", 
        baseCost: new Decimal(10), 
        cost: new Decimal(10), 
        level: 0, 
        effect: "tokens生产 × 5", 
        requiresPrestige: 1, 
        unlocked: false 
    },
    'parallelCompiler': { 
        name: "并行编译器", 
        baseCost: new Decimal(100), 
        cost: new Decimal(100), 
        level: 0, 
        effect: "同时处理多个编译任务", 
        requiresPrestige: 3, 
        unlocked: false 
    },
    'aiOptimizer': { 
        name: "AI优化器", 
        baseCost: new Decimal(1000), 
        cost: new Decimal(1000), 
        level: 0, 
        effect: "自动选择最优编译策略", 
        requiresPrestige: 5, 
        unlocked: false 
    }
};

// 第三阶段：代码生成与优化 - 升级数据
export const STAGE3_UPGRADES = {
    'basicCodeGen': { 
        name: "基础代码生成器", 
        baseCost: new Decimal(100), 
        growth: 1.2, 
        baseOutput: new Decimal(0.1), 
        type: 'converter', 
        resource: 'generatedCode',
        costResource: 'astNodes',
        description: "将AST节点转换为基础代码",
        unlockThreshold: new Decimal(1000)
    },
    'llvmCodeGen': { 
        name: "LLVM代码生成器", 
        baseCost: new Decimal(1000), 
        growth: 1.25, 
        baseOutput: new Decimal(0.15), 
        type: 'converter', 
        resource: 'generatedCode',
        costResource: 'astNodes',
        description: "高效的LLVM后端代码生成",
        unlockThreshold: new Decimal(5000)
    },
    'jitCompiler': { 
        name: "JIT编译器", 
        baseCost: new Decimal(10000), 
        growth: 1.3, 
        baseOutput: new Decimal(0.2), 
        type: 'converter', 
        resource: 'generatedCode',
        costResource: 'astNodes',
        description: "实时编译，效率×2",
        unlockThreshold: new Decimal(50000)
    }
};

// 代码优化技术数据
export const OPTIMIZATION_TECHS = {
    'deadCodeElimination': {
        name: "死代码消除",
        maxLevel: 10,
        baseCost: new Decimal(50),
        growth: 1.6,
        efficiency: 0.1,
        description: "移除永远不会执行的代码"
    },
    'loopOptimization': {
        name: "循环优化", 
        maxLevel: 8,
        baseCost: new Decimal(200),
        growth: 1.8,
        efficiency: 0.15,
        description: "循环展开和向量化优化"
    },
    'functionInlining': {
        name: "函数内联",
        maxLevel: 5, 
        baseCost: new Decimal(500),
        growth: 2.0,
        efficiency: 0.2,
        description: "消除函数调用开销"
    },
    'registerAllocation': {
        name: "寄存器分配",
        maxLevel: 12,
        baseCost: new Decimal(100),
        growth: 1.5,
        efficiency: 0.05,
        description: "优化CPU寄存器使用"
    }
};

// 部署平台数据
export const DEPLOYMENT_PLATFORMS = {
    'development': { 
        name: "开发环境", 
        multiplier: 1.0, 
        unlocked: true 
    },
    'serverCluster': { 
        name: "服务器集群", 
        multiplier: 2.5, 
        unlockThreshold: new Decimal(10000) 
    },
    'edgeComputing': { 
        name: "边缘计算", 
        multiplier: 5.0, 
        unlockThreshold: new Decimal(100000) 
    },
    'quantumProcessor': { 
        name: "量子处理器", 
        multiplier: 10.0, 
        unlockThreshold: new Decimal(1000000), 
        requiresPrestige: 3 
    }
};
