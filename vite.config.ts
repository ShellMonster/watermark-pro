import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 生产环境使用 CDN
  base: process.env.NODE_ENV === 'production'
    ? 'https://cdn.jsdelivr.net/gh/turkyden/watermark-pro@gh-pages/'
    : '/',
  build: {
    // 代码分割配置
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库单独打包
          vendor: ['react', 'react-dom'],
          // Ant Design 单独打包
          antd: ['antd', '@ant-design/icons'],
          // 工具库单独打包
          utils: ['jszip', 'file-saver'],
        },
      },
    },
    // 输出目录
    outDir: 'dist',
    // 静态资源内联阈值
    assetsInlineLimit: 4096,
  },
  // 开发服务器配置
  server: {
    port: 8000,
    open: true,
  },
  // CSS 配置
  css: {
    postcss: './postcss.config.js',
  },
});
