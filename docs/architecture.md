# 架构设计文档

## 系统架构概览

Compiler Game Level2 采用模块化、分层的架构设计，支持渐进式功能扩展和高性能的机器学习计算。

## 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    用户界面层 (UI Layer)                      │
├─────────────────────────────────────────────────────────────┤
│  Tab Manager  │  Stats Panel  │  Visualization  │  Modals   │
├─────────────────────────────────────────────────────────────┤
│                   业务逻辑层 (Business Layer)                │
├─────────────────────────────────────────────────────────────┤
│   Level1 Logic   │   Level2 Logic   │   Upgrade System      │
├─────────────────────────────────────────────────────────────┤
│                    核心层 (Core Layer)                       │
├─────────────────────────────────────────────────────────────┤
│ Event System │ Game State │ Resource Manager │ Performance │
├─────────────────────────────────────────────────────────────┤
│                   基础设施层 (Infrastructure)                │
├─────────────────────────────────────────────────────────────┤
│  Storage API  │  Worker Pool  │  ML Engine  │  Utils       │
└─────────────────────────────────────────────────────────────┘
```

## 模块化设计

### 1. 核心模块 (@core)

#### 事件系统 (Event System)
```javascript
/**
 * 基于 EventTarget 的事件系统
 * 支持模块间解耦通信
 */
class EventSystem extends EventTarget {
  // 发布事件
  emit(eventName, data) {
    this.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
  
  // 订阅事件
  on(eventName, handler) {
    this.addEventListener(eventName, handler);
  }
  
  // 取消订阅
  off(eventName, handler) {
    this.removeEventListener(eventName, handler);
  }
}
```

**设计理念**:
- 松耦合: 模块间通过事件通信，减少直接依赖
- 可扩展: 新模块可以轻松接入事件系统
- 可测试: 事件可以被模拟和验证

#### 游戏状态管理 (Game State)
```javascript
/**
 * 中央状态管理器
 * 使用观察者模式通知状态变化
 */
class GameState {
  constructor() {
    this._state = new Map();
    this._observers = new Map();
    this._history = [];
  }
  
  // 状态更新
  setState(key, value) {
    const oldValue = this._state.get(key);
    this._state.set(key, value);
    
    // 记录历史
    this._history.push({ key, oldValue, newValue: value, timestamp: Date.now() });
    
    // 通知观察者
    this._notifyObservers(key, value, oldValue);
  }
  
  // 状态订阅
  subscribe(key, callback) {
    if (!this._observers.has(key)) {
      this._observers.set(key, new Set());
    }
    this._observers.get(key).add(callback);
  }
}
```

**特性**:
- 时间旅行: 支持状态历史记录和回滚
- 持久化: 自动保存到 IndexedDB
- 验证: 状态变更前进行数据验证
- 性能优化: 批量更新和延迟通知

#### 资源管理器 (Resource Manager)
```javascript
/**
 * 游戏资源统一管理
 * 支持资源计算、验证、持久化
 */
class ResourceManager {
  constructor() {
    this.resources = new Map();
    this.calculators = new Map();
    this.validators = new Map();
  }
  
  // 注册资源类型
  registerResource(type, config) {
    this.resources.set(type, {
      value: new Decimal(config.initialValue || 0),
      max: config.max ? new Decimal(config.max) : null,
      calculator: config.calculator,
      validator: config.validator
    });
  }
  
  // 资源计算
  calculateResourceGain(type, deltaTime) {
    const resource = this.resources.get(type);
    if (resource.calculator) {
      return resource.calculator(deltaTime, this.getAllResources());
    }
    return new Decimal(0);
  }
}
```

### 2. Level1 模块 (@level1)

继承并重构现有的编译器游戏逻辑：

#### 词法分析器 (Lexer)
```javascript
class LexerSystem {
  constructor() {
    this.tokenTypes = new Map();
    this.patterns = [];
    this.currentTokens = [];
  }
  
  // 注册新的 token 类型
  registerTokenType(name, pattern, value) {
    this.tokenTypes.set(name, { pattern, value });
  }
  
  // 分析输入文本
  tokenize(input) {
    // 词法分析逻辑
    return this.currentTokens;
  }
  
  // 获取分析统计
  getStats() {
    return {
      totalTokens: this.currentTokens.length,
      uniqueTypes: this.tokenTypes.size,
      analysisTime: this.lastAnalysisTime
    };
  }
}
```

#### 升级系统 (Upgrade System)
```javascript
class UpgradeSystem {
  constructor() {
    this.upgrades = new Map();
    this.purchased = new Set();
    this.unlocked = new Set();
  }
  
