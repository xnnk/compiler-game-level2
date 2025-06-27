# Compiler Game Level2

一个基于增量游戏机制的编译器学习游戏，Level2版本专注于神经网络训练和机器学习概念的教学。

## 项目概述

### 游戏背景
继承Level1的编译器构建基础，Level2将玩家带入神经网络和机器学习的世界。玩家将通过训练神经网络、优化模型架构、处理数据集等方式来深入理解现代AI技术。

### 技术栈
- **构建工具**: Vite 6.3.5
- **开发语言**: JavaScript (ES2020+)
- **ML框架**: TensorFlow.js
- **数据可视化**: D3.js, Chart.js
- **数据存储**: IndexedDB (通过Dexie.js)
- **数学计算**: Decimal.js
- **工具库**: Lodash-es, date-fns

### 核心特性
- 🧠 神经网络可视化训练
- 📊 实时数据分析和图表
- 💾 本地数据持久化
- 🔄 模块化架构设计
- 🎮 渐进式学习体验
- 📱 响应式界面设计

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装与运行
```bash
# 克隆项目
git clone <repository-url>
cd compiler-game-level2

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 开发脚本
```bash
npm run dev        # 启动开发服务器 (http://localhost:3000)
npm run build      # 构建生产版本
npm run preview    # 预览构建结果 (http://localhost:4173)
npm run lint       # 代码质量检查
npm run format     # 代码格式化
npm run clean      # 清理构建文件
```

## 项目结构

```
compiler-game-level2/
├── public/                   # 静态资源
├── src/                      # 源代码
│   ├── config/              # 配置文件
│   ├── core/                # 核心系统
│   ├── level1/              # Level1 功能模块
│   ├── level2/              # Level2 功能模块  
│   ├── ui/                  # UI 组件
│   ├── storage/             # 数据存储
│   ├── workers/             # Web Workers
│   ├── utils/               # 工具函数
│   ├── styles/              # 样式文件
│   ├── main.js              # 应用入口
│   └── app.js               # 主应用类
├── tests/                   # 测试文件
├── docs/                    # 项目文档
├── scripts/                 # 构建脚本
└── dist/                    # 构建输出
```

## 开发指南

详细开发规范请参考：
- [开发规范](./development-guide.md)
- [架构设计](./architecture.md)
- [API文档](./api.md)
- [贡献指南](./contributing.md)

## 版本历史

### v0.1.0 (当前版本)
- ✅ 项目初始化和环境搭建
- ✅ 基础架构设计
- ✅ 开发工具链配置
- 🚧 Level1模块重构 (进行中)
- 🚧 Level2神经网络模块 (规划中)

## 许可证

[MIT License](./LICENSE)

## 贡献

欢迎贡献代码！请阅读 [贡献指南](./docs/contributing.md) 了解详细信息。

## 支持

如有问题或建议，请提交 Issue 或联系开发团队。
