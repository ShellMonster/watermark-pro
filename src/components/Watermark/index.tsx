import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import Watermark from './Watermark';
import type { WatermarkOptions } from '@/types';

interface WatermarkProps {
  /** 图片 URL 或 Base64 */
  url: string;
  /** 水印配置选项 */
  options: WatermarkOptions;
  /** 尺寸变化回调 */
  onResize?: (width: number, height: number) => void;
  /** 绘制完成回调 */
  onDrawComplete?: () => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

/**
 * 水印 Canvas 组件
 * 在 Canvas 上绘制图片并添加平铺水印
 */
const ReactWatermark: React.FC<WatermarkProps> = ({
  url,
  options,
  onResize,
  onDrawComplete,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const watermarkRef = useRef<Watermark | null>(null);
  const isInitializedRef = useRef(false);
  const isDrawingRef = useRef(false);
  const currentUrlRef = useRef<string>('');

  // 用 ref 存储回调，避免依赖变化导致重新初始化
  const callbacksRef = useRef({ onResize, onDrawComplete, onError });
  callbacksRef.current = { onResize, onDrawComplete, onError };

  // Canvas 尺寸状态（动态调整）
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // 初始化 Watermark 实例（只执行一次）
  useEffect(() => {
    if (!canvasRef.current || isInitializedRef.current) return;

    isInitializedRef.current = true;

    // 创建 Watermark 实例
    watermarkRef.current = new Watermark(canvasRef.current, {
      onError: (error) => {
        message.error(error.message);
        callbacksRef.current.onError?.(error);
      },
      onResize: (width, height) => {
        setDimensions({ width, height });
        callbacksRef.current.onResize?.(width, height);
      },
    });

    // 清理函数
    return () => {
      watermarkRef.current?.destroy();
      watermarkRef.current = null;
      isInitializedRef.current = false;
    };
  }, []); // 空依赖数组，确保只初始化一次

  // URL 变化时重新绘制
  useEffect(() => {
    if (!url) return;

    // 相同 URL 不重复绘制
    if (currentUrlRef.current === url) return;
    currentUrlRef.current = url;

    const performDraw = () => {
      if (!watermarkRef.current) {
        // 实例还没准备好，稍后重试
        requestAnimationFrame(performDraw);
        return;
      }

      isDrawingRef.current = true;

      watermarkRef.current
        .draw(url)
        .then(() => {
          isDrawingRef.current = false;
          callbacksRef.current.onDrawComplete?.();
        })
        .catch((error) => {
          isDrawingRef.current = false;
          console.error('绘制失败:', error);
        });
    };

    performDraw();
  }, [url]);

  // Options 变化时更新水印（防抖处理已在父组件完成）
  useEffect(() => {
    if (!watermarkRef.current || isDrawingRef.current) return;

    watermarkRef.current.setOptions(options);
  }, [options]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
};

export default ReactWatermark;