  // 计算升级成本
  calculateCost(upgradeId, currentLevel = 0) {
    const upgrade = this.upgrades.get(upgradeId);
    return upgrade.baseCost.mul(
      Decimal.pow(upgrade.costMultiplier, currentLevel)
    );
  }
  
  // 购买升级
  purchase(upgradeId) {
    if (!this.canPurchase(upgradeId)) {
      throw new Error(`Cannot purchase upgrade: ${upgradeId}`);
    }
    
    // 扣除资源、应用效果
    this.applyUpgradeEffect(upgradeId);
    this.purchased.add(upgradeId);
  }
}
```

### 3. Level2 模块 (@level2)

新增的神经网络和机器学习功能：

#### 神经网络构建器 (Neural Network Builder)
```javascript
class NeuralNetworkBuilder {
  constructor() {
    this.architectures = new Map();
    this.models = new Map();
    this.trainingHistory = [];
  }
  
  // 构建网络架构
  buildArchitecture(config) {
    const model = tf.sequential();
    
    config.layers.forEach((layerConfig, index) => {
      const layer = this.createLayer(layerConfig, index === 0);
      model.add(layer);
    });
    
    return model;
  }
  
  // 创建网络层
  createLayer(config, isFirst = false) {
    const layerType = config.type || 'dense';
    const params = {
      units: config.units,
      activation: config.activation || 'relu',
      ...config.params
    };
    
    if (isFirst && config.inputShape) {
      params.inputShape = config.inputShape;
    }
    
    return tf.layers[layerType](params);
  }
}
```

#### 训练管理器 (Training Manager)
```javascript
class TrainingManager {
  constructor() {
    this.activeTraining = null;
    this.metrics = new Map();
    this.callbacks = [];
  }
  
  // 开始训练
  async startTraining(model, dataset, config) {
    this.activeTraining = {
      model,
      dataset,
      config,
      startTime: Date.now(),
      currentEpoch: 0,
      metrics: []
    };
    
    // 配置训练参数
    model.compile({
      optimizer: config.optimizer || 'adam',
      loss: config.loss || 'meanSquaredError',
      metrics: config.metrics || ['accuracy']
    });
    
    // 开始训练循环
    return await this.trainLoop();
  }
  
  // 训练循环
  async trainLoop() {
    const { model, dataset, config } = this.activeTraining;
    
    for (let epoch = 0; epoch < config.epochs; epoch++) {
      const history = await model.fit(dataset.xs, dataset.ys, {
        epochs: 1,
        batchSize: config.batchSize || 32,
        validationSplit: config.validationSplit || 0.2,
        callbacks: this.createCallbacks(epoch)
      });
      
      // 更新训练状态
      this.updateTrainingProgress(epoch, history);
      
      // 检查早停条件
      if (this.shouldEarlyStop()) {
        break;
      }
    }
    
    return this.finalizeTraining();
  }
}
```

### 4. UI 组件系统 (@ui)

#### 基础组件 (Base Component)
```javascript
class BaseComponent {
  constructor(selector, options = {}) {
    this.element = document.querySelector(selector);
    this.options = options;
    this.state = new Map();
    this.eventListeners = new Map();
    
    this.init();
  }
  
  // 初始化组件
  init() {
    this.createElements();
    this.bindEvents();
    this.render();
  }
  
  // 状态管理
  setState(key, value) {
    this.state.set(key, value);
    this.render();
  }
  
  // 事件绑定
  bindEvents() {
    // 子类实现
  }
  
  // 渲染方法
  render() {
    // 子类实现
  }
  
  // 销毁组件
  destroy() {
    this.eventListeners.forEach((listener, element) => {
      element.removeEventListener(listener.event, listener.handler);
    });
    this.element.remove();
  }
}
```

#### 数据可视化组件
```javascript
class NetworkVisualizationComponent extends BaseComponent {
  constructor(selector, networkData) {
    super(selector);
    this.networkData = networkData;
    this.svg = null;
    this.simulation = null;
  }
  
  render() {
    this.createSVG();
    this.drawNodes();
    this.drawConnections();
    this.startSimulation();
  }
  
  createSVG() {
    this.svg = d3.select(this.element)
      .append('svg')
      .attr('width', this.options.width || 800)
      .attr('height', this.options.height || 600);
  }
  
  drawNodes() {
    const nodes = this.svg.selectAll('.node')
      .data(this.networkData.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => d.size || 5)
      .style('fill', d => this.getNodeColor(d));
  }
}
```

### 5. 存储系统 (@storage)

#### 存储管理器 (Storage Manager)
```javascript
class StorageManager {
  constructor() {
    this.db = null;
    this.adapters = new Map();
    this.migrationVersions = [];
  }
  
