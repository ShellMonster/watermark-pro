import type { GetBase64Options } from '@/types';

/**
 * 将文件转换为 Base64 DataURL
 * 支持超时控制和文件大小限制
 *
 * @param file - 要转换的文件对象
 * @param options - 配置选项
 * @returns Promise<string> - Base64 编码的 DataURL
 * @throws Error - 超时或文件过大时抛出错误
 *
 * @example
 * ```typescript
 * try {
 *   const base64 = await getBase64(file, { timeout: 10000, maxSize: 5 * 1024 * 1024 });
 *   console.log(base64);
 * } catch (error) {
 *   console.error('文件读取失败:', error.message);
 * }
 * ```
 */
export function getBase64(
  file: File | Blob,
  options: GetBase64Options = {}
): Promise<string> {
  const {
    timeout = 30000, // 默认 30 秒超时
    maxSize = 10 * 1024 * 1024, // 默认最大 10MB
    onProgress,
  } = options;

  return new Promise((resolve, reject) => {
    // 文件大小校验
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
      reject(new Error(`文件大小超过限制 (最大 ${maxSizeMB}MB)`));
      return;
    }

    const reader = new FileReader();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // 设置超时处理
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        reader.abort();
        reject(new Error('读取文件超时，请尝试使用较小的图片'));
      }, timeout);
    }

    // 清理函数
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    // 读取成功
    reader.onload = () => {
      cleanup();
      resolve(reader.result as string);
    };

    // 读取失败
    reader.onerror = () => {
      cleanup();
      reject(new Error('文件读取失败，请检查文件是否损坏'));
    };

    // 读取进度
    if (onProgress) {
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    // 开始读取
    reader.readAsDataURL(file);
  });
}

/**
 * 生成唯一 ID
 * 用于文件列表的 uid
 */
export function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 检测是否支持触摸
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 防抖函数
 * @param fn - 要防抖的函数
 * @param delay - 延迟时间 (ms)
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn - 要节流的函数
 * @param limit - 时间间隔 (ms)
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= limit) {
      lastTime = now;
      fn(...args);
    }
  };
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
