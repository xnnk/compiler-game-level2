# 开发指南 - 重构后版本

本文档为重构后的模块化项目提供开发指导。

## 🛠️ 开发环境设置

### 前置要求
- Node.js 16+ 
- npm 或 yarn
- 现代浏览器（支持ES6模块）

### 快速开始
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 构建生产版本
npm run build

# 4. 预览生产版本
npm run preview
```

## 📁 代码组织原则

### 模块分离
- **src/core/**：核心游戏逻辑，不依赖DOM
- **src/modules/**：功能模块，可独立测试
- **src/ui/**：UI相关，依赖DOM元素
- **src/utils/**：纯函数工具，无副作用
- **src/storage/**：数据持久化

### 导入规则
```javascript
// ✅ 正确的导入方式
import { formatNumber } from '../utils/formatters.js';
import { GameState } from './gameState.js';

// ❌ 避免循环依赖
// game.js 不应该导入 ui 模块的具体实现
```

### 命名约定
- **类名**：PascalCase (`GameState`, `UIUpdater`)
- **函数名**：camelCase (`formatNumber`, `updateUI`)
- **常量**：SNAKE_CASE (`UPGRADE_DATA`, `MAX_TOKENS`)
- **文件名**：camelCase (`gameState.js`, `uiUpdater.js`)

#### 1. 变量命名
```javascript
// 使用 camelCase
const playerScore = 0;
const neuralNetwork = new NeuralNetwork();

// 常量使用 UPPER_SNAKE_CASE
const MAX_LAYERS = 10;
const DEFAULT_LEARNING_RATE = 0.001;

// 私有变量使用 _ 前缀
class GameState {
  constructor() {
    this._internalState = {};
    this.publicProperty = 'visible';
  }
  
  _privateMethod() {
    // 私有方法
  }
}
```

#### 2. 函数命名
```javascript
// 动词开头，描述功能
function calculateScore() { }
function updateUserInterface() { }
function validateInput() { }

// 布尔值返回的函数使用 is/has/can 开头
function isGameActive() { }
function hasPermission() { }
function canProceed() { }

// 事件处理函数使用 handle 开头
function handleButtonClick() { }
function handleDataLoad() { }
```

#### 3. 类命名
```javascript
// 使用 PascalCase
class GameState { }
class NeuralNetworkBuilder { }
class DataVisualizationEngine { }

// 接口/类型定义也使用 PascalCase
/**
 * @typedef {Object} PlayerData
 * @property {number} score
 * @property {string} name
 */
```

### 代码组织规范

#### 1. 文件结构模板
```javascript
/**
 * @fileoverview 文件功能描述
 * @author 作者名
 * @created 创建日期
 * @last-modified 最后修改日期
 */

// 1. 外部库导入
import { DecimalJS } from 'decimal.js';
import * as tf from '@tensorflow/tfjs';

// 2. 内部模块导入（按层级排序）
import { EventSystem } from '@core/event-system.js';
import { formatNumber } from '@utils/format.js';
import { gameConfig } from '@config/game-config.js';

// 3. 类型定义 (JSDoc)
/**
 * @typedef {Object} NetworkConfig
 * @property {number} layers - 网络层数
 * @property {number} nodes - 节点数量
 */

// 4. 常量定义
const DEFAULT_BATCH_SIZE = 32;
const ACTIVATION_FUNCTIONS = ['relu', 'sigmoid', 'tanh'];

// 5. 主要实现
class NeuralNetworkBuilder {
  /**
   * 创建神经网络构建器
   * @param {NetworkConfig} config - 网络配置
   */
  constructor(config) {
    this.config = config;
    this._model = null;
  }
  
  // 公共方法
  buildNetwork() {
    // 实现逻辑
  }
  
  // 私有方法
  _validateConfig() {
    // 验证逻辑
  }
}

// 6. 工具函数
function validateNetworkConfig(config) {
  // 验证函数
}

// 7. 导出
export { NeuralNetworkBuilder, validateNetworkConfig };
export default NeuralNetworkBuilder;
```

#### 2. 导入规范
```javascript
// 优先使用具名导入
import { EventSystem, GameState } from '@core';
import { formatNumber, calculateUpgrade } from '@utils';

