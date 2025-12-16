import type { WatermarkOptions } from '@/types';

/**
 * Canvas 文字自动换行绘制
 * @param ctx - Canvas 2D 上下文
 * @param width - 最大宽度
 * @param str - 要绘制的文字
 * @param initX - 起始 X 坐标
 * @param initY - 起始 Y 坐标
 * @param lineHeight - 行高
 */
const canvasTextAutoLine = (
  ctx: CanvasRenderingContext2D,
  width: number,
  str: string,
  initX: number,
  initY: number,
  lineHeight: number = 20
): void => {
  let lineWidth = 0;
  let lastSubStrIndex = 0;

  for (let i = 0; i < str.length; i++) {
    lineWidth += ctx.measureText(str[i]).width;

    // 超出宽度，换行绘制
    if (lineWidth > width - initX) {
      ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
      initY += lineHeight;
      lineWidth = 0;
      lastSubStrIndex = i;
    }

    // 最后一行
    if (i === str.length - 1) {
      ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
    }
  }
};

/**
 * 水印绘制类
 * 负责在 Canvas 上绘制图片和平铺水印
 */
class Watermark {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private img: HTMLImageElement | null = null;
  private watermarkCanvas: HTMLCanvasElement;
  private imgWidth: number = 100;
  private imgHeight: number = 160;

  // 错误回调
  private onError: ((error: Error) => void) | null = null;
  // 尺寸变化回调
  private onResize: ((width: number, height: number) => void) | null = null;

  private userOptions: WatermarkOptions = {
    text: '仅用于办理XXXX，他用无效。',
    fontSize: 23,
    fillStyle: 'rgba(100, 100, 100, 0.4)',
    watermarkWidth: 280,
    watermarkHeight: 180,
    rotate: 20,
  };

  constructor(
    canvas: HTMLCanvasElement,
    options?: {
      onError?: (error: Error) => void;
      onResize?: (width: number, height: number) => void;
    }
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.watermarkCanvas = document.createElement('canvas');
    this.onError = options?.onError || null;
    this.onResize = options?.onResize || null;
    this.createWatermarkCanvas();
  }

  /**
   * 创建水印图案 Canvas
   * 使用独立的小 Canvas 绘制单个水印图案，后续平铺使用
   */
  private createWatermarkCanvas(): void {
    const { userOptions, watermarkCanvas } = this;
    const { text, fontSize, fillStyle, watermarkWidth, watermarkHeight, rotate } =
      userOptions;

    const wctx = watermarkCanvas.getContext('2d');
    if (!wctx) return;

    const { sqrt, pow, sin, tan, PI } = Math;

    // 计算旋转后所需的画布宽度
    watermarkCanvas.width = sqrt(pow(watermarkWidth, 2) + pow(watermarkHeight, 2));
    watermarkCanvas.height = watermarkHeight;

    // 设置字体
    wctx.font = `${fontSize}px 黑体`;

    // 旋转画布
    wctx.rotate((-rotate * PI) / 180);

    // 设置填充颜色
    wctx.fillStyle = fillStyle;

    // 计算旋转后的偏移量
    const Y = parseInt(String(sin((rotate * PI) / 180) * watermarkWidth), 10);
    const X = -parseInt(String(Y / tan(((90 - rotate) * PI) / 180)), 10);

    // 绘制自动换行文字
    canvasTextAutoLine(
      wctx,
      watermarkWidth,
      text,
      X + 10,
      Y + fontSize + 20,
      fontSize * 1.4
    );
  }

  /**
   * 绘制主图像
   */
  private drawImage(): void {
    const { canvas, ctx, img, imgWidth, imgHeight } = this;
    if (!ctx || !img) return;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 动态设置画布尺寸
    canvas.width = imgWidth;
    canvas.height = imgHeight;

    // 绘制图片
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

    // 触发尺寸变化回调
    if (this.onResize) {
      this.onResize(imgWidth, imgHeight);
    }
  }

  /**
   * 添加平铺水印
   */
  private addWatermark(): void {
    const { canvas, ctx, watermarkCanvas } = this;
    if (!ctx) return;

    // 创建重复图案
    const pattern = ctx.createPattern(watermarkCanvas, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  /**
   * 执行完整绘制流程
   */
  private _draw(): void {
    this.drawImage();
    this.addWatermark();
  }

  /**
   * 加载图片并绘制
   * @param dataURL - 图片的 Base64 DataURL 或 URL
   * @returns Promise - 绘制完成的 Promise
   */
  draw(dataURL: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.img = new Image();

      // 设置跨域属性
      this.img.setAttribute('crossOrigin', 'anonymous');

      // 图片加载成功
      this.img.onload = () => {
        if (!this.img) return;

        // 获取原始尺寸
        const originalWidth = this.img.width;
        const originalHeight = this.img.height;

        // 计算显示尺寸（限制最大宽度）
        const maxWidth = Math.min(window.innerWidth - 100, 1200);

        if (originalWidth > maxWidth) {
          this.imgWidth = maxWidth;
          this.imgHeight = (maxWidth * originalHeight) / originalWidth;
        } else {
          this.imgWidth = originalWidth;
          this.imgHeight = originalHeight;
        }

        this._draw();
        resolve();
      };

      // 图片加载失败
      this.img.onerror = (error) => {
        const err = new Error('图片加载失败，请检查图片格式是否正确');
        console.error('Watermark: 图片加载错误', error);

        // 触发错误回调
        if (this.onError) {
          this.onError(err);
        }

        reject(err);
      };

      // 开始加载图片
      this.img.src = dataURL;
    });
  }

  /**
   * 更新水印选项
   * @param options - 新的水印选项
   */
  setOptions = (options: WatermarkOptions): void => {
    this.userOptions = options;
    this.createWatermarkCanvas();

    // 如果已有图片，重新绘制
    if (this.img && this.img.complete) {
      this._draw();
    }
  };

  /**
   * 获取当前图片尺寸
   */
  getSize(): { width: number; height: number } {
    return {
      width: this.imgWidth,
      height: this.imgHeight,
    };
  }

  /**
   * 导出为 Blob
   * @param type - 图片类型
   * @param quality - 图片质量 (0-1)
   */
  toBlob(type: string = 'image/png', quality: number = 1): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('导出图片失败'));
          }
        },
        type,
        quality
      );
    });
  }

  /**
   * 销毁实例，清理资源
   */
  destroy(): void {
    this.img = null;
    this.onError = null;
    this.onResize = null;
  }
}

export default Watermark;
