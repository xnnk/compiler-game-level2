// src/utils/formatters.js
// 数值和时间格式化工具函数

/**
 * 格式化大数字显示
 * @param {Decimal} num - 要格式化的数字
 * @returns {string} 格式化后的字符串
 */
export function formatNumber(num) {
    if (!num || typeof num.toString !== 'function') return '0';
    
    const value = new Decimal(num);
    
    if (value.lt(1000)) {
        return value.toFixed(1);
    } else if (value.lt(1000000)) {
        return (value.div(1000)).toFixed(1) + 'K';
    } else if (value.lt(1000000000)) {
        return (value.div(1000000)).toFixed(1) + 'M';
    } else if (value.lt(1000000000000)) {
        return (value.div(1000000000)).toFixed(1) + 'B';
    } else if (value.lt(1000000000000000)) {
        return (value.div(1000000000000)).toFixed(1) + 'T';
    } else {
        return value.toExponential(2);
    }
}

/**
 * 格式化时间显示
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

/**
 * 格式化百分比显示
 * @param {number} value - 数值 (0-1)
 * @returns {string} 百分比字符串
 */
export function formatPercentage(value) {
    return (value * 100).toFixed(1) + '%';
}

/**
 * 格式化资源显示，带单位
 * @param {Decimal} amount - 资源数量
 * @param {string} unit - 单位名称
 * @returns {string} 格式化后的资源字符串
 */
export function formatResource(amount, unit = '') {
    const formatted = formatNumber(amount);
    return unit ? `${formatted} ${unit}` : formatted;
}
