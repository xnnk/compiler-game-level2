// src/ui/performanceChart.js
// 性能图表组件 - 使用Chart.js绘制性能数据

/**
 * 性能图表类
 */
export class PerformanceChart {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.chart = null;
        this.dataHistory = [];
        this.maxDataPoints = 50;
        
        this.init();
    }

    /**
     * 初始化图表
     */
    init() {
        if (!this.canvas) {
            console.warn(`性能图表画布未找到: ${this.canvasId}`);
            return;
        }

        const ctx = this.canvas.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Tokens/s',
                        data: [],
                        borderColor: '#23d18b',
                        backgroundColor: 'rgba(35, 209, 139, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'AST Nodes/s',
                        data: [],
                        borderColor: '#39c5fe',
                        backgroundColor: 'rgba(57, 197, 254, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '生成代码/s',
                        data: [],
                        borderColor: '#f778ba',
                        backgroundColor: 'rgba(247, 120, 186, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        hidden: true // 默认隐藏，第三阶段解锁后显示
                    },
                    {
                        label: '优化代码/s',
                        data: [],
                        borderColor: '#ffd700',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        hidden: true // 默认隐藏，第三阶段解锁后显示
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '资源生产速率',
                        color: '#c9d1d9',
                        font: {
                            family: 'IBM Plex Mono, monospace',
                            size: 14
                        }
                    },
                    legend: {
                        labels: {
                            color: '#c9d1d9',
                            font: {
                                family: 'IBM Plex Mono, monospace'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '时间',
                            color: '#8b949e'
                        },
                        ticks: {
                            color: '#8b949e',
                            maxTicksLimit: 8
                        },
                        grid: {
                            color: '#30363d'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '生产率',
                            color: '#8b949e'
                        },
                        ticks: {
                            color: '#8b949e',
                            callback: function(value) {
                                return formatNumberForChart(value);
                            }
                        },
                        grid: {
                            color: '#30363d'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        radius: 3,
                        hoverRadius: 6
                    }
                },
                animation: {
                    duration: 300
                }
            }
        });

        console.log('性能图表已初始化');
    }

    /**
     * 更新图表数据
     * @param {Object} gameState - 游戏状态
     */
    updateChart(gameState) {
        if (!this.chart) return;

        const production = gameState.calculateProduction();
        const currentTime = new Date().toLocaleTimeString();

        // 添加新数据点
        this.dataHistory.push({
            time: currentTime,
            tokens: production.tokens.toNumber(),
            astNodes: production.astNodes.toNumber(),
            generatedCode: production.generatedCode.toNumber(),
            optimizedCode: production.optimizedCode.toNumber()
        });

        // 限制数据点数量
        if (this.dataHistory.length > this.maxDataPoints) {
            this.dataHistory.shift();
        }

        // 更新图表数据
        this.chart.data.labels = this.dataHistory.map(point => point.time);
        this.chart.data.datasets[0].data = this.dataHistory.map(point => point.tokens);
        this.chart.data.datasets[1].data = this.dataHistory.map(point => point.astNodes);
        this.chart.data.datasets[2].data = this.dataHistory.map(point => point.generatedCode);
        this.chart.data.datasets[3].data = this.dataHistory.map(point => point.optimizedCode);

        // 根据第三阶段状态显示/隐藏相关数据集
        if (gameState.stage3.unlocked) {
            this.chart.data.datasets[2].hidden = false;
            this.chart.data.datasets[3].hidden = false;
        }

        // 更新图表
        this.chart.update('none'); // 'none' 禁用动画以提高性能
    }

    /**
     * 重置图表数据
     */
    resetChart() {
        if (!this.chart) return;

        this.dataHistory = [];
        this.chart.data.labels = [];
        this.chart.data.datasets.forEach(dataset => {
            dataset.data = [];
        });
        this.chart.update();
    }

    /**
     * 获取图表快照数据
     * @returns {Object} 快照数据
     */
    getSnapshot() {
        if (!this.dataHistory.length) return null;

        const latest = this.dataHistory[this.dataHistory.length - 1];
        const previous = this.dataHistory.length > 1 ? this.dataHistory[this.dataHistory.length - 2] : latest;

        return {
            current: latest,
            previous: previous,
            trend: {
                tokens: latest.tokens - previous.tokens,
                astNodes: latest.astNodes - previous.astNodes,
                generatedCode: latest.generatedCode - previous.generatedCode,
                optimizedCode: latest.optimizedCode - previous.optimizedCode
            },
            dataPoints: this.dataHistory.length
        };
    }

    /**
     * 设置图表主题
     * @param {string} theme - 主题名称 ('dark' | 'light')
     */
    setTheme(theme) {
        if (!this.chart) return;

        const isDark = theme === 'dark';
        const textColor = isDark ? '#c9d1d9' : '#333333';
        const gridColor = isDark ? '#30363d' : '#e0e0e0';

        // 更新图表颜色
        this.chart.options.plugins.title.color = textColor;
        this.chart.options.plugins.legend.labels.color = textColor;
        this.chart.options.scales.x.ticks.color = textColor;
        this.chart.options.scales.x.grid.color = gridColor;
        this.chart.options.scales.y.ticks.color = textColor;
        this.chart.options.scales.y.grid.color = gridColor;

        this.chart.update();
    }

    /**
     * 切换数据集可见性
     * @param {number} datasetIndex - 数据集索引
     */
    toggleDataset(datasetIndex) {
        if (!this.chart || !this.chart.data.datasets[datasetIndex]) return;

        const dataset = this.chart.data.datasets[datasetIndex];
        dataset.hidden = !dataset.hidden;
        this.chart.update();
    }

    /**
     * 导出图表数据
     * @returns {Array} 历史数据
     */
    exportData() {
        return [...this.dataHistory];
    }

    /**
     * 导入图表数据
     * @param {Array} data - 历史数据
     */
    importData(data) {
        if (!Array.isArray(data)) return;

        this.dataHistory = data.slice(-this.maxDataPoints); // 只保留最新的数据点
        
        if (this.chart) {
            this.chart.data.labels = this.dataHistory.map(point => point.time);
            this.chart.data.datasets[0].data = this.dataHistory.map(point => point.tokens);
            this.chart.data.datasets[1].data = this.dataHistory.map(point => point.astNodes);
            this.chart.data.datasets[2].data = this.dataHistory.map(point => point.generatedCode);
            this.chart.data.datasets[3].data = this.dataHistory.map(point => point.optimizedCode);
            this.chart.update();
        }
    }

    /**
     * 销毁图表
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}

/**
 * 格式化数字用于图表显示
 * @param {number} value - 数值
 * @returns {string} 格式化后的字符串
 */
function formatNumberForChart(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    } else {
        return value.toFixed(1);
    }
}
