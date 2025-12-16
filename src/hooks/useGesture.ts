import { useRef, useEffect, useCallback } from 'react';
import type { GestureOptions } from '@/types';

/**
 * 触摸手势 Hook
 * 支持双指缩放和滑动切换
 *
 * @param options - 手势配置选项
 * @returns ref - 需要绑定到目标元素的 ref
 *
 * @example
 * ```tsx
 * const gestureRef = useGesture({
 *   onPinch: (scale) => console.log('缩放:', scale),
 *   onSwipe: (direction) => console.log('滑动:', direction),
 * });
 *
 * return <div ref={gestureRef}>...</div>;
 * ```
 */
export function useGesture<T extends HTMLElement = HTMLDivElement>(
  options: GestureOptions
) {
  const { onPinch, onSwipe } = options;
  const ref = useRef<T>(null);

  // 双指缩放相关状态
  const initialDistance = useRef<number>(0);
  const lastScale = useRef<number>(1);

  // 滑动相关状态
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  // 计算两点之间的距离
  const getDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }, []);

  // 触摸开始
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      // 双指缩放开始
      if (e.touches.length === 2 && onPinch) {
        initialDistance.current = getDistance(e.touches);
        lastScale.current = 1;
      }

      // 单指滑动开始
      if (e.touches.length === 1 && onSwipe) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchStartTime.current = Date.now();
      }
    },
    [getDistance, onPinch, onSwipe]
  );

  // 触摸移动
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      // 双指缩放
      if (e.touches.length === 2 && onPinch && initialDistance.current > 0) {
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance.current;

        // 只有当缩放变化超过阈值时才触发
        if (Math.abs(scale - lastScale.current) > 0.02) {
          lastScale.current = scale;
          onPinch(scale);
        }
      }
    },
    [getDistance, onPinch]
  );

  // 触摸结束
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // 重置双指缩放状态
      if (e.touches.length < 2) {
        initialDistance.current = 0;
      }

      // 检测滑动手势
      if (onSwipe && e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();

        const dx = touchEndX - touchStartX.current;
        const dy = touchEndY - touchStartY.current;
        const dt = touchEndTime - touchStartTime.current;

        // 判断是否为有效滑动：
        // 1. 水平移动距离 > 50px
        // 2. 水平移动距离 > 垂直移动距离（确保是水平滑动）
        // 3. 滑动时间 < 300ms（确保是快速滑动）
        const minSwipeDistance = 50;
        const maxSwipeTime = 300;

        if (
          Math.abs(dx) > minSwipeDistance &&
          Math.abs(dx) > Math.abs(dy) &&
          dt < maxSwipeTime
        ) {
          onSwipe(dx > 0 ? 'right' : 'left');
        }
      }
    },
    [onSwipe]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 添加事件监听器，使用 passive: false 以允许 preventDefault
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 清理函数
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return ref;
}

export default useGesture;
