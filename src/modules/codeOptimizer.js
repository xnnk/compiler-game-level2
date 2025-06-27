// src/modules/codeOptimizer.js
// 代码优化器模块

import { OPTIMIZATION_TECHS } from '../utils/constants.js';

/*
    是什么: 代码优化器类，实现各种编译器优化技术。
    为什么: 模拟真实编译器的优化过程，提供策略深度和技术树玩法。
    如何关联: 实现《第三阶段实现方案》中的优化技术树概念。
*/
export class CodeOptimizer {
    constructor() {
        this.optimizations = {};
        this.optimizationHistory = [];
        this.totalOptimizationScore = new Decimal(0);
        
        // 初始化优化技术
        Object.keys(OPTIMIZATION_TECHS).forEach(key => {
            this.optimizations[key] = {
                level: 0,
                cost: new Decimal(OPTIMIZATION_TECHS[key].baseCost),
                totalApplications: 0,
                effectiveness: 0
            };
        });
    }
    
    /**
     * 获取总体优化倍率
     * @returns {Decimal} 优化倍率
     */
    getOptimizationMultiplier() {
        let totalMultiplier = new Decimal(1);
        
        Object.keys(this.optimizations).forEach(key => {
            const tech = OPTIMIZATION_TECHS[key];
            const optimization = this.optimizations[key];
            
            if (optimization.level > 0) {
                const bonus = new Decimal(1).add(
                    tech.efficiency * optimization.level
                );
                totalMultiplier = totalMultiplier.mul(bonus);
            }
        });
        
        return totalMultiplier;
    }
    
    /**
     * 优化生成的代码
     * @param {Decimal} generatedCode - 生成的代码量
     * @returns {Decimal} 优化后的代码量
     */
    optimize(generatedCode) {
        if (!generatedCode || generatedCode.lte(0)) {
            return new Decimal(0);
        }

        const multiplier = this.getOptimizationMultiplier();
        const optimizedAmount = generatedCode.mul(multiplier);
        
        // 记录优化历史
        this.recordOptimization(generatedCode, optimizedAmount);
        
        // 更新技术使用统计
        this.updateTechStats(generatedCode);
        
        return optimizedAmount;
    }
    
    /**
     * 检查是否可以升级优化技术
     * @param {string} techKey - 技术键名
     * @param {Object} gameState - 游戏状态
     * @returns {boolean} 是否可以升级
     */
    canUpgradeOptimization(techKey, gameState) {
        const tech = OPTIMIZATION_TECHS[techKey];
        const optimization = this.optimizations[techKey];
        
        if (!tech || !optimization) {
            return false;
        }
        
        // 检查等级上限
        if (optimization.level >= tech.maxLevel) {
            return false;
        }
        
        // 检查是否有足够的优化代码
        return gameState.resources.optimizedCode.gte(optimization.cost);
    }
    
    /**
     * 升级优化技术
     * @param {string} techKey - 技术键名
     * @param {Object} gameState - 游戏状态
     * @returns {boolean} 是否成功升级
     */
    upgradeOptimization(techKey, gameState) {
        if (!this.canUpgradeOptimization(techKey, gameState)) {
            return false;
        }
        
        const tech = OPTIMIZATION_TECHS[techKey];
        const optimization = this.optimizations[techKey];
        
        // 扣除成本
        gameState.resources.optimizedCode = gameState.resources.optimizedCode.sub(optimization.cost);
        
        // 升级
        optimization.level++;
        
        // 计算新成本
        optimization.cost = new Decimal(tech.baseCost).mul(
            new Decimal(tech.growth).pow(optimization.level)
        );
        
        console.log(`${tech.name} 升级到等级 ${optimization.level}`);
        return true;
    }
    
