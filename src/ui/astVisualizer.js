// src/ui/astVisualizer.js
// AST可视化组件 - 使用D3.js绘制抽象语法树

/**
 * AST可视化器类
 */
export class ASTVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.width = 400;
        this.height = 300;
        this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
        
        this.init();
    }

    /**
     * 初始化可视化容器
     */
    init() {
        if (!this.container) {
            console.warn(`AST可视化容器未找到: ${this.containerId}`);
            return;
        }

        // 清空容器
        this.container.innerHTML = '';

        // 创建SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('background', '#1a1a2e')
            .style('border', '1px solid #30363d')
            .style('border-radius', '6px');

        // 添加背景网格
        this.addGrid();

        // 初始显示占位符
        this.showPlaceholder();
    }

    /**
     * 添加背景网格
     */
    addGrid() {
        const defs = this.svg.append('defs');
        const pattern = defs.append('pattern')
            .attr('id', 'grid')
            .attr('width', 20)
            .attr('height', 20)
            .attr('patternUnits', 'userSpaceOnUse');

        pattern.append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', 'none')
            .attr('stroke', '#30363d')
            .attr('stroke-width', 0.5);

        this.svg.append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'url(#grid)')
            .attr('opacity', 0.3);
    }

    /**
     * 显示占位符
     */
    showPlaceholder() {
        const g = this.svg.append('g')
            .attr('class', 'placeholder');

        g.append('text')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2 - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#8b949e')
            .attr('font-size', '14px')
            .text('AST 可视化');

        g.append('text')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2 + 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#8b949e')
            .attr('font-size', '12px')
            .text('需要更多 AST 节点');
    }

    /**
     * 根据游戏状态更新AST可视化
     * @param {Object} gameState - 游戏状态
     */
    updateVisualization(gameState) {
        if (!this.svg) return;

        const astNodeCount = gameState.resources.astNodes.toNumber();
        
        if (astNodeCount < 10) {
            this.showPlaceholder();
            return;
        }

        // 移除占位符
        this.svg.select('.placeholder').remove();

        // 生成AST数据
        const astData = this.generateASTData(astNodeCount);
        
        // 绘制AST
        this.drawAST(astData);
    }

    /**
     * 生成AST数据结构
     * @param {number} nodeCount - 节点数量
     * @returns {Object} AST数据
     */
    generateASTData(nodeCount) {
        // 简化的AST结构生成
        const nodeTypes = ['FunctionDecl', 'VariableDecl', 'BinaryExpr', 'CallExpr', 'Identifier', 'Literal'];
        const maxDepth = Math.min(4, Math.floor(Math.log2(nodeCount)) + 1);
        
        function createNode(depth = 0, id = 0) {
            const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
            const node = {
                id: id,
                type: type,
                name: `${type}_${id}`,
                depth: depth,
                children: []
            };

            // 递归创建子节点
            if (depth < maxDepth && Math.random() > 0.3) {
                const childCount = Math.random() > 0.5 ? 2 : 1;
                for (let i = 0; i < childCount; i++) {
                    id++;
                    const child = createNode(depth + 1, id);
                    node.children.push(child);
                    id = Math.max(id, child.id || id);
                }
            }

            return node;
        }

        return createNode();
    }

    /**
     * 绘制AST
     * @param {Object} astData - AST数据
     */
    drawAST(astData) {
        // 清除之前的绘制
        this.svg.selectAll('.ast-node').remove();
        this.svg.selectAll('.ast-link').remove();

        // 创建树布局
        const treeLayout = d3.tree()
            .size([this.width - this.margin.left - this.margin.right, 
                   this.height - this.margin.top - this.margin.bottom]);

        // 转换数据
        const root = d3.hierarchy(astData);
        const treeData = treeLayout(root);

        // 创建主组
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // 绘制连接线
        g.selectAll('.ast-link')
            .data(treeData.links())
            .enter()
            .append('path')
            .attr('class', 'ast-link')
            .attr('d', d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y))
            .attr('fill', 'none')
            .attr('stroke', '#39c5fe')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.7);

        // 绘制节点
        const nodes = g.selectAll('.ast-node')
            .data(treeData.descendants())
            .enter()
            .append('g')
            .attr('class', 'ast-node')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        // 节点圆圈
        nodes.append('circle')
            .attr('r', 8)
            .attr('fill', d => this.getNodeColor(d.data.type))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => this.showNodeTooltip(event, d))
            .on('mouseout', () => this.hideNodeTooltip());

        // 节点标签
        nodes.append('text')
            .attr('dy', 25)
            .attr('text-anchor', 'middle')
            .attr('fill', '#c9d1d9')
            .attr('font-size', '10px')
            .text(d => d.data.type.slice(0, 8));

        // 添加动画效果
        nodes.selectAll('circle')
            .style('opacity', 0)
            .transition()
            .duration(500)
            .delay((d, i) => i * 50)
            .style('opacity', 1);
    }

    /**
     * 获取节点颜色
     * @param {string} nodeType - 节点类型
     * @returns {string} 颜色值
     */
    getNodeColor(nodeType) {
        const colorMap = {
            'FunctionDecl': '#23d18b',
            'VariableDecl': '#39c5fe',
            'BinaryExpr': '#f778ba',
            'CallExpr': '#ffd700',
            'Identifier': '#bd93f9',
            'Literal': '#50fa7b'
        };
        return colorMap[nodeType] || '#8b949e';
    }

    /**
     * 显示节点提示框
     * @param {Event} event - 鼠标事件
     * @param {Object} nodeData - 节点数据
     */
    showNodeTooltip(event, nodeData) {
        // 移除现有提示框
        d3.select('body').select('.ast-tooltip').remove();

        // 创建提示框
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'ast-tooltip')
            .style('position', 'absolute')
            .style('background', '#161b22')
            .style('border', '1px solid #30363d')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('color', '#c9d1d9')
            .style('pointer-events', 'none')
            .style('z-index', '1000');

        tooltip.html(`
            <strong>${nodeData.data.type}</strong><br>
            ID: ${nodeData.data.id}<br>
            深度: ${nodeData.data.depth}<br>
            子节点: ${nodeData.children ? nodeData.children.length : 0}
        `);

        // 定位提示框
        const [x, y] = d3.pointer(event, document.body);
        tooltip
            .style('left', (x + 10) + 'px')
            .style('top', (y - 10) + 'px');
    }

    /**
     * 隐藏节点提示框
     */
    hideNodeTooltip() {
        d3.select('body').select('.ast-tooltip').remove();
    }

    /**
     * 重置可视化
     */
    reset() {
        if (this.svg) {
            this.svg.selectAll('.ast-node').remove();
            this.svg.selectAll('.ast-link').remove();
            this.showPlaceholder();
        }
    }

    /**
     * 调整大小
     * @param {number} width - 新宽度
     * @param {number} height - 新高度
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        
        if (this.svg) {
            this.svg
                .attr('width', width)
                .attr('height', height);
        }
    }
}
