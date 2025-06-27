// src/ui/tabManager.js
// 标签页管理器 - 处理标签页切换逻辑

/**
 * 初始化标签页系统
 */
export function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    if (tabButtons.length === 0 || tabPanels.length === 0) {
        console.warn('未找到标签页元素');
        return;
    }

    // 为每个标签页按钮添加点击事件
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchToTab(tabId);
        });
    });

    console.log('标签页系统已初始化');
}

/**
 * 切换到指定标签页
 * @param {string} tabId - 标签页ID
 */
export function switchToTab(tabId) {
    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    // 更新面板显示
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${tabId}-tab` || panel.id === `${tabId}-tab-content`) {
            panel.classList.add('active');
        }
    });

    // 特殊处理第三阶段标签页
    if (tabId === 'stage3') {
        const stage3Content = document.getElementById('stage3-tab-content');
        if (stage3Content) {
            stage3Content.style.display = 'block';
            stage3Content.classList.add('active');
        }
    }

    console.log(`切换到标签页: ${tabId}`);
}

/**
 * 显示或隐藏标签页
 * @param {string} tabId - 标签页ID
 * @param {boolean} show - 是否显示
 */
export function toggleTabVisibility(tabId, show) {
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    const tabPanel = document.getElementById(`${tabId}-tab`) || document.getElementById(`${tabId}-tab-content`);

    if (tabButton) {
        tabButton.style.display = show ? 'block' : 'none';
    }

    if (tabPanel) {
        if (!show && tabPanel.classList.contains('active')) {
            // 如果当前显示的标签页被隐藏，切换到第一个可见的标签页
            const firstVisibleTab = document.querySelector('.tab-btn:not([style*="display: none"])');
            if (firstVisibleTab) {
                switchToTab(firstVisibleTab.dataset.tab);
            }
        }
    }
}

/**
 * 获取当前活跃的标签页ID
 * @returns {string|null} 当前活跃的标签页ID
 */
export function getCurrentActiveTab() {
    const activeButton = document.querySelector('.tab-btn.active');
    return activeButton ? activeButton.dataset.tab : null;
}