// 路径别名使用规范
import { } from '@core';      // 核心模块
import { } from '@config';    // 配置文件
import { } from '@level1';    // Level1功能
import { } from '@level2';    // Level2功能
import { } from '@ui';        // UI组件
import { } from '@storage';   // 存储模块
import { } from '@utils';     // 工具函数
import { } from '@workers';   // Web Workers
import { } from '@styles';    // 样式文件

// 避免深层相对路径
❌ import { } from '../../../core/event-system.js';
✅ import { } from '@core/event-system.js';
```

### 注释规范

#### 1. JSDoc 注释
```javascript
/**
 * 神经网络训练管理器
 * 负责管理训练过程、监控性能指标、保存模型
 * 
 * @class TrainingManager
 * @example
 * const trainer = new TrainingManager({
 *   learningRate: 0.001,
 *   epochs: 100
 * });
 * await trainer.train(model, dataset);
 */
class TrainingManager {
  /**
   * 创建训练管理器实例
   * @param {Object} options - 训练选项
   * @param {number} options.learningRate - 学习率
   * @param {number} options.epochs - 训练轮数
   * @param {Function} [options.onProgress] - 进度回调函数
   */
  constructor(options) {
    this.options = options;
  }
  
  /**
   * 训练神经网络模型
   * @param {tf.LayersModel} model - TensorFlow.js 模型
   * @param {Array<Object>} dataset - 训练数据集
   * @returns {Promise<Object>} 训练结果统计
   * @throws {Error} 当模型或数据无效时抛出错误
   */
  async train(model, dataset) {
    // 实现逻辑
  }
  
  /**
   * 获取训练进度
   * @readonly
   * @returns {number} 训练进度百分比 (0-100)
   */
  get progress() {
    return this._progress;
  }
}
```

#### 2. 行内注释
```javascript
// TODO: 实现自适应学习率调整
const learningRate = 0.001;

// FIXME: 这里可能存在内存泄漏
const heavyObject = createLargeDataStructure();

// NOTE: 这个算法的时间复杂度是 O(n²)
function bubbleSort(array) {
  // 实现冒泡排序
}

// 解释复杂业务逻辑
if (player.level >= 10 && player.hasCompletedTutorial) {
  // 只有达到10级且完成教程的玩家才能访问高级功能
  unlockAdvancedFeatures();
}
```

### 错误处理规范

#### 1. 错误类型定义
```javascript
/**
 * 游戏相关错误基类
 */
class GameError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'GameError';
    this.code = code;
  }
}

/**
 * 神经网络训练错误
 */
class TrainingError extends GameError {
  constructor(message, modelState) {
    super(message, 'TRAINING_ERROR');
    this.name = 'TrainingError';
    this.modelState = modelState;
  }
}
```

#### 2. 错误处理模式
```javascript
// 使用 try-catch 处理异步错误
async function trainModel(config) {
  try {
    const model = await buildModel(config);
    const result = await train(model);
    return result;
  } catch (error) {
    console.error('训练失败:', error);
    
    // 记录错误日志
    logError('MODEL_TRAINING', error, { config });
    
    // 向用户显示友好错误信息
    showUserNotification('训练过程中出现问题，请稍后重试');
    
    // 重新抛出或返回默认值
    throw new TrainingError('模型训练失败', { config });
  }
}

// 参数验证
function validateTrainingConfig(config) {
  if (!config) {
    throw new Error('训练配置不能为空');
  }
  
  if (config.learningRate <= 0) {
    throw new Error('学习率必须大于0');
  }
  
  if (!Array.isArray(config.layers)) {
    throw new Error('网络层配置必须是数组');
  }
}
```

### 性能优化规范

#### 1. 异步操作
```javascript
// 使用 async/await 而不是 Promise.then
❌ 不推荐
function loadGameData() {
  return fetchUserData()
    .then(userData => fetchGameState(userData.id))
    .then(gameState => processGameState(gameState))
    .catch(error => handleError(error));
}

✅ 推荐
async function loadGameData() {
  try {
    const userData = await fetchUserData();
    const gameState = await fetchGameState(userData.id);
    return await processGameState(gameState);
  } catch (error) {
    handleError(error);
  }
}
```

#### 2. 内存管理
```javascript
// 及时清理事件监听器
class GameComponent {
  constructor() {
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }
  
