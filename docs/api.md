# API 文档

## 核心 API

### Event System

#### `EventSystem`
基于 EventTarget 的事件系统，支持模块间松耦合通信。

```javascript
import { EventSystem } from '@core/event-system.js';

const eventSystem = new EventSystem();
```

**方法**

##### `emit(eventName, data)`
发布事件

- `eventName` (string): 事件名称
- `data` (any): 事件数据

```javascript
eventSystem.emit('resourceChanged', {
  type: 'researchPoints',
  oldValue: 100,
  newValue: 150
});
```

##### `on(eventName, handler)`
订阅事件

- `eventName` (string): 事件名称  
- `handler` (function): 事件处理函数

```javascript
eventSystem.on('resourceChanged', (event) => {
  console.log('Resource changed:', event.detail);
});
```

##### `off(eventName, handler)`
取消订阅

- `eventName` (string): 事件名称
- `handler` (function): 事件处理函数

##### `once(eventName, handler)`
订阅一次性事件

```javascript
eventSystem.once('gameInitialized', () => {
  console.log('Game is ready!');
});
```

**事件列表**

| 事件名 | 数据结构 | 描述 |
|--------|----------|------|
| `resourceChanged` | `{type, oldValue, newValue}` | 资源变更 |
| `upgradeUnlocked` | `{upgradeId, requirements}` | 升级解锁 |
| `upgradePurchased` | `{upgradeId, cost, effect}` | 升级购买 |
| `modelTrained` | `{modelId, metrics, duration}` | 模型训练完成 |
| `gameStateLoaded` | `{state, version}` | 游戏状态加载 |
| `gameStateSaved` | `{timestamp, size}` | 游戏状态保存 |

---

### Game State

#### `GameState`
游戏状态管理器，提供状态存储、订阅和持久化功能。

```javascript
import { GameState } from '@core/game-state.js';

const gameState = new GameState();
```

**方法**

##### `get(key)`
获取状态值

- `key` (string): 状态键
- 返回: any

```javascript
const researchPoints = gameState.get('researchPoints');
```

##### `set(key, value)`
设置状态值

- `key` (string): 状态键
- `value` (any): 状态值

```javascript
gameState.set('researchPoints', new Decimal(100));
```

##### `subscribe(key, callback)`
订阅状态变更

- `key` (string): 状态键
- `callback` (function): 回调函数

```javascript
gameState.subscribe('researchPoints', (newValue, oldValue) => {
  updateUI(newValue);
});
```

##### `batch(updates)`
批量更新状态

- `updates` (object): 更新对象

```javascript
gameState.batch({
  researchPoints: new Decimal(200),
  influencePoints: new Decimal(50),
  tokens: new Decimal(10)
});
```

##### `async save()`
保存状态到存储

```javascript
await gameState.save();
```

##### `async load()`
从存储加载状态

```javascript
await gameState.load();
```

##### `getHistory(key, limit = 10)`
获取状态变更历史

- `key` (string): 状态键
- `limit` (number): 历史记录数量限制

---

### Resource Manager

#### `ResourceManager`
资源管理器，处理游戏资源的计算、验证和管理。

```javascript
import { ResourceManager } from '@core/resource-manager.js';

const resourceManager = new ResourceManager();
```

**方法**

##### `registerResource(type, config)`
注册资源类型

- `type` (string): 资源类型
- `config` (object): 资源配置

```javascript
resourceManager.registerResource('researchPoints', {
  initialValue: 0,
  displayName: '研究点数',
  icon: '🔬',
  calculator: (deltaTime, resources) => {
    // 计算资源增长
    return new Decimal(deltaTime * 0.1);
  },
  validator: (value) => {
    return value.gte(0);
  }
});
```

##### `getResource(type)`
获取资源值

- `type` (string): 资源类型
- 返回: Decimal

##### `addResource(type, amount)`
增加资源

- `type` (string): 资源类型
- `amount` (Decimal): 增加数量

##### `spendResource(type, amount)`
消耗资源

