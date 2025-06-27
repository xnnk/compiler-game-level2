// src/core/gameState.js
// 游戏状态管理器

import { CodeGenerator } from '../modules/codeGenerator.js';
import { CodeOptimizer } from '../modules/codeOptimizer.js';
import { PerformanceAnalyzer } from '../modules/performanceAnalyzer.js';
import { UPGRADE_DATA, PRESTIGE_UPGRADES, STAGE3_UPGRADES } from '../utils/constants.js';

/*
    如何关联: 这是《实现Level1.md》4.4节`GameState`类的实现，是整个游戏逻辑的中枢。
*/
export class GameState {
    constructor() {
        this.reset();
        
        // 初始化第三阶段模块
        this.codeGenerator = new CodeGenerator();
        this.codeOptimizer = new CodeOptimizer();
        this.performanceAnalyzer = new PerformanceAnalyzer();
    }

    /**
     * 重置游戏状态到初始状态
     */
    reset() {
        // 基础资源
        this.resources = {
            tokens: new Decimal(0),
            astNodes: new Decimal(0),
            generatedCode: new Decimal(0),
            optimizedCode: new Decimal(0),
            compilerPoints: new Decimal(0)
        };

        // 升级等级
        this.upgrades = {};
        Object.keys(UPGRADE_DATA).forEach(key => {
            this.upgrades[key] = 0;
        });

        // 威望系统
        this.prestige = {
            level: 0,
            totalResets: 0
        };

        // 第三阶段状态
        this.stage3 = {
            unlocked: false,
            optimizations: {},
            currentDeployment: 'development',
            performanceScore: new Decimal(0)
        };

        // 游戏设置
        this.buyAmount = 1;
        this.devMode = false;
        this.startTime = Date.now();
        this.lastSaveTime = Date.now();
        
        // 性能统计
        this.stats = {
            totalTokensGenerated: new Decimal(0),
            totalNodesBuilt: new Decimal(0),
            totalCodeGenerated: new Decimal(0),
            totalPlayTime: 0,
            clickCount: 0,
            upgradesPurchased: 0
        };
    }

    /**
     * 计算升级成本
     * @param {string} upgradeKey - 升级键名
     * @returns {Decimal} 成本
     */
    getUpgradeCost(upgradeKey) {
        const upgradeData = UPGRADE_DATA[upgradeKey] || STAGE3_UPGRADES[upgradeKey];
        if (!upgradeData) return new Decimal(0);

        const level = this.upgrades[upgradeKey] || 0;
        return upgradeData.baseCost.mul(
            new Decimal(upgradeData.growth).pow(level)
        );
    }

    /**
     * 检查是否可以购买升级
     * @param {string} upgradeKey - 升级键名
     * @param {number} amount - 购买数量
     * @returns {boolean} 是否可以购买
     */
    canBuyUpgrade(upgradeKey, amount = 1) {
        const upgradeData = UPGRADE_DATA[upgradeKey] || STAGE3_UPGRADES[upgradeKey];
        if (!upgradeData) return false;

        // 检查解锁条件
        if (upgradeData.unlockThreshold) {
            const checkResource = upgradeData.costResource || 'tokens';
            if (this.resources[checkResource].lt(upgradeData.unlockThreshold)) {
                return false;
            }
        }

        // 计算总成本
        let totalCost = new Decimal(0);
        const currentLevel = this.upgrades[upgradeKey] || 0;

        for (let i = 0; i < amount; i++) {
            const cost = upgradeData.baseCost.mul(
                new Decimal(upgradeData.growth).pow(currentLevel + i)
            );
            totalCost = totalCost.add(cost);
        }

        // 检查资源
        const costResource = upgradeData.costResource || 'tokens';
        return this.resources[costResource].gte(totalCost);
    }

    /**
     * 购买升级
     * @param {string} upgradeKey - 升级键名
     * @param {number} amount - 购买数量
     * @returns {boolean} 是否成功购买
     */
    buyUpgrade(upgradeKey, amount = 1) {
        if (!this.canBuyUpgrade(upgradeKey, amount)) {
            return false;
        }

        const upgradeData = UPGRADE_DATA[upgradeKey] || STAGE3_UPGRADES[upgradeKey];
        let totalCost = new Decimal(0);
        const currentLevel = this.upgrades[upgradeKey] || 0;

        // 计算总成本
        for (let i = 0; i < amount; i++) {
            const cost = upgradeData.baseCost.mul(
                new Decimal(upgradeData.growth).pow(currentLevel + i)
            );
            totalCost = totalCost.add(cost);
        }

        // 扣除资源
        const costResource = upgradeData.costResource || 'tokens';
        this.resources[costResource] = this.resources[costResource].sub(totalCost);

        // 增加等级
        this.upgrades[upgradeKey] = (this.upgrades[upgradeKey] || 0) + amount;
        this.stats.upgradesPurchased += amount;

        console.log(`购买了 ${amount} 个 ${upgradeData.name}`);
        return true;
    }