  // 初始化数据库
  async initialize() {
    this.db = new Dexie('CompilerGameDB');
    
    // 定义数据库结构
    this.db.version(1).stores({
      gameState: 'id, data, timestamp',
      models: 'id, architecture, weights, metadata',
      trainingHistory: 'id, modelId, epoch, metrics, timestamp',
      userData: 'id, preferences, settings'
    });
    
    await this.db.open();
    await this.runMigrations();
  }
  
  // 保存游戏状态
  async saveGameState(state) {
    const serializedState = this.serializeState(state);
    await this.db.gameState.put({
      id: 'current',
      data: serializedState,
      timestamp: Date.now()
    });
  }
  
  // 加载游戏状态
  async loadGameState() {
    const record = await this.db.gameState.get('current');
    if (record) {
      return this.deserializeState(record.data);
    }
    return null;
  }
  
  // 保存模型
  async saveModel(id, model, metadata) {
    const weights = await model.getWeights();
    const serializedWeights = await this.serializeWeights(weights);
    
    await this.db.models.put({
      id,
      architecture: model.toJSON(),
      weights: serializedWeights,
      metadata
    });
  }
}
```

### 6. Worker 系统 (@workers)

#### ML Worker
```javascript
// ml-worker.js
importScripts('/node_modules/@tensorflow/tfjs/dist/tf.min.js');

class MLWorker {
  constructor() {
    this.models = new Map();
    this.tasks = new Map();
  }
  
  async handleMessage(event) {
    const { type, taskId, data } = event.data;
    
    try {
      let result;
      
      switch (type) {
        case 'TRAIN_MODEL':
          result = await this.trainModel(data);
          break;
        case 'PREDICT':
          result = await this.predict(data);
          break;
        case 'OPTIMIZE_ARCHITECTURE':
          result = await this.optimizeArchitecture(data);
          break;
      }
      
      self.postMessage({
        taskId,
        success: true,
        result
      });
      
    } catch (error) {
      self.postMessage({
        taskId,
        success: false,
        error: error.message
      });
    }
  }
  
  async trainModel({ architecture, dataset, config }) {
    // 在 Worker 中执行训练
    const model = await tf.loadLayersModel(architecture);
    
    model.compile({
      optimizer: config.optimizer,
      loss: config.loss,
      metrics: config.metrics
    });
    
    const history = await model.fit(dataset.xs, dataset.ys, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          // 发送训练进度
          self.postMessage({
            type: 'TRAINING_PROGRESS',
            epoch,
            logs
          });
        }
      }
    });
    
    return {
      model: await model.save('indexeddb://trained-model'),
      history: history.history
    };
  }
}

const worker = new MLWorker();
self.addEventListener('message', worker.handleMessage.bind(worker));
```

## 性能优化策略

### 1. 内存管理
- **TensorFlow.js 张量管理**: 及时释放不需要的张量
- **事件监听器清理**: 组件销毁时清理事件监听器
- **定时器管理**: 页面不可见时暂停计算

### 2. 计算优化
- **Web Workers**: 将ML计算移至后台线程
- **批量更新**: 合并多个状态更新
- **惰性计算**: 只在需要时计算复杂数值

### 3. 渲染优化
- **虚拟滚动**: 大列表使用虚拟滚动
- **Canvas 优化**: 复杂可视化使用 Canvas
- **动画优化**: 使用 requestAnimationFrame

### 4. 存储优化
- **增量保存**: 只保存变更的数据
- **压缩**: 使用压缩算法减少存储空间
- **索引**: 为频繁查询的数据建立索引

## 可扩展性设计

### 1. 插件系统
```javascript
class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }
  
  // 注册插件
  registerPlugin(name, plugin) {
    this.plugins.set(name, plugin);
    plugin.initialize(this);
  }
  
  // 执行钩子
  async executeHook(hookName, ...args) {
    const handlers = this.hooks.get(hookName) || [];
    const results = await Promise.all(
      handlers.map(handler => handler(...args))
    );
    return results;
  }
}
```

### 2. 模块热替换
- 开发环境支持模块热替换
- 状态保持和恢复
- 错误边界处理

### 3. 国际化支持
```javascript
class I18nManager {
  constructor() {
    this.locale = 'zh-CN';
    this.translations = new Map();
  }
  
  t(key, params = {}) {
    const translation = this.translations.get(this.locale)?.get(key) || key;
    return this.interpolate(translation, params);
  }
}
```

## 安全考虑

### 1. 数据验证
- 输入验证和清理
- 状态完整性检查
- 类型安全检查

### 2. 错误处理
- 全局错误捕获
- 优雅降级
- 错误日志记录

### 3. 性能监控
- 内存使用监控
- 性能指标收集
- 异常检测和报告

这个架构设计确保了系统的可维护性、可扩展性和高性能，为 Level2 的复杂 ML 功能提供了坚实的基础。
