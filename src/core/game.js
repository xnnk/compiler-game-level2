// src/core/game.js
// 游戏主控制器 - 协调所有模块

import { GameState } from './gameState.js';
import { UIUpdater } from '../ui/uiUpdater.js';
import { Tokenizer } from '../modules/tokenizer.js';
import { StorageManager } from '../storage/storageManager.js';
import { ASTVisualizer } from '../ui/astVisualizer.js';
import { PerformanceChart } from '../ui/performanceChart.js';
import { initializeTabs, switchToTab, toggleTabVisibility } from '../ui/tabManager.js';
import { initializeDevTools, exposeDevToolsGlobally } from '../ui/devTools.js';
import { UPGRADE_DATA } from '../utils/constants.js';

/**
 * 游戏主控制器类
 */
export class Game {
    constructor() {
        // 状态和逻辑模块
        this.state = new GameState();
        this.tokenizer = new Tokenizer();
        this.storage = new StorageManager(this.state);

        // UI模块 - 在init中创建以确保DOM已加载
        this.UI = new UIUpdater();
        this.astVisualizer = null;
        this.performanceChart = null;

        // 游戏循环
        this.gameLoop = null;
        this.lastUpdate = Date.now();
        this.saveInterval = null;

        console.log('游戏实例已创建');
    }

    /**
     * 初始化游戏
     */
    init() {
        console.log('正在初始化游戏...');

        // 加载游戏数据
        this.storage.load();

        // 初始化UI组件
        this.initializeUI();

        // 初始化事件监听器
        this.initializeEventListeners();

        // 初始化开发者工具
        initializeDevTools(this);
        exposeDevToolsGlobally(this);

        // 启动游戏循环
        this.startGameLoop();

        // 启动自动保存
        this.startAutoSave();

        console.log('游戏初始化完成！');
    }

    /**
     * 初始化UI组件
     */
    initializeUI() {
        // 初始化标签页系统
        initializeTabs();

        // 初始化图表组件
        this.performanceChart = new PerformanceChart('performance-chart');
        
        // 初始化AST可视化
        this.astVisualizer = new ASTVisualizer('ast-visualization');

        // 更新版本显示
        this.UI.updateVersionDisplay('v0.8.0');

        console.log('UI组件已初始化');
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        // 词法分析按钮
        const lexerBtn = document.getElementById('run-lexer-btn');
        if (lexerBtn) {
            lexerBtn.addEventListener('click', () => this.runLexicalAnalysis());
        }

        // 威望按钮
        const prestigeBtn = document.getElementById('prestige-btn');
        if (prestigeBtn) {
            prestigeBtn.addEventListener('click', () => this.doPrestige());
        }

        // 手动点击获取tokens（如果有相关升级）
        document.addEventListener('click', (event) => {
            if (event.target.id === 'manual-token-btn') {
                this.manualTokenGeneration();
            }
        });

        console.log('事件监听器已初始化');
    }

    /**
     * 启动游戏循环
     */
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            const now = Date.now();
            const deltaTime = (now - this.lastUpdate) / 1000; // 转换为秒
            this.lastUpdate = now;

