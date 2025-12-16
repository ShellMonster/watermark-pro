<p align="center">
  <a href="https://watermark-pro.turkyden.com/">
    <img width="160" src="./logo.svg">
  </a>
</p>

<h1 align="center">WaterMark Pro</h1>

<div align="center">

纯前端图片水印工具，无需上传，保护您的个人信息安全。

A pure front-end watermark tool for your sensitive certificates, no upload required, protecting your personal information.

[![GitHub stars](https://img.shields.io/github/stars/turkyden/watermark-pro)](https://github.com/turkyden/watermark-pro/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/turkyden/watermark-pro)](https://github.com/turkyden/watermark-pro/issues)
[![GitHub license](https://img.shields.io/github/license/turkyden/watermark-pro)](https://github.com/turkyden/watermark-pro/blob/master/LICENSE)

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 版本 2.0 更新

本 PR 在原版基础上进行了全面重构和优化。

#### 技术栈升级

| 项目 | 原版本 | 新版本 |
|-----|--------|--------|
| 构建工具 | Umi 3.4 | **Vite 5.0** |
| React | 17.x | **18.2** |
| Ant Design | 4.15 | **5.12** |
| ahooks | 2.10 | **3.8** |
| TypeScript | 4.1 | **5.3** |

#### 性能优化

- **修复图片上传卡死** - 添加超时机制、文件大小限制、完整错误处理
- **修复内存泄漏** - 事件监听器正确清理
- **优化首屏加载** - 代码分割、懒加载、动态导入
- **优化批量导出** - 移除固定延迟，导出速度提升约 10 倍
- **动态 Canvas 尺寸** - 根据原图自动调整，不再固定 1024×683
- **滑块操作防抖** - 减少不必要的 Canvas 重绘

#### 新增功能

- **Ctrl+V 粘贴上传** - 从剪贴板直接粘贴图片
- **拖拽上传** - 将图片拖拽到页面即可上传
- **移动端响应式** - 适配手机端操作，控制面板改为底部抽屉
- **触摸手势支持** - 双指缩放、滑动切换图片

#### 代码质量

- 完善 TypeScript 类型定义
- 移除未使用的依赖（moveable、html2canvas、react-rnd 等）
- 修正目录拼写错误（untils → utils）
- 界面文本汉化

### 功能特性

- [x] 平铺水印 Tiled Watermark
- [x] 多文件批量处理 Multi File
- [x] 批量导出 ZIP Batch Export
- [x] 画布缩放 Canvas Zoom
- [x] 移动端响应式 Mobile ✨ **新增**
- [x] Ctrl+V 粘贴上传 ✨ **新增**
- [x] 拖拽上传 ✨ **新增**
- [x] 触摸手势 ✨ **新增**
- [x] PWA 支持（可安装为桌面/手机 App）✨ **新增**
- [x] 离线使用 ✨ **新增**
- [ ] 马赛克 Mosaic

### 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 项目结构

```
src/
├── components/        # 组件
│   ├── Watermark/    # 水印核心组件
│   ├── Scaler/       # 缩放控制组件
│   ├── Control/      # 控制面板组件
│   └── HotKey/       # 快捷键提示
├── hooks/            # 自定义 Hooks
│   └── useGesture.ts # 触摸手势 Hook
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
├── sections/         # 页面区块
├── assets/           # 静态资源
├── App.tsx           # 主应用组件
└── main.tsx          # 入口文件
```

---

## English

### Version 2.0 Updates

This PR includes a comprehensive refactoring and optimization based on the original version.

#### Tech Stack Upgrade

| Item | Before | After |
|------|--------|-------|
| Build Tool | Umi 3.4 | **Vite 5.0** |
| React | 17.x | **18.2** |
| Ant Design | 4.15 | **5.12** |
| ahooks | 2.10 | **3.8** |
| TypeScript | 4.1 | **5.3** |

#### Performance Optimizations

- **Fixed image upload freezing** - Added timeout mechanism, file size limits, complete error handling
- **Fixed memory leaks** - Proper event listener cleanup
- **Optimized initial load** - Code splitting, lazy loading, dynamic imports
- **Optimized batch export** - Removed fixed delays, ~10x faster export speed
- **Dynamic Canvas sizing** - Auto-adjusts based on original image, no longer fixed at 1024×683
- **Slider debouncing** - Reduced unnecessary Canvas redraws

#### New Features

- **Ctrl+V Paste Upload** - Paste images directly from clipboard
- **Drag & Drop Upload** - Drag images onto the page to upload
- **Mobile Responsive** - Mobile-friendly layout with bottom drawer for controls
- **Touch Gestures** - Pinch to zoom, swipe to switch images

#### Code Quality

- Complete TypeScript type definitions
- Removed unused dependencies (moveable, html2canvas, react-rnd, etc.)
- Fixed directory typo (untils → utils)
- UI text localization

### Features

- [x] Tiled Watermark
- [x] Multi File Processing
- [x] Batch Export ZIP
- [x] Canvas Zoom
- [x] Mobile Responsive ✨ **New**
- [x] Ctrl+V Paste Upload ✨ **New**
- [x] Drag & Drop Upload ✨ **New**
- [x] Touch Gestures ✨ **New**
- [x] PWA Support (Installable as Desktop/Mobile App) ✨ **New**
- [x] Offline Support ✨ **New**
- [ ] Mosaic

### Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/        # Components
│   ├── Watermark/    # Watermark core component
│   ├── Scaler/       # Zoom control component
│   ├── Control/      # Control panel component
│   └── HotKey/       # Hotkey hints
├── hooks/            # Custom Hooks
│   └── useGesture.ts # Touch gesture Hook
├── types/            # TypeScript types
├── utils/            # Utility functions
├── sections/         # Page sections
├── assets/           # Static assets
├── App.tsx           # Main app component
└── main.tsx          # Entry file
```

---

## 致谢 | Credits

感谢原作者 [Turkyden](https://github.com/Turkyden) 开源的 [watermark-pro](https://github.com/Turkyden/watermark-pro)

Thanks to [Turkyden](https://github.com/Turkyden) for the original [watermark-pro](https://github.com/Turkyden/watermark-pro)

## License

[MIT](./LICENSE)
