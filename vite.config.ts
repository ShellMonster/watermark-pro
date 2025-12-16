import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.svg', 'icons/*.png'],
      manifest: {
        name: 'WaterMark Pro',
        short_name: 'WaterMark',
        description: '纯前端图片水印工具，无需上传，保护您的个人信息安全',
        theme_color: '#6366F1',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['utilities', 'productivity'],
        lang: 'zh-CN',
      },
      workbox: {
        // 缓存策略
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'jsdelivr-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React 核心库
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react')) {
              return 'react';
            }
            // Ant Design 图标单独打包（体积较大）
            if (id.includes('@ant-design/icons')) {
              return 'antd-icons';
            }
            // Ant Design 核心拆分
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd';
            }
            // 工具库
            if (id.includes('jszip')) {
              return 'jszip';
            }
            if (id.includes('file-saver')) {
              return 'file-saver';
            }
            // ahooks
            if (id.includes('ahooks')) {
              return 'ahooks';
            }
          }
        },
      },
    },
    // 输出目录
    outDir: 'dist',
    // 静态资源内联阈值
    assetsInlineLimit: 4096,
    // 提高警告阈值（Ant Design 核心库约 620KB，这是框架本身的体积）
    chunkSizeWarningLimit: 650,
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
