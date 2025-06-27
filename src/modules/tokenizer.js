// src/modules/tokenizer.js
// 词法分析器模块

/*
    是什么: 一个用于将代码字符串分解为一系列"令牌"(Token)的类。
    为什么: 这是模拟编译器工作的第一步。它将原始代码文本转化为机器更容易理解的结构化数据。
    如何关联:
        - 这是《研究Level1.md》1.4.1节"阶段一 - 词法分析"和《实现Level1.md》"核心功能实现"中`Tokenizer`类的具体实现。
        - `rules`数组中的正则表达式定义了如何识别代码中的不同部分（关键字、数字、字符串等），是词法分析的核心规则。
        - 游戏的核心玩法之一就是通过这个过程产生`Tokens`资源。
*/
export class Tokenizer {
    constructor() {
        this.rules = [
            { type: 'KEYWORD', regex: /^(function|var|let|const|if|else|for|while|return|class|import|export|async|await|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|namespace|module|declare|abstract|private|public|protected|static|readonly|override)\b/ },
            { type: 'NUMBER', regex: /^[0-9]+(\.[0-9]+)?\b/ },
            { type: 'STRING', regex: /^"([^"\\]|\\.)*"|^'([^'\\]|\\.)*'|^`([^`\\]|\\.)*`/ },
            { type: 'IDENTIFIER', regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*/ },
            { type: 'OPERATOR', regex: /^(\+\+|--|&&|\|\||==|!=|<=|>=|===|!==|=>|\+|\-|\*|\/|%|&|\||!|<|>|=|\?|:)/ },
            { type: 'DELIMITER', regex: /^[(){}\[\];,.]/ },
            { type: 'WHITESPACE', regex: /^[\s\r\n\t]+/ },
            { type: 'COMMENT', regex: /^\/\/.*$|^\/\*[\s\S]*?\*\// }
        ];
    }

    /**
     * 将代码字符串分解为令牌数组
     * @param {string} code - 要分析的代码字符串
     * @returns {Array} 令牌数组
     */
    tokenize(code) {
        let tokens = [];
        let position = 0;
        let line = 1;
        let column = 1;

        while (position < code.length) {
            let matched = false;

            for (let rule of this.rules) {
                const match = code.slice(position).match(rule.regex);
                if (match) {
                    const value = match[0];
                    
                    // 跳过空白字符和注释，但不添加到令牌中
                    if (rule.type !== 'WHITESPACE' && rule.type !== 'COMMENT') {
                        tokens.push({
                            type: rule.type,
                            value: value,
                            position: position,
                            line: line,
                            column: column
                        });
                    }

                    // 更新位置信息
                    const lines = value.split('\n');
                    if (lines.length > 1) {
                        line += lines.length - 1;
                        column = lines[lines.length - 1].length + 1;
                    } else {
                        column += value.length;
                    }

                    position += value.length;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                // 未匹配的字符作为 UNKNOWN 类型
                const unknownChar = code[position];
                tokens.push({
                    type: 'UNKNOWN',
                    value: unknownChar,
                    position: position,
                    line: line,
                    column: column
                });
                position++;
                column++;
            }
        }

        return tokens;
    }

    /**
     * 获取令牌统计信息
     * @param {Array} tokens - 令牌数组
     * @returns {Object} 统计信息对象
     */
    getTokenStats(tokens) {
        const stats = {
            total: tokens.length,
            types: {}
        };

        tokens.forEach(token => {
            stats.types[token.type] = (stats.types[token.type] || 0) + 1;
        });

        return stats;
    }

    /**
     * 验证令牌序列的基本语法
     * @param {Array} tokens - 令牌数组
     * @returns {Object} 验证结果
     */
    validateTokens(tokens) {
        const errors = [];
        const warnings = [];
        
        let bracketStack = [];
        const bracketPairs = {
            '(': ')',
            '[': ']',
            '{': '}'
        };

        tokens.forEach((token, index) => {
            // 检查括号匹配
            if (token.type === 'DELIMITER' && ['(', '[', '{'].includes(token.value)) {
                bracketStack.push({
                    type: token.value,
                    index: index,
                    line: token.line,
                    column: token.column
                });
            } else if (token.type === 'DELIMITER' && [')', ']', '}'].includes(token.value)) {
                if (bracketStack.length === 0) {
                    errors.push({
                        type: 'UnmatchedClosingBracket',
                        message: `未匹配的闭合括号 '${token.value}'`,
                        line: token.line,
                        column: token.column
                    });
                } else {
                    const lastOpen = bracketStack.pop();
                    if (bracketPairs[lastOpen.type] !== token.value) {
                        errors.push({
                            type: 'MismatchedBrackets',
                            message: `括号不匹配: '${lastOpen.type}' (第${lastOpen.line}行) 与 '${token.value}' (第${token.line}行)`,
                            line: token.line,
                            column: token.column
                        });
                    }
                }
            }

            // 检查未知令牌
            if (token.type === 'UNKNOWN') {
                warnings.push({
                    type: 'UnknownToken',
                    message: `未识别的字符: '${token.value}'`,
                    line: token.line,
                    column: token.column
                });
            }
        });

        // 检查未闭合的括号
        bracketStack.forEach(bracket => {
            errors.push({
                type: 'UnclosedBracket',
                message: `未闭合的括号 '${bracket.type}'`,
                line: bracket.line,
                column: bracket.column
            });
        });

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * 计算词法分析的复杂度分数
     * @param {Array} tokens - 令牌数组
     * @returns {number} 复杂度分数
     */
    calculateComplexity(tokens) {
        const weights = {
            'KEYWORD': 2,
            'IDENTIFIER': 1,
            'NUMBER': 1,
            'STRING': 1,
            'OPERATOR': 1.5,
            'DELIMITER': 0.5,
            'UNKNOWN': 3
        };

        let complexity = 0;
        tokens.forEach(token => {
            complexity += weights[token.type] || 1;
        });

        return Math.round(complexity * 10) / 10;
    }
}
