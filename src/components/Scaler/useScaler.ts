import { useEffect, useState, useCallback } from 'react';
import type { ScalerAction } from '@/types';

/**
 * 缩放控制 Hook
 * 支持键盘快捷键和鼠标滚轮缩放
 *
 * @param initial - 初始缩放比例 (百分比)
 * @returns [scale, actions] - 当前缩放值和操作方法
 *
 * @example
 * ```tsx
 * const [scale, { onZoomUp, onZoomDown, onReset, onWheel }] = useScaler(60);
 * ```
 */
export default function useScaler(initial: number): [number, ScalerAction] {
  const [scale, setScale] = useState(initial);

  // 放大
  const onZoomUp = useCallback(() => {
    setScale((prev) => Math.min(prev + 10, 200)); // 最大 200%
  }, []);

  // 缩小
  const onZoomDown = useCallback(() => {
    setScale((prev) => Math.max(prev - 10, 10)); // 最小 10%
  }, []);

  // 重置
  const onReset = useCallback(() => {
    setScale(initial);
  }, [initial]);

  // 滚轮缩放
  const onWheel = useCallback((event: WheelEvent | React.WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;

    // 阻止浏览器默认缩放
    event.preventDefault();

    if (event.deltaY > 0) {
      // 向下滚动，缩小
      setScale((prev) => Math.max(prev - 5, 10));
    } else {
      // 向上滚动，放大
      setScale((prev) => Math.min(prev + 5, 200));
    }
  }, []);

  useEffect(() => {
    // 阻止浏览器默认缩放快捷键
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        // + 和 - 键的各种键码
        [61, 107, 173, 109, 187, 189].includes(event.which)
      ) {
        event.preventDefault();
      }
    };

    // 阻止浏览器默认滚轮缩放 (Chrome, Edge, Safari)
    const handleMouseWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
      }
    };

    // 阻止浏览器默认滚轮缩放 (Firefox)
    const handleDOMMouseScroll = (event: Event) => {
      if ((event as any).ctrlKey || (event as any).metaKey) {
        event.preventDefault();
      }
    };

    // 添加事件监听器
    window.document.addEventListener('keydown', handleKeyDown, false);
    window.addEventListener('wheel', handleMouseWheel, { passive: false });
    window.addEventListener('DOMMouseScroll', handleDOMMouseScroll, {
      passive: false,
    });

    // 清理函数 - 移除事件监听器，防止内存泄漏
    return () => {
      window.document.removeEventListener('keydown', handleKeyDown, false);
      window.removeEventListener('wheel', handleMouseWheel);
      window.removeEventListener('DOMMouseScroll', handleDOMMouseScroll);
    };
  }, []);

  return [scale, { onZoomUp, onZoomDown, onReset, onWheel }];
}

// 同时导出类型
export type { ScalerAction };
