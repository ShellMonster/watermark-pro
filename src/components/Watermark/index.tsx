import { useEffect, useRef } from 'react';
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const watermarkRef = useRef<Watermark | null>(null);
  const hasDrawnRef = useRef(false);

  // 初始化 Watermark 实例
  useEffect(() => {
    if (!canvasRef.current) return;

    watermarkRef.current = new Watermark(canvasRef.current, {
      onError: (error) => {
        message.error(error.message);
        console.error('Watermark 错误:', error);
      },
    });

    return () => {
      watermarkRef.current?.destroy();
      watermarkRef.current = null;
      hasDrawnRef.current = false;
    };
  }, []);

  // URL 变化时绘制图片
  useEffect(() => {
    if (!url || !watermarkRef.current) return;

    hasDrawnRef.current = false;

    watermarkRef.current
      .draw(url)
      .then(() => {
        hasDrawnRef.current = true;
        console.log('绘制完成:', url.substring(0, 50));
      })
      .catch((error) => {
        console.error('绘制失败:', error);
      });
  }, [url]);

  // Options 变化时更新水印（只在图片已绘制后）
  useEffect(() => {
    if (!watermarkRef.current || !hasDrawnRef.current) return;

    watermarkRef.current.setOptions(options);
  }, [options]);

  // Canvas 尺寸由 Watermark.ts 直接控制，不需要 React state
  return (
    <canvas
      ref={canvasRef}
      style={{
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
      }}
    />
  );
};

export default ReactWatermark;
