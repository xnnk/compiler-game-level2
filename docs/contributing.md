# 贡献指南

欢迎为编译器模拟游戏项目做出贡献！本文档将指导你如何参与项目开发。

## 🚀 快速开始

### 前置条件
- Node.js 16+ 
- Git
- 现代浏览器（支持ES6模块）

### 开发环境设置

1. **Fork 并克隆仓库**
   ```bash
   git clone https://github.com/YOUR_USERNAME/compiler-game-level2.git
   cd compiler-game-level2
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **验证设置**
   - 访问 http://localhost:3000
   - 确认游戏正常运行
   - 检查浏览器控制台无错误

## 📋 贡献类型

我们欢迎以下类型的贡献：

### 🐛 Bug 修复
- 报告和修复游戏中的错误
- 性能问题优化
- 兼容性问题解决

### ✨ 新功能
- 游戏机制扩展
- UI/UX 改进
- 新的升级系统
- Level2 机器学习模块

### 📚 文档改进
- 代码注释完善
- 用户指南更新
- API 文档编写
- 开发指南改进

### 🧪 测试
- 单元测试编写
- 集成测试添加
- 端到端测试实现

## 🔄 开发工作流

### 1. 创建功能分支
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b bugfix/your-bugfix-name
```

### 2. 遵循代码规范
```bash
# 代码格式化
npm run format

# 代码质量检查
npm run lint

# 修复 ESLint 问题
npm run lint -- --fix
```

### 3. 提交代码
使用有意义的提交信息：
```bash
git commit -m "feat: 添加神经网络训练模块"
git commit -m "fix: 修复威望系统计算错误"
git commit -m "docs: 更新API文档"
```

#### 提交信息格式
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建工具、辅助工具更新

**范围 (scope) 示例:**
- `core`: 核心游戏逻辑
- `ui`: 用户界面
- `level2`: Level2 机器学习功能
- `storage`: 存储系统
- `performance`: 性能优化

### 4. 创建 Pull Request

1. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **创建 PR**
   - 访问 GitHub 仓库
   - 点击 "New Pull Request"
   - 填写详细的 PR 描述

#### PR 模板
```markdown
## 📝 更改描述
简要描述你的更改内容和原因。

## 🧪 测试
- [ ] 本地测试通过
- [ ] 游戏功能正常
- [ ] 无控制台错误
- [ ] 响应式布局正常

## 📷 截图（如适用）
如果是UI更改，请提供截图。

## 🔗 相关问题
关闭 #issue_number
```

## 🎯 代码规范

### JavaScript 规范

#### 1. 命名约定
```javascript
// ✅ 正确
class GameState { }                    // PascalCase for classes
const formatNumber = () => { };        // camelCase for functions
const UPGRADE_DATA = { };              // SNAKE_CASE for constants
const gameInstance = new Game();       // camelCase for variables

// ❌ 错误
class gamestate { }                    // 应该用 PascalCase
const FormatNumber = () => { };        // 应该用 camelCase
const upgrade_data = { };              // 应该用 SNAKE_CASE
```

#### 2. 模块导入/导出
```javascript
// ✅ 正确的导入
import { GameState } from './core/gameState.js';
import { formatNumber } from '../utils/formatters.js';

// ✅ 正确的导出
export class UIUpdater { }
export { formatNumber, formatTime };
export default Game;

// ❌ 避免
import * as everything from './module.js';  // 避免全量导入
```

#### 3. 错误处理
```javascript
// ✅ 正确
try {
    const result = await riskyOperation();
    return result;
} catch (error) {
    console.error('操作失败:', error);
    throw new Error(`详细错误: ${error.message}`);
}

// ✅ 正确的Promise处理
promise
    .then(result => processResult(result))
    .catch(error => handleError(error));
```

#### 4. 注释规范
```javascript
/**
 * 计算升级的当前成本
 * @param {Object} upgrade - 升级对象
 * @param {number} currentLevel - 当前等级
 * @returns {Decimal} 升级成本
 */
function calculateUpgradeCost(upgrade, currentLevel) {
    // 使用指数增长公式: baseCost * (growth ^ level)
    return upgrade.baseCost.mul(Decimal.pow(upgrade.growth, currentLevel));
}
```

### HTML/CSS 规范