            this.update(deltaTime);
        }, 100); // 每100ms更新一次

        console.log('游戏循环已启动');
    }

    /**
     * 启动自动保存
     */
    startAutoSave() {
        this.saveInterval = setInterval(() => {
            this.storage.save();
        }, 30000); // 每30秒保存一次

        console.log('自动保存已启动');
    }

    /**
     * 游戏更新循环
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        // 更新游戏状态
        this.updateGameState(deltaTime);

        // 更新UI
        this.UI.updateAll(this.state);

        // 更新图表
        if (this.performanceChart) {
            this.performanceChart.updateChart(this.state);
        }

        // 更新AST可视化
        if (this.astVisualizer) {
            this.astVisualizer.updateVisualization(this.state);
        }
    }

    /**
     * 更新游戏状态
     * @param {number} deltaTime - 时间增量（秒）
     */
    updateGameState(deltaTime) {
        // 计算生产
        const production = this.state.calculateProduction();

        // 应用生产
        Object.keys(production).forEach(resource => {
            if (production[resource].gt(0)) {
                this.state.resources[resource] = this.state.resources[resource]
                    .add(production[resource].mul(deltaTime));
            }
        });

        // 处理转换器消耗
        this.handleConverterConsumption(deltaTime);

        // 更新统计
        this.state.updateStats(deltaTime);

        // 检查解锁条件
        this.state.checkStage3Unlock();
    }

    /**
     * 处理转换器资源消耗
     * @param {number} deltaTime - 时间增量（秒）
     */
    handleConverterConsumption(deltaTime) {
        Object.keys(UPGRADE_DATA).forEach(key => {
            const upgradeData = UPGRADE_DATA[key];
            const level = this.state.upgrades[key] || 0;

            if (level > 0 && upgradeData.type === 'converter') {
                const inputResource = upgradeData.costResource;
                const conversionRate = upgradeData.baseOutput.mul(level).mul(deltaTime);
                
                if (this.state.resources[inputResource].gte(conversionRate)) {
                    this.state.resources[inputResource] = this.state.resources[inputResource]
                        .sub(conversionRate);
                }
            }
        });
    }

    /**
     * 购买升级
     * @param {string} upgradeKey - 升级键名
     * @param {number} amount - 购买数量
     */
    buyUpgrade(upgradeKey, amount = null) {
        const buyAmount = amount || this.state.buyAmount;
        const success = this.state.buyUpgrade(upgradeKey, buyAmount);
        
        if (success) {
            console.log(`成功购买 ${buyAmount} 个 ${upgradeKey}`);
        } else {
            console.log(`无法购买 ${upgradeKey}`);
        }
    }

    /**
     * 设置购买数量
     * @param {number} amount - 购买数量
     */
    setBuyAmount(amount) {
        this.state.setBuyAmount(amount);
        console.log(`购买数量设置为: ${amount}`);
    }

    /**
     * 执行词法分析
     */
    runLexicalAnalysis() {
        const codeInput = document.getElementById('code-input');
        const tokenStream = document.getElementById('token-stream');
        
        if (!codeInput || !tokenStream) {
            console.error('词法分析UI元素未找到');
            return;
        }

        const code = codeInput.value.trim();
        if (!code) {
            tokenStream.innerHTML = '<p class="text-gray-400">请输入代码</p>';
            return;
        }

        // 执行词法分析
        const tokens = this.tokenizer.tokenize(code);
        
        // 清空之前的结果
        tokenStream.innerHTML = '';
        
        // 显示token
        tokens.forEach((token, index) => {
            const tokenElement = document.createElement('span');
            tokenElement.className = `token token-${token.type}`;
            tokenElement.textContent = token.value;
            tokenElement.title = `${token.type} at line ${token.line}, column ${token.column}`;
            tokenStream.appendChild(tokenElement);

            // 添加延迟动画
            setTimeout(() => {
                tokenElement.style.opacity = '1';
                tokenElement.style.transform = 'translateY(0)';
            }, index * 50);
        });

        // 获取手动加成
        const manualMultiplier = this.getManualTokenMultiplier();
        const tokensGained = new Decimal(tokens.length).mul(manualMultiplier);
        
        // 添加tokens
        this.state.resources.tokens = this.state.resources.tokens.add(tokensGained);
        this.state.stats.clickCount++;

        console.log(`词法分析完成，获得 ${tokensGained.toString()} tokens`);
    }

    /**
     * 获取手动Token倍率
     * @returns {Decimal} 倍率
     */
    getManualTokenMultiplier() {
        let multiplier = new Decimal(1);

        // 计算手动升级的加成
        Object.keys(UPGRADE_DATA).forEach(key => {
            const upgradeData = UPGRADE_DATA[key];
            const level = this.state.upgrades[key] || 0;

            if (level > 0 && upgradeData.type === 'manual') {
                multiplier = multiplier.add(upgradeData.baseOutput.mul(level));
            }
        });

        // 威望加成
        const prestigeMultiplier = this.state.getPrestigeMultiplier('tokens');
        return multiplier.mul(prestigeMultiplier);
    }

    /**
     * 执行威望重置
     */
    doPrestige() {
        const gain = this.state.calculatePrestigeGain();
        const runTime = (Date.now() - this.state.startTime) / 1000;
        
        if (gain.lte(0)) {
            console.log('不满足威望重置条件');
            return;
        }

        const success = this.state.doPrestige();
        if (success) {
            // 显示威望弹窗
            const summary = {
                gain: gain,
                newLevel: this.state.prestige.level,
                totalResets: this.state.prestige.totalResets,
                runTime: runTime
            };
            
            this.UI.showPrestigePopup(summary);
            
            // 重置图表
            if (this.performanceChart) {
                this.performanceChart.resetChart();
            }
            
            // 重置AST可视化
            if (this.astVisualizer) {
                this.astVisualizer.reset();
            }
        }
    }

    /**
     * 升级优化技术
     * @param {string} techKey - 技术键名
     */
    upgradeOptimization(techKey) {
        const success = this.state.codeOptimizer.upgradeOptimization(techKey, this.state);
        if (success) {
            console.log(`成功升级优化技术: ${techKey}`);
        } else {
            console.log(`无法升级优化技术: ${techKey}`);
        }
    }

    /**
     * 部署到指定平台
     * @param {string} platform - 平台名称
     */
    deployTo(platform) {
        const success = this.state.performanceAnalyzer.deployTo(platform);
        if (success) {
            console.log(`成功部署到: ${platform}`);
        } else {
            console.log(`无法部署到: ${platform}`);
        }
    }

    /**
     * 暂停游戏
     */
    pause() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
            console.log('游戏已暂停');
        }
    }

    /**
     * 恢复游戏
     */
    resume() {
        if (!this.gameLoop) {
            this.startGameLoop();
            console.log('游戏已恢复');
        }
    }

    /**
     * 手动保存游戏
     */
    save() {
        this.storage.save();
        console.log('游戏已手动保存');
    }

    /**
     * 获取游戏信息
     * @returns {Object} 游戏信息
     */
    getGameInfo() {
        return this.state.getGameInfo();
    }

    /**
     * 销毁游戏实例
     */
    destroy() {
        // 停止游戏循环
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // 停止自动保存
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }

        // 销毁图表
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        // 最后保存
        this.storage.save();

        console.log('游戏实例已销毁');
    }
}
