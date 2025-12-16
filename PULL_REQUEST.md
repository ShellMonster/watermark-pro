# Pull Request: 技术栈升级与性能优化 (v2.0)

## 概述

本次 PR 对项目进行了全面的技术栈升级和性能优化，同时新增了多项实用功能，提升用户体验。

## 技术栈升级

| 项目 | 原版本 | 新版本 |
|-----|--------|--------|
| 构建工具 | Umi 3.4 | **Vite 5.0** |
| React | 17.x | **18.2** |
| Ant Design | 4.15 | **5.12** |
| ahooks | 2.10 | **3.8** |
| TypeScript | 4.1 | **5.3** |

## 性能优化

### 高优先级修复

- **修复图片上传卡死问题**
  - 添加 30 秒超时机制
  - 添加 15MB 文件大小限制
  - 完善错误处理和用户提示

- **修复内存泄漏**
  - `useScaler` Hook 添加事件监听器清理
  - 组件卸载时正确释放资源

### 中优先级优化

- **动态 Canvas 尺寸**
  - 移除固定 1024×683 尺寸
  - 根据原图自动调整画布大小

- **批量导出效率优化**
  - 移除固定 1000ms 延迟
  - 使用 `requestAnimationFrame` 等待渲染
  - 导出速度提升约 10 倍

### 低优先级优化

- **滑块操作防抖** - 减少不必要的 Canvas 重绘
- **首屏加载优化** - 代码分割、懒加载

## 新增功能

### 1. Ctrl+V 粘贴上传
支持从剪贴板直接粘贴图片，无需手动选择文件。

### 2. 拖拽上传
将图片拖拽到页面即可上传，支持批量拖入。

### 3. 移动端响应式
- 控制面板改为底部抽屉
- 适配手机端操作

### 4. 触摸手势支持
- 双指缩放画布
- 左右滑动切换图片

## 代码质量改进

- 完善 TypeScript 类型定义 (`src/types/index.ts`)
- 移除未使用的依赖 (`moveable`, `html2canvas`, `react-rnd`, `@ant-design/pro-layout`)
- 修正目录拼写错误 (`untils` → `utils`)
- 界面文本汉化

## UI/UX 优化

- 棋盘格背景颜色调整，更柔和不刺眼
- 文件名显示优化，添加半透明背景和圆角
- 配置栏宽度和字体大小调整
- 默认缩放比例调整为 85%

## 文件变更统计

```
27 files changed, 1927 insertions(+), 811 deletions(-)
```

### 新增文件
- `vite.config.ts` - Vite 配置
- `index.html` - 入口 HTML
- `src/main.tsx` - React 入口
- `src/App.tsx` - 主应用组件
- `src/types/index.ts` - TypeScript 类型定义
- `src/utils/index.ts` - 工具函数
- `src/hooks/useGesture.ts` - 触摸手势 Hook
- `postcss.config.js` - PostCSS 配置
- `tsconfig.node.json` - Node TypeScript 配置

### 删除文件
- `.umirc.ts` - Umi 配置
- `src/pages/index.tsx` - 旧页面组件
- `src/pages/index.css` - 旧样式文件
- `src/untils/index.ts` - 旧工具函数
- `typings.d.ts` - 旧类型定义

## 测试清单

- [x] 图片上传（点击选择）
- [x] 图片上传（Ctrl+V 粘贴）
- [x] 图片上传（拖拽上传）
- [x] 水印文字修改
- [x] 水印颜色修改
- [x] 水印大小/角度/间距调整
- [x] 单张图片导出
- [x] 批量 ZIP 导出
- [x] 画布缩放（滚轮/按钮）
- [x] 移动端响应式布局
- [x] 触摸手势操作

## 兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 移动端浏览器（iOS Safari、Android Chrome）
- 支持离线使用

## 截图

<!-- 可以在此添加截图展示新功能 -->

---

感谢原作者 [@Turkyden](https://github.com/Turkyden) 开源的 [watermark-pro](https://github.com/Turkyden/watermark-pro) 项目！