- `type` (string): 资源类型
- `amount` (Decimal): 消耗数量
- 返回: boolean (是否成功)

##### `canAfford(costs)`
检查是否能够承担成本

- `costs` (object): 成本对象
- 返回: boolean

```javascript
const canBuy = resourceManager.canAfford({
  researchPoints: new Decimal(100),
  influencePoints: new Decimal(20)
});
```

##### `calculateGrowth(deltaTime)`
计算资源增长

- `deltaTime` (number): 时间差（毫秒）
- 返回: object (资源增长映射)

---

## Level1 API

### Upgrade System

#### `UpgradeSystem`
升级系统，管理游戏升级的购买、效果和解锁。

```javascript
import { UpgradeSystem } from '@level1/upgrades/upgrade-system.js';

const upgradeSystem = new UpgradeSystem();
```

**方法**

##### `registerUpgrade(id, config)`
注册升级项

- `id` (string): 升级ID
- `config` (object): 升级配置

```javascript
upgradeSystem.registerUpgrade('faster_research', {
  name: '加速研究',
  description: '研究速度提升25%',
  category: 'research',
  baseCost: { researchPoints: new Decimal(100) },
  costMultiplier: 1.5,
  maxLevel: 10,
  requirements: {
    research_unlocked: true
  },
  effects: [
    {
      type: 'multiplier',
      target: 'research_speed',
      value: 1.25
    }
  ]
});
```

##### `canPurchase(upgradeId)`
检查是否能购买升级

- `upgradeId` (string): 升级ID
- 返回: boolean

##### `purchase(upgradeId)`
购买升级

- `upgradeId` (string): 升级ID
- 返回: boolean (是否成功)

##### `getUpgradeLevel(upgradeId)`
获取升级等级

- `upgradeId` (string): 升级ID
- 返回: number

##### `calculateCost(upgradeId, level = null)`
计算升级成本

- `upgradeId` (string): 升级ID
- `level` (number, optional): 目标等级
- 返回: object (成本对象)

##### `getAvailableUpgrades()`
获取可用升级列表

- 返回: Array<object>

##### `getUpgradeEffect(upgradeId, effectType)`
获取升级效果值

- `upgradeId` (string): 升级ID
- `effectType` (string): 效果类型
- 返回: number

---

### Lexer System

#### `LexerSystem`
词法分析器系统，处理代码词法分析和token生成。

```javascript
import { LexerSystem } from '@level1/lexer/lexer-system.js';

const lexer = new LexerSystem();
```

**方法**

##### `registerTokenType(name, pattern, value)`
注册token类型

- `name` (string): token名称
- `pattern` (RegExp): 匹配模式
- `value` (number): token价值

```javascript
lexer.registerTokenType('keyword', /\b(if|else|while|for)\b/, 10);
lexer.registerTokenType('identifier', /\b[a-zA-Z_][a-zA-Z0-9_]*\b/, 5);
```

##### `tokenize(input)`
分析输入代码

- `input` (string): 输入代码
- 返回: Array<Token>

```javascript
const tokens = lexer.tokenize(`
  function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
  }
`);
```

##### `getTokenStats()`
获取分析统计

- 返回: object

```javascript
const stats = lexer.getTokenStats();
// {
//   totalTokens: 25,
//   uniqueTypes: 8,
//   analysisTime: 15,
//   tokensPerSecond: 1666
// }
```

##### `generateReward()`
生成分析奖励

- 返回: object (奖励对象)

---

## Level2 API

### Neural Network Builder

#### `NeuralNetworkBuilder`
神经网络构建器，创建和管理TensorFlow.js模型。

```javascript
import { NeuralNetworkBuilder } from '@level2/neural-network/builder.js';

const builder = new NeuralNetworkBuilder();
```

**方法**

##### `createArchitecture(config)`
创建网络架构

- `config` (object): 架构配置
- 返回: tf.LayersModel