    /**
     * 计算每秒产出
     * @returns {Object} 每秒产出数据
     */
    calculateProduction() {
        const production = {
            tokens: new Decimal(0),
            astNodes: new Decimal(0),
            generatedCode: new Decimal(0),
            optimizedCode: new Decimal(0)
        };

        // 计算生成器产出
        Object.keys(UPGRADE_DATA).forEach(key => {
            const upgradeData = UPGRADE_DATA[key];
            const level = this.upgrades[key] || 0;

            if (level > 0 && upgradeData.type === 'generator') {
                const baseOutput = upgradeData.baseOutput.mul(level);
                const prestigeMultiplier = this.getPrestigeMultiplier(upgradeData.resource);
                
                production[upgradeData.resource] = production[upgradeData.resource]
                    .add(baseOutput.mul(prestigeMultiplier));
            }
        });

        // 计算转换器产出
        Object.keys(UPGRADE_DATA).forEach(key => {
            const upgradeData = UPGRADE_DATA[key];
            const level = this.upgrades[key] || 0;

            if (level > 0 && upgradeData.type === 'converter') {
                const inputResource = upgradeData.costResource;
                const outputResource = upgradeData.resource;
                
                if (this.resources[inputResource].gt(0)) {
                    const conversionRate = upgradeData.baseOutput.mul(level);
                    const maxConversion = this.resources[inputResource].mul(conversionRate);
                    
                    production[outputResource] = production[outputResource].add(maxConversion);
                }
            }
        });

        // 第三阶段产出
        if (this.stage3.unlocked) {
            this.calculateStage3Production(production);
        }

        return production;
    }

    /**
     * 计算第三阶段产出
     * @param {Object} production - 产出对象
     * @private
     */
    calculateStage3Production(production) {
        // 代码生成
        if (this.resources.astNodes.gt(0)) {
            const generatedAmount = this.codeGenerator.generateCode(this.resources.astNodes);
            production.generatedCode = production.generatedCode.add(generatedAmount);
        }

        // 代码优化
        if (this.resources.generatedCode.gt(0)) {
            const optimizedAmount = this.codeOptimizer.optimize(this.resources.generatedCode);
            production.optimizedCode = production.optimizedCode.add(optimizedAmount);
        }
    }

    /**
     * 获取威望倍率
     * @param {string} resource - 资源类型
     * @returns {Decimal} 倍率
     */
    getPrestigeMultiplier(resource) {
        let multiplier = new Decimal(1);

        // 基础威望加成
        if (this.prestige.level > 0) {
            multiplier = multiplier.mul(new Decimal(2).pow(this.prestige.level));
        }

        // 威望升级加成
        Object.keys(PRESTIGE_UPGRADES).forEach(key => {
            const upgrade = PRESTIGE_UPGRADES[key];
            if (upgrade.level > 0 && upgrade.unlocked) {
                // 这里可以根据具体升级效果调整
                multiplier = multiplier.mul(new Decimal(1.5).pow(upgrade.level));
            }
        });

        return multiplier;
    }

    /**
     * 计算威望获得
     * @returns {Decimal} 可获得的编译器点数
     */
    calculatePrestigeGain() {
        const totalResources = this.resources.tokens
            .add(this.resources.astNodes.mul(10))
            .add(this.resources.generatedCode.mul(100))
            .add(this.resources.optimizedCode.mul(1000));

        if (totalResources.lt(1000)) {
            return new Decimal(0);
        }

        return totalResources.div(1000).pow(0.5).floor();
    }

    /**
     * 执行威望重置
     * @returns {boolean} 是否成功重置
     */
    doPrestige() {
        const gain = this.calculatePrestigeGain();
        if (gain.lte(0)) {
            return false;
        }

        // 获得编译器点数
        this.resources.compilerPoints = this.resources.compilerPoints.add(gain);
        this.prestige.level++;
        this.prestige.totalResets++;

        // 重置资源和升级
        this.resources.tokens = new Decimal(0);
        this.resources.astNodes = new Decimal(0);
        this.resources.generatedCode = new Decimal(0);
        this.resources.optimizedCode = new Decimal(0);

        // 重置升级
        Object.keys(this.upgrades).forEach(key => {
            this.upgrades[key] = 0;
        });

        // 重置第三阶段模块
        this.codeGenerator.resetStats();
        this.codeOptimizer.resetOptimizer(true); // 保留部分进度
        this.performanceAnalyzer.resetAnalyzer(false);

        console.log(`威望重置完成，获得 ${gain.toString()} 编译器点数`);
        return true;
    }

    /**
     * 检查第三阶段解锁条件
     */
    checkStage3Unlock() {
        if (!this.stage3.unlocked && this.resources.astNodes.gte(1000)) {
            this.stage3.unlocked = true;
            console.log('第三阶段：代码生成 已解锁！');
        }
    }

    /**
     * 更新游戏统计
     * @param {number} deltaTime - 时间增量（秒）
     */
    updateStats(deltaTime) {
        this.stats.totalPlayTime += deltaTime;
    }

    /**
     * 获取游戏信息
     * @returns {Object} 游戏信息
     */
    getGameInfo() {
        return {
            version: '0.8.0',
            startTime: this.startTime,
            playTime: this.stats.totalPlayTime,
            prestige: this.prestige,
            stage3Unlocked: this.stage3.unlocked,
            totalUpgrades: Object.values(this.upgrades).reduce((sum, level) => sum + level, 0),
            devMode: this.devMode
        };
    }

    /**
     * 设置购买数量
     * @param {number} amount - 购买数量
     */
    setBuyAmount(amount) {
        this.buyAmount = Math.max(1, amount);
    }

    /**
     * 切换开发者模式
     */
    toggleDevMode() {
        this.devMode = !this.devMode;
        console.log(`开发者模式: ${this.devMode ? '开启' : '关闭'}`);
    }
}