  destroy() {
    // 清理事件监听器
    window.removeEventListener('resize', this.handleResize);
    
    // 清理定时器
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // 清理 TensorFlow.js 张量
    if (this.model) {
      this.model.dispose();
    }
  }
}
```

#### 3. Web Workers 使用
```javascript
// 计算密集型任务使用 Web Workers
class MLWorkerManager {
  constructor() {
    this.worker = new Worker('/src/workers/ml-worker.js');
    this.setupWorkerHandlers();
  }
  
  async trainModelInWorker(config) {
    return new Promise((resolve, reject) => {
      const taskId = Date.now();
      
      this.worker.postMessage({
        type: 'TRAIN_MODEL',
        taskId,
        config
      });
      
      const handleMessage = (event) => {
        if (event.data.taskId === taskId) {
          this.worker.removeEventListener('message', handleMessage);
          
          if (event.data.success) {
            resolve(event.data.result);
          } else {
            reject(new Error(event.data.error));
          }
        }
      };
      
      this.worker.addEventListener('message', handleMessage);
    });
  }
}
```

## 测试规范

### 单元测试
```javascript
// 使用 describe 和 it 组织测试
describe('NeuralNetworkBuilder', () => {
  let builder;
  
  beforeEach(() => {
    builder = new NeuralNetworkBuilder({
      layers: [64, 32, 10],
      activation: 'relu'
    });
  });
  
  afterEach(() => {
    // 清理资源
    if (builder.model) {
      builder.model.dispose();
    }
  });
  
  it('应该正确创建网络架构', () => {
    const model = builder.buildNetwork();
    expect(model.layers).toHaveLength(3);
    expect(model.layers[0].units).toBe(64);
  });
  
  it('应该验证无效配置', () => {
    expect(() => {
      new NeuralNetworkBuilder({ layers: [] });
    }).toThrow('网络层不能为空');
  });
});
```

### 集成测试
```javascript
describe('游戏状态管理', () => {
  it('应该正确保存和加载游戏状态', async () => {
    const gameState = new GameState();
    gameState.setResearchPoints(1000);
    
    await gameState.save();
    
    const newGameState = new GameState();
    await newGameState.load();
    
    expect(newGameState.getResearchPoints()).toBe(1000);
  });
});
```

## Git 工作流规范

### 分支命名
```bash
feature/neural-network-visualization   # 新功能
bugfix/training-memory-leak           # 错误修复
hotfix/critical-save-issue            # 紧急修复
refactor/level1-architecture          # 重构
docs/development-guide                # 文档更新
```

### 提交信息规范
```bash
# 格式: <type>(<scope>): <description>

feat(neural-network): 添加网络可视化组件
fix(storage): 修复IndexedDB事务错误
docs(readme): 更新安装说明
refactor(core): 重构事件系统架构
test(utils): 添加格式化函数测试
perf(training): 优化训练循环性能
style(lint): 修复ESLint警告
```

### Pull Request 规范
1. **标题**: 简洁描述变更内容
2. **描述**: 详细说明变更原因和实现方式
3. **测试**: 说明如何测试变更
4. **截图**: 如果涉及UI变更，提供截图
5. **检查清单**: 
   - [ ] 代码符合规范
   - [ ] 添加了必要的测试
   - [ ] 更新了相关文档
   - [ ] 通过了所有检查

## 代码审查规范

### 审查要点
1. **功能正确性**: 代码是否实现了预期功能
2. **性能考虑**: 是否存在性能问题
3. **安全性**: 是否存在安全漏洞
4. **可维护性**: 代码是否易于理解和维护
5. **测试覆盖**: 是否有充分的测试

### 审查清单
- [ ] 代码逻辑清晰正确
- [ ] 命名规范一致
- [ ] 错误处理完善
- [ ] 性能影响可接受
- [ ] 安全考虑充分
- [ ] 测试覆盖充分
- [ ] 文档更新及时

## 工具配置

### ESLint 规则
```javascript
// eslint.config.js
export default [
  {
    rules: {
      // 代码质量
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // 代码风格
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      
      // ES6+
      'arrow-spacing': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error'
    }
  }
];
```

### Prettier 配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

遵循这些规范将确保代码质量、团队协作效率和项目的长期可维护性。
