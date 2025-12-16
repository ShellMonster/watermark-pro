# WaterMark Pro

> 基于 [Turkyden/watermark-pro](https://github.com/Turkyden/watermark-pro) 进行二次开发

纯前端图片水印工具，无需上传，保护您的个人信息安全。

## 版本 2.0 更新

本项目在原版基础上进行了全面重构和优化：

### 技术栈升级

| 项目 | 原版 | 当前版本 |
|-----|------|---------|
| 构建工具 | Umi 3.4 | **Vite 5.0** |
| React | 17.x | **18.2** |
| Ant Design | 4.15 | **5.12** |
| ahooks | 2.10 | **3.8** |
| TypeScript | 4.1 | **5.3** |
| TailwindCSS | 3.0 | **3.4** |

### 性能优化

- **修复图片上传卡死** - 添加超时机制、文件大小限制、完整错误处理
- **修复内存泄漏** - 事件监听器正确清理
- **优化首屏加载** - 代码分割、懒加载、动态导入
- **优化批量导出** - 导出速度提升 10 倍
- **动态 Canvas 尺寸** - 根据原图自动调整，不再固定 1024×683
- **滑块操作防抖** - 减少不必要的 Canvas 重绘

### 新增功能

- **Ctrl+V 粘贴上传** - 从剪贴板直接粘贴图片
- **拖拽上传** - 将图片拖拽到页面即可上传
- **移动端响应式** - 适配手机端操作
- **触摸手势支持** - 双指缩放、滑动切换图片

### 代码质量

- 完善 TypeScript 类型定义
- 移除未使用的依赖（moveable、html2canvas、react-rnd 等）
- 目录结构优化

## 功能特性

- 纯前端实现，无需后端，保护隐私安全
- 支持多图批量处理
- 自定义水印文字、颜色、大小、角度
- 支持单图导出和批量 ZIP 导出
- Canvas 画布缩放
- 支持多种图片格式（PNG、JPG、GIF）
- 可离线使用

## 快速开始

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

## 项目结构

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

## 致谢

- 感谢原作者 [Turkyden](https://github.com/Turkyden) 开源的 [watermark-pro](https://github.com/Turkyden/watermark-pro)
- 感谢所有贡献者

## License

[MIT](./LICENSE)
