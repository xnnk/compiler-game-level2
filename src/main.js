// src/main.js
// 游戏主入口文件

import './style.css'; // Vite 会处理这个CSS导入
import { Game } from './core/game.js';

/*
    是什么: 设置Decimal.js库的全局精度和舍入模式。
    为什么: 增量游戏中的数值会变得极大，远远超过JavaScript `Number`类型的安全范围。设置高精度可确保所有计算（特别是成本和产出）的准确性。
    如何关联: 这是实现《研究Level1.md》1.3节"指数增长"和3.2.1节"管理天文数字"的技术前提。
*/
// 确保Decimal.js的全局设置
if (typeof Decimal !== 'undefined') {
    Decimal.set({ precision: 100, rounding: 4 });
    console.log('✅ Decimal.js 已配置');
} else {
    console.error('❌ Decimal.js 未加载');
}

// 全局变量声明
let game = null;

/**
 * 初始化游戏
 */
function initializeGame() {
    try {
        console.log('🎮 开始初始化编译器模拟游戏...');
        
        // 检查必要的依赖
        if (!checkDependencies()) {
            throw new Error('缺少必要的依赖库');
        }

        // 创建游戏实例
        game = new Game();
        
        // 初始化游戏
        game.init();
        
        // 为了方便在控制台调试，将game实例暴露到全局
        window.game = game;
        
        console.log('🎮 游戏初始化完成！');
        console.log('🎮 提示：按 Ctrl + Shift + D 激活开发者模式');
        
        // 添加窗口关闭前的保存处理
        window.addEventListener('beforeunload', () => {
            if (game) {
                game.save();
            }
        });
        
    } catch (error) {
        console.error('❌ 游戏初始化失败:', error);
        showErrorMessage('游戏初始化失败，请刷新页面重试。');
    }
}

/**
 * 检查必要的依赖库
 * @returns {boolean} 是否所有依赖都已加载
 */
function checkDependencies() {
    const dependencies = [
        { name: 'Decimal.js', check: () => typeof Decimal !== 'undefined' },
        { name: 'D3.js', check: () => typeof d3 !== 'undefined' },
        { name: 'Chart.js', check: () => typeof Chart !== 'undefined' },
        { name: 'CodeMirror', check: () => typeof CodeMirror !== 'undefined' }
    ];

    let allLoaded = true;
    
    dependencies.forEach(dep => {
        if (!dep.check()) {
            console.error(`❌ ${dep.name} 未加载`);
            allLoaded = false;
        } else {
            console.log(`✅ ${dep.name} 已加载`);
        }
    });

    return allLoaded;
}

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded shadow-lg z-50';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <span class="text-2xl mr-3">⚠️</span>
            <div>
                <div class="font-bold">错误</div>
                <div>${message}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // 10秒后自动移除
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 10000);
}

/**
 * 页面加载完成后初始化游戏
 */
window.addEventListener('load', () => {
    // 添加小延迟确保所有CDN资源都已加载
    setTimeout(initializeGame, 100);
});

/**
 * 处理页面可见性变化（用于优化性能）
 */
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            // 页面隐藏时暂停游戏以节省资源
            console.log('🎮 页面隐藏，游戏暂停');
            // 注意：在实际实现中可能需要保持后台计算
        } else {
            // 页面显示时恢复游戏
            console.log('🎮 页面显示，游戏恢复');
        }
    }
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('💥 全局错误:', event.error);
    
    if (game) {
        try {
            game.save(); // 尝试保存游戏状态
        } catch (saveError) {
            console.error('💥 保存游戏状态失败:', saveError);
        }
    }
});

// 未处理的Promise rejection处理
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 未处理的Promise rejection:', event.reason);
    event.preventDefault(); // 防止错误显示在控制台
});

// 导出game实例供其他模块使用（如果需要）
export { game };
