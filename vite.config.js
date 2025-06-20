import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  
  // 构建配置
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    
    // 代码分割配置
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html')
      },
      output: {
        manualChunks: {
          // 将大型库单独打包
          'vendor-ml': ['@tensorflow/tfjs', 'decimal.js'],
          'vendor-viz': ['chart.js', 'd3'],
          'vendor-storage': ['dexie']
        },
        // 文件命名策略
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // 路径别名配置
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@core': resolve(process.cwd(), 'src/core'),
      '@level1': resolve(process.cwd(), 'src/level1'),
      '@level2': resolve(process.cwd(), 'src/level2'),
      '@ui': resolve(process.cwd(), 'src/ui'),
      '@utils': resolve(process.cwd(), 'src/utils'),
      '@config': resolve(process.cwd(), 'src/config'),
      '@storage': resolve(process.cwd(), 'src/storage'),
      '@workers': resolve(process.cwd(), 'src/workers'),
      '@styles': resolve(process.cwd(), 'src/styles')
    }
  },
  
  // 依赖预构建优化
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs',
      'decimal.js',
      'chart.js',
      'd3',
      'dexie'
    ]
  },
  
  // 环境变量配置
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.1.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
