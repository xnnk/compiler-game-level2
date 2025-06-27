// src/modules/performanceAnalyzer.js
// 性能分析器模块

import { DEPLOYMENT_PLATFORMS } from '../utils/constants.js';

/*
    是什么: 性能分析器类，评估代码质量并生成性能分数。
    为什么: 提供第三阶段的最终产出指标，用于解锁高级功能。
    如何关联: 实现《第三阶段实现方案》中的性能分析系统。
*/
export class PerformanceAnalyzer {
    constructor() {
        this.currentPlatform = 'development';
        this.performanceHistory = [];
        this.deploymentStats = {};
        this.detailedMetrics = {
            executionSpeed: new Decimal(1),
            memoryEfficiency: new Decimal(1),
            codeQuality: new Decimal(1),
            reliability: new Decimal(1),
            scalability: new Decimal(1)
        };
        
        // 初始化部署统计
        Object.keys(DEPLOYMENT_PLATFORMS).forEach(platform => {
            this.deploymentStats[platform] = {
                totalDeployments: 0,
                cumulativeScore: new Decimal(0),
                bestScore: new Decimal(0),
                averageScore: new Decimal(0)
            };
        });
    }
    
    /**
     * 分析优化后的代码性能
     * @param {Decimal} optimizedCode - 优化后的代码量
     * @returns {Decimal} 性能分数
     */
    analyzeCode(optimizedCode) {
        if (!optimizedCode || optimizedCode.lte(0)) {
            return new Decimal(0);
        }

        const platform = DEPLOYMENT_PLATFORMS[this.currentPlatform];
        if (!platform) {
            console.error('无效的部署平台:', this.currentPlatform);
            return new Decimal(0);
        }

        // 基础性能分数计算
        const baseScore = optimizedCode.mul(0.1);
        
        // 平台倍率
        const platformMultiplier = new Decimal(platform.multiplier);
        
        // 历史经验加成
        const experienceBonus = this.getExperienceBonus();
        
        // 计算最终性能分数
        const finalScore = baseScore
            .mul(platformMultiplier)
            .mul(experienceBonus);

        // 更新详细指标
        this.updateDetailedMetrics(optimizedCode);
        
        // 记录性能历史
        this.recordPerformance(finalScore);
        
        // 更新部署统计
        this.updateDeploymentStats(finalScore);

        return finalScore;
    }
    
    /**
     * 更新详细性能指标
     * @param {Decimal} optimizedCode - 优化后的代码量
     * @private
     */
    updateDetailedMetrics(optimizedCode) {
        const platform = DEPLOYMENT_PLATFORMS[this.currentPlatform];
        const platformFactor = new Decimal(platform.multiplier);
        
        // 执行速度：受平台性能影响
        this.detailedMetrics.executionSpeed = new Decimal(1)
            .add(optimizedCode.div(1000).mul(0.1))
            .mul(platformFactor);
        
        // 内存效率：代码越优化，内存使用越高效
        this.detailedMetrics.memoryEfficiency = new Decimal(1)
            .add(optimizedCode.div(2000).mul(0.15));
        
        // 代码质量：基于优化程度
        this.detailedMetrics.codeQuality = new Decimal(1)
            .add(optimizedCode.div(1500).mul(0.12));
        
        // 可靠性：基于代码量和平台稳定性
        this.detailedMetrics.reliability = new Decimal(0.8)
            .add(optimizedCode.div(3000).mul(0.2))
            .add(platformFactor.mul(0.1));
        
        // 可扩展性：高级平台提供更好的可扩展性
        this.detailedMetrics.scalability = new Decimal(0.9)
            .add(platformFactor.mul(0.2))
            .add(optimizedCode.div(5000).mul(0.1));
    }
    
    /**
     * 部署到指定平台
     * @param {string} platform - 平台名称
     * @returns {boolean} 是否成功部署
     */
    deployTo(platform) {
        if (!DEPLOYMENT_PLATFORMS[platform]) {
            console.error('未知的部署平台:', platform);
            return false;
        }
        
        if (!this.checkPlatformUnlock(platform)) {
            console.log('平台尚未解锁:', DEPLOYMENT_PLATFORMS[platform].name);
            return false;
        }
        
        this.currentPlatform = platform;
        console.log(`已部署到: ${DEPLOYMENT_PLATFORMS[platform].name}`);
        return true;
    }
    
    /**
     * 检查平台是否已解锁
     * @param {string} platform - 平台名称
     * @returns {boolean} 是否已解锁
     */
    checkPlatformUnlock(platform) {
        const platformData = DEPLOYMENT_PLATFORMS[platform];
        if (!platformData) return false;
        
        // 检查基础解锁条件
        if (platformData.unlocked) return true;
        
        // 检查性能分数要求
        if (platformData.unlockThreshold) {
            const totalScore = Object.values(this.deploymentStats)
                .reduce((sum, stats) => sum.add(stats.cumulativeScore), new Decimal(0));
            
            if (totalScore.lt(platformData.unlockThreshold)) {
                return false;
            }
        }
        
        // 检查威望要求
        if (platformData.requiresPrestige) {
            // 这里需要从游戏状态获取威望等级，暂时返回 true
            // 实际实现时需要传入游戏状态
            return true;
        }
        
        return true;
    }
    
