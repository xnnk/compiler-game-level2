// src/storage/storageManager.js
// 游戏数据持久化管理器

import { PRESTIGE_UPGRADES, OPTIMIZATION_TECHS } from '../utils/constants.js';

/**
 * 存储管理器类 - 负责游戏数据的保存和加载
 */
export class StorageManager {
    constructor(gameState) {
        this.state = gameState;
        this.saveKey = 'compilerGameSave';
    }

    /**
     * 保存游戏数据到 localStorage
     */
    save() {
        try {
            const saveData = {
                version: '0.8.0',
                timestamp: Date.now(),
                
                // 基础资源
                resources: {
                    tokens: this.state.resources.tokens.toString(),
                    astNodes: this.state.resources.astNodes.toString(),
                    generatedCode: this.state.resources.generatedCode.toString(),
                    optimizedCode: this.state.resources.optimizedCode.toString(),
                    compilerPoints: this.state.resources.compilerPoints.toString()
                },
                
                // 升级数据
                upgrades: {},
                
                // 威望系统
                prestige: {
                    level: this.state.prestige.level,
                    totalResets: this.state.prestige.totalResets,
                    upgrades: {}
                },
                
                // 第三阶段数据
                stage3: {
                    unlocked: this.state.stage3.unlocked,
                    optimizations: {},
                    currentDeployment: this.state.stage3.currentDeployment,
                    performanceScore: this.state.stage3.performanceScore.toString()
                },
                
                // 游戏设置
                settings: {
                    buyAmount: this.state.buyAmount,
                    devMode: this.state.devMode,
                    startTime: this.state.startTime
                }
            };

            // 保存升级等级
            Object.keys(this.state.upgrades).forEach(key => {
                saveData.upgrades[key] = this.state.upgrades[key];
            });

            // 保存威望升级
            Object.keys(PRESTIGE_UPGRADES).forEach(key => {
                const upgrade = PRESTIGE_UPGRADES[key];
                saveData.prestige.upgrades[key] = {
                    level: upgrade.level,
                    cost: upgrade.cost.toString(),
                    unlocked: upgrade.unlocked
                };
            });

            // 保存优化技术
            Object.keys(OPTIMIZATION_TECHS).forEach(key => {
                const tech = this.state.stage3.optimizations[key];
                if (tech) {
                    saveData.stage3.optimizations[key] = {
                        level: tech.level,
                        cost: tech.cost.toString()
                    };
                }
            });

            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('游戏已保存');
            
        } catch (error) {
            console.error('保存游戏时出错:', error);
        }
    }

    /**
     * 从 localStorage 加载游戏数据
     * @returns {boolean} 是否成功加载数据
     */
    load() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) {
                console.log('未找到存档数据，开始新游戏');
                return false;
            }

            const data = JSON.parse(saveData);
            console.log('正在加载存档...', data.version);

            // 加载基础资源
            if (data.resources) {
                Object.keys(data.resources).forEach(key => {
                    if (this.state.resources[key] !== undefined) {
                        this.state.resources[key] = new Decimal(data.resources[key]);
                    }
                });
            }

            // 加载升级数据
            if (data.upgrades) {
                Object.keys(data.upgrades).forEach(key => {
                    this.state.upgrades[key] = data.upgrades[key] || 0;
                });
            }

            // 加载威望数据
            if (data.prestige) {
                this.state.prestige.level = data.prestige.level || 0;
                this.state.prestige.totalResets = data.prestige.totalResets || 0;
                
                if (data.prestige.upgrades) {
                    Object.keys(data.prestige.upgrades).forEach(key => {
                        const upgradeData = data.prestige.upgrades[key];
                        if (PRESTIGE_UPGRADES[key] && upgradeData) {
                            PRESTIGE_UPGRADES[key].level = upgradeData.level || 0;
                            PRESTIGE_UPGRADES[key].cost = new Decimal(upgradeData.cost || PRESTIGE_UPGRADES[key].baseCost);
                            PRESTIGE_UPGRADES[key].unlocked = upgradeData.unlocked || false;
                        }
                    });
                }
            }

            // 加载第三阶段数据
            if (data.stage3) {
                this.state.stage3.unlocked = data.stage3.unlocked || false;
                this.state.stage3.currentDeployment = data.stage3.currentDeployment || 'development';
                this.state.stage3.performanceScore = new Decimal(data.stage3.performanceScore || 0);
                
                if (data.stage3.optimizations) {
                    Object.keys(data.stage3.optimizations).forEach(key => {
                        const optData = data.stage3.optimizations[key];
                        if (OPTIMIZATION_TECHS[key] && optData) {
                            this.state.stage3.optimizations[key] = {
                                level: optData.level || 0,
                                cost: new Decimal(optData.cost || OPTIMIZATION_TECHS[key].baseCost)
                            };
                        }
                    });
                }
            }

            // 加载游戏设置
            if (data.settings) {
                this.state.buyAmount = data.settings.buyAmount || 1;
                this.state.devMode = data.settings.devMode || false;
                this.state.startTime = data.settings.startTime || Date.now();
            }

            console.log('存档加载完成');
            return true;
            
        } catch (error) {
            console.error('加载存档时出错:', error);
            return false;
        }
    }

    /**
     * 删除存档数据
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('存档已删除');
        } catch (error) {
            console.error('删除存档时出错:', error);
        }
    }

    /**
     * 导出存档数据为字符串
     * @returns {string} 存档数据字符串
     */
    exportSave() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            return saveData ? btoa(saveData) : null;
        } catch (error) {
            console.error('导出存档时出错:', error);
            return null;
        }
    }

    /**
     * 从字符串导入存档数据
     * @param {string} saveString - 存档数据字符串
     * @returns {boolean} 是否成功导入
     */
    importSave(saveString) {
        try {
            const saveData = atob(saveString);
            const data = JSON.parse(saveData);
            
            // 验证数据格式
            if (!data.version || !data.resources) {
                throw new Error('无效的存档格式');
            }
            
            localStorage.setItem(this.saveKey, saveData);
            return this.load();
            
        } catch (error) {
            console.error('导入存档时出错:', error);
            return false;
        }
    }
}