    /**
     * 获取优化技术列表
     * @param {Object} gameState - 游戏状态
     * @returns {Array} 技术列表
     */
    getOptimizationTechs(gameState) {
        return Object.keys(OPTIMIZATION_TECHS).map(key => {
            const tech = OPTIMIZATION_TECHS[key];
            const optimization = this.optimizations[key];
            
            return {
                id: key,
                name: tech.name,
                description: tech.description,
                level: optimization.level,
                maxLevel: tech.maxLevel,
                cost: optimization.cost,
                efficiency: tech.efficiency,
                canAfford: this.canUpgradeOptimization(key, gameState),
                isMaxLevel: optimization.level >= tech.maxLevel,
                effectiveness: optimization.effectiveness,
                totalApplications: optimization.totalApplications
            };
        });
    }
    
    /**
     * 记录优化历史
     * @param {Decimal} input - 输入代码量
     * @param {Decimal} output - 输出代码量
     * @private
     */
    recordOptimization(input, output) {
        const improvement = output.div(input);
        
        this.optimizationHistory.push({
            timestamp: Date.now(),
            input: input,
            output: output,
            improvement: improvement
        });
        
        // 保持历史记录在合理范围内
        if (this.optimizationHistory.length > 100) {
            this.optimizationHistory.shift();
        }
        
        this.totalOptimizationScore = this.totalOptimizationScore.add(output.sub(input));
    }
    
    /**
     * 更新技术使用统计
     * @param {Decimal} codeAmount - 代码量
     * @private
     */
    updateTechStats(codeAmount) {
        Object.keys(this.optimizations).forEach(key => {
            const optimization = this.optimizations[key];
            if (optimization.level > 0) {
                optimization.totalApplications++;
                
                // 计算该技术的有效性
                const tech = OPTIMIZATION_TECHS[key];
                const techContribution = tech.efficiency * optimization.level;
                optimization.effectiveness = techContribution;
            }
        });
    }
    
    /**
     * 获取优化统计信息
     * @returns {Object} 统计信息
     */
    getOptimizationStats() {
        const recentHistory = this.optimizationHistory.slice(-10);
        let avgImprovement = new Decimal(1);
        
        if (recentHistory.length > 0) {
            const totalImprovement = recentHistory.reduce(
                (sum, record) => sum.add(record.improvement), 
                new Decimal(0)
            );
            avgImprovement = totalImprovement.div(recentHistory.length);
        }
        
        return {
            totalOptimizationScore: this.totalOptimizationScore,
            optimizationHistoryLength: this.optimizationHistory.length,
            averageImprovement: avgImprovement,
            totalOptimizationMultiplier: this.getOptimizationMultiplier(),
            activeTechnologies: Object.values(this.optimizations)
                .filter(opt => opt.level > 0).length
        };
    }
    
    /**
     * 获取推荐的下一个升级
     * @param {Object} gameState - 游戏状态
     * @returns {string|null} 推荐的技术键名
     */
    getRecommendedUpgrade(gameState) {
        const availableUpgrades = this.getOptimizationTechs(gameState)
            .filter(tech => tech.canAfford && !tech.isMaxLevel);
        
        if (availableUpgrades.length === 0) {
            return null;
        }
        
        // 优先推荐效率最高且成本相对较低的技术
        const bestUpgrade = availableUpgrades.reduce((best, current) => {
            const bestRatio = best.efficiency / best.cost.toNumber();
            const currentRatio = current.efficiency / current.cost.toNumber();
            return currentRatio > bestRatio ? current : best;
        });
        
        return bestUpgrade.id;
    }
    
    /**
     * 重置优化器（用于威望重置）
     * @param {boolean} keepSomeProgress - 是否保留部分进度
     */
    resetOptimizer(keepSomeProgress = false) {
        Object.keys(this.optimizations).forEach(key => {
            const tech = OPTIMIZATION_TECHS[key];
            this.optimizations[key] = {
                level: keepSomeProgress ? Math.floor(this.optimizations[key].level * 0.1) : 0,
                cost: new Decimal(tech.baseCost),
                totalApplications: keepSomeProgress ? this.optimizations[key].totalApplications : 0,
                effectiveness: 0
            };
        });
        
        if (!keepSomeProgress) {
            this.optimizationHistory = [];
            this.totalOptimizationScore = new Decimal(0);
        }
    }
}
