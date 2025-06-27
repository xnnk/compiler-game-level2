// src/ui/devTools.js
// 开发者工具模块

/**
 * 初始化开发者工具
 * @param {Object} gameInstance - 游戏实例
 */
export function initializeDevTools(gameInstance) {
    let devModeActive = false;

    // 监听键盘事件
    document.addEventListener('keydown', (event) => {
        // Ctrl + Shift + D 激活开发者模式
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            devModeActive = !devModeActive;
            gameInstance.state.toggleDevMode();
            
            if (devModeActive) {
                showDevModeNotification('开发者模式已激活！使用数字键 1-9 快速获取资源');
                console.log('🛠️ 开发者模式快捷键:');
                console.log('🛠️ 1: +1000 Tokens');
                console.log('🛠️ 2: +100 AST Nodes');
                console.log('🛠️ 3: +50 Generated Code');
                console.log('🛠️ 4: +25 Optimized Code');
                console.log('🛠️ 5: +10 Compiler Points');
                console.log('🛠️ 6: 升级所有升级项 10 级');
                console.log('🛠️ 7: 解锁第三阶段');
                console.log('🛠️ 8: 模拟 1 小时游戏时间');
                console.log('🛠️ 9: 重置游戏状态');
                console.log('🛠️ 0: 触发威望重置');
            } else {
                showDevModeNotification('开发者模式已关闭');
            }
        }

        // 开发者模式下的快捷键
        if (devModeActive && gameInstance.state.devMode) {
            handleDevModeShortcuts(event, gameInstance);
        }
    });

    console.log('开发者工具已初始化');
}

/**
 * 处理开发者模式快捷键
 * @param {KeyboardEvent} event - 键盘事件
 * @param {Object} gameInstance - 游戏实例
 */
function handleDevModeShortcuts(event, gameInstance) {
    // 防止在输入框中触发
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }

    const key = event.key;
    const state = gameInstance.state;

    switch (key) {
        case '1':
            state.resources.tokens = state.resources.tokens.add(1000);
            showDevModeNotification('+1000 Tokens');
            break;

        case '2':
            state.resources.astNodes = state.resources.astNodes.add(100);
            showDevModeNotification('+100 AST Nodes');
            break;

        case '3':
            if (state.stage3.unlocked) {
                state.resources.generatedCode = state.resources.generatedCode.add(50);
                showDevModeNotification('+50 Generated Code');
            } else {
                showDevModeNotification('第三阶段未解锁');
            }
            break;

        case '4':
            if (state.stage3.unlocked) {
                state.resources.optimizedCode = state.resources.optimizedCode.add(25);
                showDevModeNotification('+25 Optimized Code');
            } else {
                showDevModeNotification('第三阶段未解锁');
            }
            break;

        case '5':
            state.resources.compilerPoints = state.resources.compilerPoints.add(10);
            showDevModeNotification('+10 Compiler Points');
            break;

        case '6':
            upgradeAllItems(state);
            showDevModeNotification('所有升级项 +10 级');
            break;

        case '7':
            state.stage3.unlocked = true;
            state.resources.astNodes = state.resources.astNodes.add(1000);
            showDevModeNotification('第三阶段已解锁');
            break;

        case '8':
            simulateGameTime(gameInstance, 3600); // 1小时
            showDevModeNotification('模拟了 1 小时游戏时间');
            break;

        case '9':
            if (confirm('确定要重置游戏状态吗？此操作不可恢复！')) {
                state.reset();
                showDevModeNotification('游戏状态已重置');
            }
            break;

        case '0':
            if (state.calculatePrestigeGain().gt(0)) {
                const gain = state.calculatePrestigeGain();
                state.doPrestige();
                showDevModeNotification(`威望重置完成，获得 ${gain.toString()} 编译器点数`);
            } else {
                showDevModeNotification('不满足威望重置条件');
            }
            break;

        default:
            return; // 不处理其他按键
    }

    event.preventDefault();
}

/**
 * 升级所有升级项
 * @param {Object} gameState - 游戏状态
 */
function upgradeAllItems(gameState) {
    // 动态导入常量
    import('../utils/constants.js').then(({ UPGRADE_DATA }) => {
        Object.keys(UPGRADE_DATA).forEach(key => {
            gameState.upgrades[key] = (gameState.upgrades[key] || 0) + 10;
        });
    });
}

/**
 * 模拟游戏时间
 * @param {Object} gameInstance - 游戏实例
 * @param {number} seconds - 模拟的秒数
 */
function simulateGameTime(gameInstance, seconds) {
    const production = gameInstance.state.calculateProduction();
    
    // 应用生产
    Object.keys(production).forEach(resource => {
        if (production[resource].gt(0)) {
            gameInstance.state.resources[resource] = gameInstance.state.resources[resource]
                .add(production[resource].mul(seconds));
        }
    });

    // 更新统计
    gameInstance.state.updateStats(seconds);
}

/**
 * 显示开发者模式通知
 * @param {string} message - 通知消息
 */
function showDevModeNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-600 text-black px-4 py-2 rounded shadow-lg z-50';
    notification.style.zIndex = '9999';
    notification.textContent = `🛠️ ${message}`;

    // 添加到页面
    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);

    // 控制台日志
    console.log(`🛠️ DevMode: ${message}`);
}

/**
 * 导出游戏状态到控制台
 * @param {Object} gameState - 游戏状态
 */
export function exportGameStateToConsole(gameState) {
    console.group('🎮 游戏状态导出');
    console.log('资源:', gameState.resources);
    console.log('升级:', gameState.upgrades);
    console.log('威望:', gameState.prestige);
    console.log('第三阶段:', gameState.stage3);
    console.log('统计:', gameState.stats);
    console.groupEnd();
}

/**
 * 设置资源数量（开发者专用）
 * @param {Object} gameState - 游戏状态
 * @param {string} resource - 资源名称
 * @param {number|string} amount - 数量
 */
export function setResource(gameState, resource, amount) {
    if (gameState.resources.hasOwnProperty(resource)) {
        gameState.resources[resource] = new Decimal(amount);
        showDevModeNotification(`${resource} 设置为 ${amount}`);
    } else {
        showDevModeNotification(`未知资源: ${resource}`);
    }
}

/**
 * 将开发者工具方法暴露到全局（仅在开发模式下）
 * @param {Object} gameInstance - 游戏实例
 */
export function exposeDevToolsGlobally(gameInstance) {
    if (gameInstance.state.devMode) {
        window.devTools = {
            exportState: () => exportGameStateToConsole(gameInstance.state),
            setResource: (resource, amount) => setResource(gameInstance.state, resource, amount),
            upgradeAll: () => upgradeAllItems(gameInstance.state),
            simulateTime: (seconds) => simulateGameTime(gameInstance, seconds),
            unlock3rdStage: () => {
                gameInstance.state.stage3.unlocked = true;
                gameInstance.state.resources.astNodes = gameInstance.state.resources.astNodes.add(1000);
            }
        };
        
        console.log('🛠️ 开发者工具已暴露到 window.devTools');
        console.log('🛠️ 可用方法: exportState(), setResource(name, amount), upgradeAll(), simulateTime(seconds), unlock3rdStage()');
    }
}
