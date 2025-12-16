/**
 * 水印配置选项
 */
export interface WatermarkOptions {
  /** 水印文字内容 */
  text: string;
  /** 字体大小 (px) */
  fontSize: number;
  /** 文字颜色 (支持 rgba) */
  fillStyle: string;
  /** 水印区块宽度 (px) */
  watermarkWidth: number;
  /** 水印区块高度 (px) */
  watermarkHeight: number;
  /** 旋转角度 (度) */
  rotate: number;
}

/**
 * 文件列表项
 */
export interface FileItem {
  /** 唯一标识 */
  uid: string;
  /** 文件名 */
  name: string;
  /** 上传状态 */
  status: 'uploading' | 'done' | 'error' | 'removed';
  /** 文件 URL */
  url?: string;
  /** 预览图 Base64 */
  preview?: string;
  /** 原始文件对象 */
  originFileObj?: File | string;
  /** 缩略图 URL */
  thumbUrl?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 应用状态
 */
export interface AppState {
  /** 水印配置选项 */
  options: WatermarkOptions;
  /** 文件列表 */
  fileList: FileItem[];
  /** 当前选中文件索引 */
  current: number;
  /** 预览图片 URL */
  previewImage: string;
  /** 当前文件名 */
  fileName: string;
}

/**
 * Reducer Action 类型
 */
export type AppAction =
  | { type: 'SET_OPTIONS'; payload: WatermarkOptions }
  | { type: 'SET_CURRENT'; payload: number }
  | { type: 'SET_FILE_LIST'; payload: FileItem[] }
  | { type: 'SET_PREVIEW'; payload: { fileName: string; previewImage: string } };

/**
 * 缩放控制 Action
 */
export interface ScalerAction {
  onZoomUp: () => void;
  onZoomDown: () => void;
  onReset: () => void;
  onWheel: (event: WheelEvent | React.WheelEvent) => void;
}

/**
 * getBase64 配置选项
 */
export interface GetBase64Options {
  /** 超时时间 (ms)，默认 30000 */
  timeout?: number;
  /** 最大文件大小 (bytes)，默认 10MB */
  maxSize?: number;
  /** 进度回调 */
  onProgress?: (percent: number) => void;
}

/**
 * 触摸手势配置
 */
export interface GestureOptions {
  /** 双指缩放回调 */
  onPinch?: (scale: number) => void;
  /** 滑动切换回调 */
  onSwipe?: (direction: 'left' | 'right') => void;
}