```javascript
const model = builder.createArchitecture({
  inputShape: [784],
  layers: [
    { type: 'dense', units: 128, activation: 'relu' },
    { type: 'dropout', rate: 0.2 },
    { type: 'dense', units: 64, activation: 'relu' },
    { type: 'dense', units: 10, activation: 'softmax' }
  ],
  optimizer: 'adam',
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});
```

##### `validateArchitecture(config)`
验证架构配置

- `config` (object): 架构配置
- 返回: object (验证结果)

##### `getArchitectureComplexity(config)`
计算架构复杂度

- `config` (object): 架构配置
- 返回: number

##### `optimizeArchitecture(constraints)`
优化架构设计

- `constraints` (object): 约束条件
- 返回: object (优化后的配置)

```javascript
const optimized = builder.optimizeArchitecture({
  maxParameters: 100000,
  targetAccuracy: 0.95,
  dataset: 'mnist'
});
```

---

### Training Manager

#### `TrainingManager`
训练管理器，处理模型训练过程。

```javascript
import { TrainingManager } from '@level2/training-lab/training-manager.js';

const trainer = new TrainingManager();
```

**方法**

##### `async startTraining(model, dataset, config)`
开始训练

- `model` (tf.LayersModel): 要训练的模型
- `dataset` (object): 训练数据集
- `config` (object): 训练配置
- 返回: Promise<object> (训练结果)

```javascript
const result = await trainer.startTraining(model, dataset, {
  epochs: 50,
  batchSize: 32,
  learningRate: 0.001,
  validationSplit: 0.2,
  earlyStopping: {
    patience: 5,
    monitor: 'val_loss'
  },
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(`Epoch ${epoch}: loss=${logs.loss}`);
    }
  }
});
```

##### `pauseTraining()`
暂停训练

##### `resumeTraining()`
恢复训练

##### `stopTraining()`
停止训练

##### `getTrainingProgress()`
获取训练进度

- 返回: object

```javascript
const progress = trainer.getTrainingProgress();
// {
//   currentEpoch: 25,
//   totalEpochs: 50,
//   progress: 0.5,
//   currentLoss: 0.234,
//   currentAccuracy: 0.876,
//   estimatedTimeRemaining: 120000
// }
```

##### `getTrainingMetrics()`
获取训练指标

- 返回: object

---

### Data Visualization

#### `NetworkVisualizer`
神经网络可视化组件。

```javascript
import { NetworkVisualizer } from '@level2/visualization/network-visualizer.js';

const visualizer = new NetworkVisualizer('#network-container');
```

**方法**

##### `renderNetwork(model, options = {})`
渲染网络结构

- `model` (tf.LayersModel): 要可视化的模型
- `options` (object): 渲染选项

```javascript
visualizer.renderNetwork(model, {
  showWeights: true,
  showActivations: true,
  layout: 'layered',
  nodeSize: 'auto',
  colorScheme: 'activation'
});
```

##### `updateActivations(activations)`
更新激活值显示

- `activations` (Array): 各层激活值

##### `highlightPath(inputIndex, outputIndex)`
高亮显示路径

- `inputIndex` (number): 输入节点索引
- `outputIndex` (number): 输出节点索引

##### `animateTraining(trainingData)`
动画显示训练过程

- `trainingData` (Array): 训练数据

---

## UI API

### Base Component

#### `BaseComponent`
UI组件基类。

```javascript
import { BaseComponent } from '@ui/base/base-component.js';

class CustomComponent extends BaseComponent {
  constructor(selector, options) {
    super(selector, options);
  }
  
  render() {
    // 实现渲染逻辑
  }
}
```

**方法**

##### `setState(key, value)`
设置组件状态

- `key` (string): 状态键
- `value` (any): 状态值

##### `getState(key)`
获取组件状态

- `key` (string): 状态键
- 返回: any

##### `on(event, handler)`
绑定事件监听器

- `event` (string): 事件类型
- `handler` (function): 事件处理函数

##### `emit(event, data)`
触发自定义事件

- `event` (string): 事件类型
- `data` (any): 事件数据

