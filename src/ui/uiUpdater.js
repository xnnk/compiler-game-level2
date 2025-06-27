// src/ui/uiUpdater.js
// UI更新器 - 负责更新所有界面元素

import { formatNumber, formatTime, formatPercentage } from '../utils/formatters.js';
import { UPGRADE_DATA, STAGE3_UPGRADES } from '../utils/constants.js';

/**
 * UI更新器类 - 负责更新所有界面显示
 */
export class UIUpdater {
    constructor() {
        this.lastUpdateTime = 0;
        this.updateInterval = 100; // 100ms 更新一次
    }

    /**
     * 更新所有UI元素
     * @param {Object} gameState - 游戏状态
     */
    updateAll(gameState) {
        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateInterval) {
            return; // 限制更新频率
        }
        this.lastUpdateTime = now;

        this.updateStats(gameState);
        this.updateUpgrades(gameState);
        this.updatePrestige(gameState);
        this.updateStage3(gameState);
    }

    /**
     * 更新状态面板
     * @param {Object} gameState - 游戏状态
     */
    updateStats(gameState) {
        const container = document.getElementById('stats-container');
        if (!container) return;

        const production = gameState.calculateProduction();
        
        const stats = [
            {
                label: 'Tokens',
                value: formatNumber(gameState.resources.tokens),
                rate: production.tokens.gt(0) ? `+${formatNumber(production.tokens)}/s` : null,
                icon: '🔤'
            },
            {
                label: 'AST 节点',
                value: formatNumber(gameState.resources.astNodes),
                rate: production.astNodes.gt(0) ? `+${formatNumber(production.astNodes)}/s` : null,
                icon: '🌳'
            },
            {
                label: '生成代码',
                value: formatNumber(gameState.resources.generatedCode),
                rate: production.generatedCode.gt(0) ? `+${formatNumber(production.generatedCode)}/s` : null,
                icon: '⚙️',
                hidden: !gameState.stage3.unlocked
            },
            {
                label: '优化代码',
                value: formatNumber(gameState.resources.optimizedCode),
                rate: production.optimizedCode.gt(0) ? `+${formatNumber(production.optimizedCode)}/s` : null,
                icon: '🚀',
                hidden: !gameState.stage3.unlocked
            },
            {
                label: '编译器点数',
                value: formatNumber(gameState.resources.compilerPoints),
                icon: '💎',
                hidden: gameState.prestige.level === 0
            },
            {
                label: '游戏时间',
                value: formatTime((Date.now() - gameState.startTime) / 1000),
                icon: '⏱️'
            }
        ];

        container.innerHTML = stats
            .filter(stat => !stat.hidden)
            .map(stat => this.createStatHTML(stat))
            .join('');
    }

    /**
     * 创建统计项HTML
     * @param {Object} stat - 统计数据
     * @returns {string} HTML字符串
     */
    createStatHTML(stat) {
        return `
            <div class="stat-item">
                <div class="flex items-center justify-center mb-2">
                    <span class="text-2xl mr-2">${stat.icon}</span>
                    <span class="text-sm text-gray-400">${stat.label}</span>
                </div>
                <div class="text-lg font-bold text-white">${stat.value}</div>
                ${stat.rate ? `<div class="text-sm text-green-400">${stat.rate}</div>` : ''}
            </div>
        `;
    }

    /**
     * 更新升级面板
     * @param {Object} gameState - 游戏状态
     */
    updateUpgrades(gameState) {
        const container = document.getElementById('upgrades-container');
        if (!container) return;

        const upgrades = Object.keys(UPGRADE_DATA)
            .filter(key => this.isUpgradeVisible(key, gameState))
            .map(key => this.createUpgradeData(key, gameState));

        container.innerHTML = upgrades.map(upgrade => this.createUpgradeHTML(upgrade)).join('');

        // 更新购买数量按钮状态
        this.updateBuyAmountButtons(gameState.buyAmount);
    }

    /**
     * 检查升级是否可见
     * @param {string} upgradeKey - 升级键名
     * @param {Object} gameState - 游戏状态
     * @returns {boolean} 是否可见
     */
    isUpgradeVisible(upgradeKey, gameState) {
        const upgradeData = UPGRADE_DATA[upgradeKey];
        if (!upgradeData.unlockThreshold) return true;

        const checkResource = upgradeData.costResource || 'tokens';
        return gameState.resources[checkResource].gte(upgradeData.unlockThreshold);
    }

    /**
     * 创建升级数据对象
     * @param {string} upgradeKey - 升级键名
     * @param {Object} gameState - 游戏状态
     * @returns {Object} 升级数据
     */
    createUpgradeData(upgradeKey, gameState) {
        const upgradeData = UPGRADE_DATA[upgradeKey];
        const level = gameState.upgrades[upgradeKey] || 0;
        const cost = gameState.getUpgradeCost(upgradeKey);
        const canAfford = gameState.canBuyUpgrade(upgradeKey, gameState.buyAmount);

        let output = '';
        if (upgradeData.type === 'manual') {
            output = `每次点击 +${formatNumber(upgradeData.baseOutput.mul(level + 1))}`;
        } else if (upgradeData.type === 'generator') {
            output = `${formatNumber(upgradeData.baseOutput.mul(level))}/s`;
        } else if (upgradeData.type === 'converter') {
            output = `转换率: ${formatNumber(upgradeData.baseOutput.mul(level))}`;
        }

        return {
            key: upgradeKey,
            name: upgradeData.name,
            description: upgradeData.description,
            level: level,
            cost: cost,
            canAfford: canAfford,
            output: output,
            buyAmount: gameState.buyAmount
        };
    }

    /**
     * 创建升级HTML
     * @param {Object} upgrade - 升级数据
     * @returns {string} HTML字符串
     */
    createUpgradeHTML(upgrade) {
        const buttonClass = upgrade.canAfford ? 'btn-primary' : 'btn-primary';
        const disabledAttr = upgrade.canAfford ? '' : 'disabled';

        return `
            <div class="hacker-box p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-white">${upgrade.name}</h3>
                    <span class="text-sm text-gray-400">Lv.${upgrade.level}</span>
                </div>
                <p class="text-sm text-gray-300 mb-3">${upgrade.description}</p>
                <div class="text-sm text-cyan-400 mb-3">${upgrade.output}</div>
                <div class="flex justify-between items-center">
                    <span class="text-lg font-bold ${upgrade.canAfford ? 'text-green-400' : 'text-red-400'}">
                        ${formatNumber(upgrade.cost)}
                    </span>
                    <button 
                        class="btn ${buttonClass}" 
                        ${disabledAttr}
                        onclick="game.buyUpgrade('${upgrade.key}', ${upgrade.buyAmount})"
                    >
                        购买 ${upgrade.buyAmount > 1 ? `x${upgrade.buyAmount}` : ''}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 更新购买数量按钮状态
     * @param {number} currentAmount - 当前购买数量
     */
    updateBuyAmountButtons(currentAmount) {
        document.querySelectorAll('.buy-amount-btn').forEach(btn => {
            const amount = parseInt(btn.dataset.amount);
            btn.classList.toggle('active', amount === currentAmount);
        });
    }

    /**
     * 更新威望面板
     * @param {Object} gameState - 游戏状态
     */
    updatePrestige(gameState) {
        const panel = document.getElementById('prestige-panel');
        const gainDisplay = document.getElementById('prestige-gain-display');
        const prestigeBtn = document.getElementById('prestige-btn');

        if (!panel || !gainDisplay || !prestigeBtn) return;

        const prestigeGain = gameState.calculatePrestigeGain();
        const canPrestige = prestigeGain.gt(0);

        // 显示/隐藏威望面板
        if (canPrestige || gameState.prestige.level > 0) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }

        // 更新显示
        gainDisplay.textContent = formatNumber(prestigeGain);
        prestigeBtn.disabled = !canPrestige;
    }

    /**
     * 更新第三阶段面板
     * @param {Object} gameState - 游戏状态
     */
    updateStage3(gameState) {
        const tab = document.getElementById('stage3-tab');
        const tabContent = document.getElementById('stage3-tab-content');

        if (!tab || !tabContent) return;

        // 检查解锁条件
        gameState.checkStage3Unlock();

        // 显示/隐藏第三阶段标签
        if (gameState.stage3.unlocked) {
            tab.classList.remove('hidden');
            tabContent.classList.remove('hidden');
            this.updateStage3Content(gameState);
        } else {
            tab.classList.add('hidden');
            tabContent.classList.add('hidden');
        }
    }

    /**
     * 更新第三阶段内容
     * @param {Object} gameState - 游戏状态
     * @private
     */
    updateStage3Content(gameState) {
        // 更新代码生成状态
        this.updateCodeGenerationStatus(gameState);
        
        // 更新优化面板
        this.updateOptimizationPanel(gameState);
        
        // 更新部署面板
        this.updateDeploymentPanel(gameState);
    }

    /**
     * 更新代码生成状态
     * @param {Object} gameState - 游戏状态
     * @private
     */
    updateCodeGenerationStatus(gameState) {
        const container = document.getElementById('code-generation-status');
        if (!container) return;

        const generatorInfo = gameState.codeGenerator.getCurrentTemplateInfo();
        const stats = gameState.codeGenerator.getStats();

        container.innerHTML = `
            <div class="text-center">
                <h3 class="text-lg font-bold mb-2">代码生成器</h3>
                <p class="text-sm text-gray-400">当前模板: ${generatorInfo.name}</p>
                <p class="text-sm text-cyan-400">效率: ${formatPercentage(generatorInfo.efficiency)}</p>
                <p class="text-sm text-green-400">已生成: ${formatNumber(stats.totalGenerated)}</p>
            </div>
        `;
    }

    /**
     * 更新优化面板
     * @param {Object} gameState - 游戏状态
     * @private
     */
    updateOptimizationPanel(gameState) {
        const container = document.getElementById('optimization-panel');
        if (!container) return;

        const techs = gameState.codeOptimizer.getOptimizationTechs(gameState);
        const multiplier = gameState.codeOptimizer.getOptimizationMultiplier();

        container.innerHTML = `
            <div>
                <h3 class="text-lg font-bold mb-2">代码优化</h3>
                <p class="text-sm text-green-400 mb-4">总倍率: ${formatNumber(multiplier)}x</p>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                    ${techs.map(tech => this.createOptimizationTechHTML(tech)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 创建优化技术HTML
     * @param {Object} tech - 技术数据
     * @returns {string} HTML字符串
     * @private
     */
    createOptimizationTechHTML(tech) {
        const buttonClass = tech.canAfford && !tech.isMaxLevel ? 'btn-mini btn-primary' : 'btn-mini';
        const disabledAttr = tech.canAfford && !tech.isMaxLevel ? '' : 'disabled';

        return `
            <div class="optimization-tech hacker-box p-3">
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold text-sm">${tech.name}</h4>
                        <p class="text-xs text-gray-400">${tech.description}</p>
                        <span class="text-xs text-cyan-400">Lv.${tech.level}/${tech.maxLevel}</span>
                    </div>
                    <button 
                        class="${buttonClass}" 
                        ${disabledAttr}
                        onclick="game.upgradeOptimization('${tech.id}')"
                    >
                        ${tech.isMaxLevel ? 'MAX' : formatNumber(tech.cost)}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 更新部署面板
     * @param {Object} gameState - 游戏状态
     * @private
     */
    updateDeploymentPanel(gameState) {
        const container = document.getElementById('deployment-panel');
        if (!container) return;

        const platforms = gameState.performanceAnalyzer.getAvailablePlatforms();
        const rating = gameState.performanceAnalyzer.getPerformanceRating();

        container.innerHTML = `
            <div>
                <h3 class="text-lg font-bold mb-2">部署平台</h3>
                <div class="mb-4 text-center">
                    <div class="performance-rating text-2xl font-bold" style="color: ${rating.color}">
                        ${rating.rating}
                    </div>
                    <p class="text-sm text-gray-400">${rating.description}</p>
                </div>
                <div class="space-y-2">
                    ${platforms.map(platform => this.createPlatformHTML(platform)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 创建平台HTML
     * @param {Object} platform - 平台数据
     * @returns {string} HTML字符串
     * @private
     */
    createPlatformHTML(platform) {
        const isDisabled = !platform.isUnlocked;
        const className = `deployment-platform hacker-box p-2 cursor-pointer ${isDisabled ? 'opacity-50' : ''} ${platform.isCurrent ? 'border-cyan-400' : ''}`;

        return `
            <div class="${className}" ${!isDisabled ? `onclick="game.deployTo('${platform.id}')"` : ''}>
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold text-sm">${platform.name}</h4>
                        <span class="text-xs text-green-400">${platform.multiplier}x 倍率</span>
                    </div>
                    ${platform.isCurrent ? '<span class="text-xs text-cyan-400">当前</span>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * 显示威望弹窗
     * @param {Object} summary - 威望总结数据
     */
    showPrestigePopup(summary) {
        const popup = document.createElement('div');
        popup.className = 'prestige-popup';
        popup.innerHTML = `
            <div class="prestige-popup-content">
                <h2 class="text-2xl font-bold mb-4" style="color: var(--accent-green)">系统重构完成！</h2>
                <div class="prestige-summary">
                    <p>编译器点数: +${formatNumber(summary.gain)}</p>
                    <p>威望等级: ${summary.newLevel}</p>
                    <p>总重构次数: ${summary.totalResets}</p>
                    <p>本次运行时间: ${formatTime(summary.runTime)}</p>
                </div>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">
                    继续游戏
                </button>
            </div>
        `;
        document.body.appendChild(popup);
    }

    /**
     * 更新版本显示
     * @param {string} version - 版本号
     */
    updateVersionDisplay(version) {
        const display = document.getElementById('version-display');
        if (display) {
            display.textContent = `${version} - Modular Architecture`;
        }
    }
}