#### 1. HTML 结构
```html
<!-- ✅ 语义化标签 -->
<main class="game-container">
    <section class="stats-panel">
        <header class="panel-header">
            <h2>编译器状态</h2>
        </header>
        <div class="stats-grid">
            <!-- 内容 -->
        </div>
    </section>
</main>

<!-- ❌ 避免过度使用div -->
<div class="container">
    <div class="header">
        <div>编译器状态</div>
    </div>
</div>
```

#### 2. CSS 类命名
```css
/* ✅ BEM 命名法 */
.game-panel { }
.game-panel__header { }
.game-panel__content { }
.game-panel--minimized { }

/* ✅ 实用类 */
.hidden { display: none; }
.text-center { text-align: center; }
.mb-4 { margin-bottom: 1rem; }
```

## 🧪 测试指南

### 单元测试
```javascript
// tests/unit/gameState.test.js
import { GameState } from '../../src/core/gameState.js';

describe('GameState', () => {
    let gameState;
    
    beforeEach(() => {
        gameState = new GameState();
    });
    
    test('应该正确初始化资源', () => {
        expect(gameState.resources.tokens.toNumber()).toBe(0);
        expect(gameState.resources.astNodes.toNumber()).toBe(0);
    });
    
    test('应该正确添加tokens', () => {
        gameState.addResource('tokens', 100);
        expect(gameState.resources.tokens.toNumber()).toBe(100);
    });
});
```

### 集成测试
```javascript
// tests/integration/gameFlow.test.js
describe('游戏流程集成测试', () => {
    test('完整的升级购买流程', async () => {
        const game = new Game();
        game.init();
        
        // 添加资源
        game.state.addResource('tokens', 1000);
        
        // 购买升级
        const success = game.buyUpgrade('auto-tokenizer-1');
        expect(success).toBe(true);
        
        // 验证状态变化
        expect(game.state.upgrades['auto-tokenizer-1'].level).toBe(1);
    });
});
```

### 测试命令
```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- --testPathPattern=gameState

# 测试覆盖率
npm run test:coverage
```

## 🚀 Level2 开发指南

### 神经网络模块结构
```javascript
// src/level2/neuralNetwork.js
export class NeuralNetworkBuilder {
    constructor() {
        this.layers = [];
        this.model = null;
    }
    
    addLayer(config) {
        // 添加神经网络层
    }
    
    async train(data) {
        // 训练模型
    }
}
```

### 机器学习工作流
```javascript
// src/level2/mlWorkflow.js
export class MLWorkflow {
    constructor(gameState) {
        this.gameState = gameState;
        this.trainingData = [];
    }
    
    async generateTrainingData() {
        // 基于游戏状态生成训练数据
    }
    
    async optimizeCompiler() {
        // 使用ML优化编译器性能
    }
}
```

## 📝 文档贡献

### 文档类型
- **用户文档**: 游戏玩法说明
- **开发文档**: 技术实现细节
- **API文档**: 函数和类的说明
- **架构文档**: 系统设计说明

### 文档格式
```markdown
# 标题

## 概述
简要说明文档目的。

## 详细内容

### 子标题
具体内容...

```javascript
// 代码示例
const example = "formatted code";
```

## 相关链接
- [相关文档]([link](https://github.com/xnnk/compiler-game-level2/tree/master/docs))
```

## 🐛 Issue 报告

### Bug 报告模板
```markdown
**Bug 描述**
清晰简洁地描述 bug。

**复现步骤**
1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

**期望行为**
描述你期望发生什么。

**实际行为**
描述实际发生了什么。

**截图**
如果适用，添加截图。

**环境信息**
- 操作系统: [如 Windows 10]
- 浏览器: [如 Chrome 91]
- 游戏版本: [如 v0.8.0]

**附加信息**
其他相关的上下文信息。
```

### 功能请求模板
```markdown
**功能描述**
描述你想要的功能。

**解决的问题**
解释这个功能解决了什么问题。

**建议的解决方案**
描述你期望的实现方式。

**替代方案**
描述你考虑过的其他解决方案。

**优先级**
- [ ] 高
- [ ] 中
- [ ] 低
```

## 📞 联系方式

- **GitHub Issues**: 提交 bug 报告和功能请求
- **GitHub Discussions**: 技术讨论和问答
- **Pull Requests**: 代码贡献

## 📜 许可证

通过贡献代码，你同意你的贡献将按照 [MIT License](../LICENSE) 进行许可。

## 🙏 致谢

感谢所有为项目做出贡献的开发者！你们的努力让这个游戏变得更好。

---

**维护者**: [xnnk](https://github.com/xnnk)  
**最后更新**: 2025年6月27日