##### `update()`
强制更新组件

##### `destroy()`
销毁组件

---

### Stats Panel

#### `StatsPanel`
统计面板组件。

```javascript
import { StatsPanel } from '@ui/components/stats-panel.js';

const statsPanel = new StatsPanel('#stats-panel');
```

**方法**

##### `addStat(key, config)`
添加统计项

- `key` (string): 统计项键
- `config` (object): 配置

```javascript
statsPanel.addStat('researchPoints', {
  label: '研究点数',
  format: 'number',
  icon: '🔬',
  tooltip: '用于购买升级的货币'
});
```

##### `updateStat(key, value)`
更新统计值

- `key` (string): 统计项键
- `value` (any): 新值

##### `removeStat(key)`
移除统计项

- `key` (string): 统计项键

---

## Storage API

### Storage Manager

#### `StorageManager`
存储管理器。

```javascript
import { StorageManager } from '@storage/storage-manager.js';

const storage = new StorageManager();
await storage.initialize();
```

**方法**

##### `async save(key, data)`
保存数据

- `key` (string): 数据键
- `data` (any): 要保存的数据

##### `async load(key)`
加载数据

- `key` (string): 数据键
- 返回: any

##### `async delete(key)`
删除数据

- `key` (string): 数据键

##### `async clear()`
清空所有数据

##### `async export()`
导出数据

- 返回: string (JSON格式)

##### `async import(data)`
导入数据

- `data` (string): JSON格式数据

---

## Utils API

### Math Utils

#### 数学工具函数

```javascript
import { 
  formatNumber, 
  calculateCompoundGrowth,
  interpolate 
} from '@utils/math.js';
```

##### `formatNumber(value, options = {})`
格式化数字显示

- `value` (Decimal|number): 数值
- `options` (object): 格式化选项
- 返回: string

```javascript
formatNumber(new Decimal('1234567.89'), {
  notation: 'scientific',
  precision: 2
}); // "1.23e6"
```

##### `calculateCompoundGrowth(principal, rate, time)`
计算复合增长

- `principal` (Decimal): 本金
- `rate` (number): 增长率
- `time` (number): 时间
- 返回: Decimal

##### `interpolate(start, end, progress)`
线性插值

- `start` (number): 起始值
- `end` (number): 结束值
- `progress` (number): 进度 (0-1)
- 返回: number

---

### Format Utils

#### 格式化工具函数

```javascript
import { 
  formatTime, 
  formatBytes,
  formatPercentage 
} from '@utils/format.js';
```

##### `formatTime(milliseconds)`
格式化时间

- `milliseconds` (number): 毫秒数
- 返回: string

```javascript
formatTime(90000); // "1m 30s"
```

##### `formatBytes(bytes)`
格式化字节数

- `bytes` (number): 字节数
- 返回: string

##### `formatPercentage(value, decimals = 1)`
格式化百分比

- `value` (number): 数值 (0-1)
- `decimals` (number): 小数位数
- 返回: string

---

## 错误处理

### Error Types

#### 自定义错误类型

```javascript
import { 
  GameError,
  ValidationError,
  TrainingError,
  StorageError 
} from '@core/errors.js';
```

##### `GameError`
游戏逻辑错误

##### `ValidationError`
数据验证错误

##### `TrainingError`
模型训练错误

##### `StorageError`
存储操作错误

---

## 配置 API

### Game Config

#### 游戏配置

```javascript
import { gameConfig } from '@config/game-config.js';

// 访问配置
const saveInterval = gameConfig.saveInterval;
const maxSaveFiles = gameConfig.storage.maxSaveFiles;
```

### ML Config

#### 机器学习配置

```javascript
import { mlConfig } from '@config/ml-config.js';

// 默认架构配置
const defaultArchitecture = mlConfig.defaultArchitectures.classification;

// 训练参数
const trainingDefaults = mlConfig.training.defaults;
```

这个 API 文档提供了完整的接口说明，开发者可以根据这些接口进行功能开发和集成。
