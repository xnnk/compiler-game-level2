module.exports = {
  env: {
    browser: true,
    es2021: true,
    worker: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  globals: {
    // TensorFlow.js全局变量
    'tf': 'readonly',
    // 游戏全局变量
    'game': 'writable'
  }
};
