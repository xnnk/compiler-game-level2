// src/modules/codeGenerator.js
// 代码生成器模块

/*
    是什么: 代码生成器类，负责将AST节点转换为可执行代码。
    为什么: 实现编译器的第三个核心阶段，从抽象语法树生成目标代码。
    如何关联: 对应《第三阶段实现方案》中的CodeGenerator架构设计。
*/
export class CodeGenerator {
    constructor() {
        this.templates = {
            'basic': {
                name: '基础代码生成',
                efficiency: 0.1,
                description: '简单的代码生成模板'
            },
            'llvm': {
                name: 'LLVM后端',
                efficiency: 0.15,
                description: '使用LLVM工具链的高效代码生成',
                unlockThreshold: new Decimal(5000)
            },
            'jit': {
                name: 'JIT编译器',
                efficiency: 0.2,
                description: '实时编译技术，效率最高',
                unlockThreshold: new Decimal(50000)
            }
        };
        
        this.currentTemplate = 'basic';
        this.optimizationLevel = 0;
        this.generationStats = {
            totalGenerated: new Decimal(0),
            sessionsCount: 0,
            averageEfficiency: 0
        };
    }
    
    /**
     * 从AST节点生成代码
     * @param {Decimal} astNodes - AST节点数量
     * @returns {Decimal} 生成的代码数量
     */
    generateCode(astNodes) {
        if (!astNodes || astNodes.lte(0)) {
            return new Decimal(0);
        }

        const template = this.templates[this.currentTemplate];
        if (!template) {
            console.error('无效的代码生成模板:', this.currentTemplate);
            return new Decimal(0);
        }

        // 基础生成量
        const baseGeneration = astNodes.mul(template.efficiency);
        
        // 优化加成
        const optimizationBonus = new Decimal(1).add(this.optimizationLevel * 0.1);
        
        // 经验加成（基于已生成的总代码量）
        const experienceBonus = new Decimal(1).add(
            this.generationStats.totalGenerated.div(10000).mul(0.05)
        );
        
        const finalGeneration = baseGeneration
            .mul(optimizationBonus)
            .mul(experienceBonus);

        // 更新统计信息
        this.generationStats.totalGenerated = this.generationStats.totalGenerated.add(finalGeneration);
        this.generationStats.sessionsCount++;
        this.updateAverageEfficiency();

        return finalGeneration;
    }
    
    /**
     * 升级代码生成模板
     * @param {string} newTemplate - 新模板名称
     * @returns {boolean} 是否成功升级
     */
    upgradeTemplate(newTemplate) {
        if (this.templates[newTemplate]) {
            const template = this.templates[newTemplate];
            
            // 检查解锁条件
            if (template.unlockThreshold && 
                this.generationStats.totalGenerated.lt(template.unlockThreshold)) {
                return false;
            }
            
            this.currentTemplate = newTemplate;
            console.log(`代码生成器已升级为: ${template.name}`);
            return true;
        }
        return false;
    }
    
    /**
     * 设置优化等级
     * @param {number} level - 优化等级
     */
    setOptimizationLevel(level) {
        this.optimizationLevel = Math.max(0, level);
    }
    
    /**
     * 获取当前模板信息
     * @returns {Object} 模板信息
     */
    getCurrentTemplateInfo() {
        return {
            ...this.templates[this.currentTemplate],
            name: this.currentTemplate,
            optimizationLevel: this.optimizationLevel
        };
    }
    
    /**
     * 获取所有可用模板
     * @returns {Array} 模板列表
     */
    getAvailableTemplates() {
        return Object.keys(this.templates).map(key => ({
            id: key,
            ...this.templates[key],
            isUnlocked: !this.templates[key].unlockThreshold || 
                       this.generationStats.totalGenerated.gte(this.templates[key].unlockThreshold),
            isCurrent: key === this.currentTemplate
        }));
    }
    
    /**
     * 更新平均效率统计
     * @private
     */
    updateAverageEfficiency() {
        if (this.generationStats.sessionsCount > 0) {
            const currentTemplate = this.templates[this.currentTemplate];
            const baseEfficiency = currentTemplate.efficiency;
            const optimizationBonus = this.optimizationLevel * 0.1;
            
            this.generationStats.averageEfficiency = 
                (this.generationStats.averageEfficiency * (this.generationStats.sessionsCount - 1) + 
                 (baseEfficiency + optimizationBonus)) / this.generationStats.sessionsCount;
        }
    }
    
    /**
     * 获取生成统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            ...this.generationStats,
            currentTemplate: this.currentTemplate,
            optimizationLevel: this.optimizationLevel,
            currentEfficiency: this.templates[this.currentTemplate].efficiency + (this.optimizationLevel * 0.1)
        };
    }
    
    /**
     * 重置统计信息（用于威望重置）
     */
    resetStats() {
        this.generationStats = {
            totalGenerated: new Decimal(0),
            sessionsCount: 0,
            averageEfficiency: 0
        };
        this.currentTemplate = 'basic';
        this.optimizationLevel = 0;
    }
    
    /**
     * 预测生成效率
     * @param {Decimal} astNodes - AST节点数量
     * @param {string} templateId - 模板ID（可选）
     * @param {number} optLevel - 优化等级（可选）
     * @returns {Object} 预测结果
     */
    predictGeneration(astNodes, templateId = null, optLevel = null) {
        const template = this.templates[templateId || this.currentTemplate];
        const optimization = optLevel !== null ? optLevel : this.optimizationLevel;
        
        const baseGeneration = astNodes.mul(template.efficiency);
        const optimizationBonus = new Decimal(1).add(optimization * 0.1);
        const experienceBonus = new Decimal(1).add(
            this.generationStats.totalGenerated.div(10000).mul(0.05)
        );
        
        return {
            baseGeneration,
            optimizationBonus,
            experienceBonus,
            finalGeneration: baseGeneration.mul(optimizationBonus).mul(experienceBonus)
        };
    }
}