    /**
     * 获取性能评级
     * @returns {Object} 评级信息
     */
    getPerformanceRating() {
        const avgScore = this.getAveragePerformanceScore();
        
        let rating, color, description;
        
        if (avgScore.gte(10000)) {
            rating = 'S+';
            color = '#ff6b9d';
            description = '传奇级性能';
        } else if (avgScore.gte(5000)) {
            rating = 'S';
            color = '#ffd700';
            description = '卓越性能';
        } else if (avgScore.gte(2000)) {
            rating = 'A';
            color = '#39c5fe';
            description = '优秀性能';
        } else if (avgScore.gte(1000)) {
            rating = 'B';
            color = '#23d18b';
            description = '良好性能';
        } else if (avgScore.gte(500)) {
            rating = 'C';
            color = '#f1fa8c';
            description = '一般性能';
        } else {
            rating = 'D';
            color = '#ff5555';
            description = '待改进';
        }
        
        return {
            rating,
            color,
            description,
            score: avgScore
        };
    }
    
    /**
     * 获取经验加成
     * @returns {Decimal} 经验倍率
     * @private
     */
    getExperienceBonus() {
        const totalDeployments = Object.values(this.deploymentStats)
            .reduce((sum, stats) => sum + stats.totalDeployments, 0);
        
        return new Decimal(1).add(totalDeployments * 0.01);
    }
    
    /**
     * 记录性能历史
     * @param {Decimal} score - 性能分数
     * @private
     */
    recordPerformance(score) {
        this.performanceHistory.push({
            timestamp: Date.now(),
            score: score,
            platform: this.currentPlatform,
            metrics: { ...this.detailedMetrics }
        });
        
        // 保持历史记录在合理范围内
        if (this.performanceHistory.length > 200) {
            this.performanceHistory.shift();
        }
    }
    
    /**
     * 更新部署统计
     * @param {Decimal} score - 性能分数
     * @private
     */
    updateDeploymentStats(score) {
        const stats = this.deploymentStats[this.currentPlatform];
        
        stats.totalDeployments++;
        stats.cumulativeScore = stats.cumulativeScore.add(score);
        
        if (score.gt(stats.bestScore)) {
            stats.bestScore = score;
        }
        
        stats.averageScore = stats.cumulativeScore.div(stats.totalDeployments);
    }
    
    /**
     * 获取平均性能分数
     * @returns {Decimal} 平均性能分数
     */
    getAveragePerformanceScore() {
        if (this.performanceHistory.length === 0) {
            return new Decimal(0);
        }
        
        const totalScore = this.performanceHistory.reduce(
            (sum, record) => sum.add(record.score), 
            new Decimal(0)
        );
        
        return totalScore.div(this.performanceHistory.length);
    }
    
    /**
     * 获取可用的部署平台
     * @returns {Array} 平台列表
     */
    getAvailablePlatforms() {
        return Object.keys(DEPLOYMENT_PLATFORMS).map(key => {
            const platform = DEPLOYMENT_PLATFORMS[key];
            const stats = this.deploymentStats[key];
            
            return {
                id: key,
                name: platform.name,
                multiplier: platform.multiplier,
                isUnlocked: this.checkPlatformUnlock(key),
                isCurrent: key === this.currentPlatform,
                stats: stats,
                unlockThreshold: platform.unlockThreshold
            };
        });
    }
    
    /**
     * 获取性能分析统计
     * @returns {Object} 统计信息
     */
    getAnalysisStats() {
        return {
            totalAnalyses: this.performanceHistory.length,
            averageScore: this.getAveragePerformanceScore(),
            bestScore: Math.max(...Object.values(this.deploymentStats).map(s => s.bestScore.toNumber())),
            currentPlatform: this.currentPlatform,
            platformMultiplier: DEPLOYMENT_PLATFORMS[this.currentPlatform].multiplier,
            detailedMetrics: { ...this.detailedMetrics },
            rating: this.getPerformanceRating()
        };
    }
    
    /**
     * 重置分析器（用于威望重置）
     * @param {boolean} keepHistory - 是否保留历史记录
     */
    resetAnalyzer(keepHistory = false) {
        this.currentPlatform = 'development';
        
        if (!keepHistory) {
            this.performanceHistory = [];
            Object.keys(this.deploymentStats).forEach(platform => {
                this.deploymentStats[platform] = {
                    totalDeployments: 0,
                    cumulativeScore: new Decimal(0),
                    bestScore: new Decimal(0),
                    averageScore: new Decimal(0)
                };
            });
        }
        
        this.detailedMetrics = {
            executionSpeed: new Decimal(1),
            memoryEfficiency: new Decimal(1),
            codeQuality: new Decimal(1),
            reliability: new Decimal(1),
            scalability: new Decimal(1)
        };
    }
}
