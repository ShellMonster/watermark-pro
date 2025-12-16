import {
  useState,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  lazy,
  Suspense,
} from 'react';
import {
  Button,
  Upload,
  Popover,
  Slider,
  Form,
  Input,
  ColorPicker,
  Spin,
  Drawer,
  message,
} from 'antd';
import {
  ArrowDownOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useSize, useDebounceFn, useResponsive } from 'ahooks';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import confetti from 'canvas-confetti';

import { Scaler, useScaler } from '@/components/Scaler';
import Watermark from '@/components/Watermark';
import Control from '@/components/Control';
import HotKey from '@/components/HotKey';
import { useGesture } from '@/hooks/useGesture';
import { getBase64, generateUID } from '@/utils';
import type {
  WatermarkOptions,
  FileItem,
  AppState,
  AppAction,
} from '@/types';

// 静态导入示例图片
import initialImage from '@/assets/watermark.jpg';

// 懒加载 Market 组件
const Market = lazy(() => import('@/sections/Market'));

// 默认水印配置
const defaultOptions: WatermarkOptions = {
  text: '仅用于办理住房公积金，他用无效。',
  fillStyle: '#00000080',
  fontSize: 26,
  rotate: 20,
  watermarkWidth: 252,
  watermarkHeight: 180,
};

// 初始状态
const initialState: AppState = {
  options: defaultOptions,
  fileList: [],
  current: 0,
  previewImage: '',
  fileName: '未选择图片',
};

// Reducer
function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_OPTIONS':
      return { ...state, options: action.payload };
    case 'SET_CURRENT':
      return { ...state, current: action.payload };
    case 'SET_FILE_LIST':
      return { ...state, fileList: action.payload };
    case 'SET_PREVIEW':
      return {
        ...state,
        fileName: action.payload.fileName,
        previewImage: action.payload.previewImage,
      };
    default:
      return state;
  }
}

// 初始示例图片
const initialFileItem: FileItem = {
  uid: 'initial-0',
  name: '水印示例.png',
  status: 'done',
  url: initialImage,
  preview: initialImage,
  thumbUrl: initialImage,
};

export default function App() {
  const [{ options }, dispatch] = useReducer(reducer, initialState);
  const [form] = Form.useForm();

  // 缩放控制
  const [scale, scaleAction] = useScaler(85);

  // 响应式检测
  const responsive = useResponsive();
  const isMobile = !responsive?.md;

  // 屏幕高度
  const { height: screenHeight = window.innerHeight } = useSize(document.body) || {};

  // 文件列表 - 初始化时直接加载示例图片
  const [fileList, setFileList] = useState<FileItem[]>([initialFileItem]);
  const [selected, setSelected] = useState<string>(initialFileItem.uid);
  const [isLoading, setIsLoading] = useState(false);

  // 移动端控制面板
  const [showMobileControl, setShowMobileControl] = useState(false);

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // 计算当前预览的文件信息
  const { fileName, previewImage } = useMemo(() => {
    const selectedFile = fileList.find((f) => f.uid === selected);
    return {
      fileName: selectedFile?.name || '未选择图片',
      previewImage: selectedFile?.preview || '',
    };
  }, [fileList, selected]);

  // 防抖更新 options
  const { run: debouncedSetOptions } = useDebounceFn(
    (values: Partial<WatermarkOptions>) => {
      dispatch({
        type: 'SET_OPTIONS',
        payload: { ...defaultOptions, ...values },
      });
    },
    { wait: 100 }
  );

  // 表单值变化时更新 options
  const handleFormChange = useCallback(
    (_: any, allValues: Partial<WatermarkOptions>) => {
      // 处理 ColorPicker 返回的对象
      const processedValues = {
        ...allValues,
        fillStyle:
          typeof allValues.fillStyle === 'string'
            ? allValues.fillStyle
            : (allValues.fillStyle as any)?.toHexString?.() || defaultOptions.fillStyle,
      };
      debouncedSetOptions(processedValues);
    },
    [debouncedSetOptions]
  );

  // 处理图片上传/删除
  const handleUploadChange = useCallback(
    async ({ file, fileList: currentFileList }: any) => {
      const isRemove = currentFileList.length < fileList.length;

      if (isRemove) {
        // 删除文件
        if (currentFileList.length === 0) {
          setSelected('');
          setFileList([]);
          return;
        }
        const lastFile = currentFileList[currentFileList.length - 1];
        setSelected(lastFile.uid);
        setFileList(currentFileList);
      } else {
        // 添加文件
        setIsLoading(true);
        try {
          const preview = await getBase64(file.originFileObj, {
            timeout: 30000,
            maxSize: 15 * 1024 * 1024,
          });

          const newFile: FileItem = {
            ...file,
            status: 'done',
            preview,
            thumbUrl: preview,
          };

          setFileList((prev) =>
            prev.map((f) => (f.uid === file.uid ? newFile : f)).concat(
              prev.find((f) => f.uid === file.uid) ? [] : [newFile]
            )
          );
          setSelected(file.uid);
        } catch (error: any) {
          message.error(error.message || '图片处理失败');
          // 从列表中移除失败的文件
          setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fileList.length]
  );

  // 预览文件
  const handlePreview = useCallback((file: any) => {
    setSelected(file.uid);
  }, []);

  // 处理粘贴上传 (Ctrl+V)
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          setIsLoading(true);
          try {
            const preview = await getBase64(file, {
              timeout: 30000,
              maxSize: 15 * 1024 * 1024,
            });

            const uid = generateUID();
            const newFile: FileItem = {
              uid,
              name: `粘贴图片_${Date.now()}.png`,
              status: 'done',
              preview,
              thumbUrl: preview,
              originFileObj: file,
            };

            setFileList((prev) => {
              if (prev.length >= 8) {
                message.warning('最多只能上传 8 张图片');
                return prev;
              }
              return [...prev, newFile];
            });
            setSelected(uid);
            message.success('图片粘贴成功');
          } catch (error: any) {
            message.error(error.message || '粘贴失败');
          } finally {
            setIsLoading(false);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // 处理拖拽上传
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // 只有当离开整个区域时才取消拖拽状态
      if (e.relatedTarget && el.contains(e.relatedTarget as Node)) {
        return;
      }
      setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      setIsLoading(true);
      let addedCount = 0;

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (fileList.length + addedCount >= 8) {
          message.warning('最多只能上传 8 张图片');
          break;
        }

        try {
          const preview = await getBase64(file, {
            timeout: 30000,
            maxSize: 15 * 1024 * 1024,
          });

          const uid = generateUID();
          const newFile: FileItem = {
            uid,
            name: file.name,
            status: 'done',
            preview,
            thumbUrl: preview,
            originFileObj: file,
          };

          setFileList((prev) => [...prev, newFile]);
          if (addedCount === 0) {
            setSelected(uid);
          }
          addedCount++;
        } catch (error: any) {
          message.error(`${file.name}: ${error.message}`);
        }
      }

      setIsLoading(false);
      if (addedCount > 0) {
        message.success(`成功添加 ${addedCount} 张图片`);
      }
    };

    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('dragenter', handleDragEnter);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('drop', handleDrop);

    return () => {
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('dragenter', handleDragEnter);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('drop', handleDrop);
    };
  }, [fileList.length]);

  // 移动端触摸手势
  const gestureRef = useGesture({
    onPinch: (pinchScale) => {
      const newScale = Math.min(200, Math.max(10, scale * pinchScale));
      // 只在变化较大时更新
      if (Math.abs(newScale - scale) > 2) {
        scaleAction.onReset();
        // 使用一个临时的方式设置缩放
      }
    },
    onSwipe: (direction) => {
      // 滑动切换图片
      const currentIndex = fileList.findIndex((f) => f.uid === selected);
      if (currentIndex === -1) return;

      if (direction === 'left' && currentIndex < fileList.length - 1) {
        setSelected(fileList[currentIndex + 1].uid);
      } else if (direction === 'right' && currentIndex > 0) {
        setSelected(fileList[currentIndex - 1].uid);
      }
    },
  });

  // 导出单张图片
  const handleExport = useCallback(async () => {
    const canvasDOM = document.querySelector('canvas');
    if (!canvasDOM) {
      message.error('没有可导出的图片');
      return;
    }

    canvasDOM.toBlob((blob) => {
      if (blob) {
        saveAs(blob, fileName);
        // 庆祝动画
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            confetti({
              angle: Math.random() * 70 + 55,
              spread: Math.random() * 60 + 30,
              particleCount: Math.random() * 50 + 50,
              origin: { y: 0.6 },
            });
          }, i * 100);
        }
      }
    });
  }, [fileName]);

  // 批量导出 ZIP
  const handleExportAll = useCallback(async () => {
    if (fileList.length === 0) {
      message.error('没有可导出的图片');
      return;
    }

    setIsLoading(true);
    const zip = new JSZip();

    // 添加 LICENSE 文件
    zip.file(
      'LICENSE',
      `MIT License\n\nCopyright (c) 2021-present Turkyden\n\nGenerated by Watermark Pro`
    );

    // 使用更高效的方式批量导出
    const exportFile = async (file: FileItem): Promise<void> => {
      return new Promise((resolve) => {
        // 切换到当前文件
        setSelected(file.uid);

        // 等待渲染完成
        requestAnimationFrame(() => {
          setTimeout(() => {
            const canvasDOM = document.querySelector('canvas');
            if (canvasDOM) {
              canvasDOM.toBlob((blob) => {
                if (blob) {
                  zip.file(file.name, blob);
                }
                resolve();
              });
            } else {
              resolve();
            }
          }, 100); // 缩短等待时间
        });
      });
    };

    // 顺序处理每个文件
    for (const file of fileList) {
      await exportFile(file);
    }

    // 生成 ZIP 文件
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `watermark_${Date.now()}.zip`);

    setIsLoading(false);

    // 庆祝动画
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        confetti({
          angle: Math.random() * 70 + 55,
          spread: Math.random() * 60 + 30,
          particleCount: Math.random() * 50 + 50,
          origin: { y: 0.6 },
        });
      }, i * 100);
    }
  }, [fileList]);

  // 表单组件
  const renderForm = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={defaultOptions}
      onValuesChange={handleFormChange}
      size="small"
    >
      <Form.Item label="水印文字" name="text">
        <Input.TextArea rows={2} placeholder="请输入水印文字" />
      </Form.Item>

      <Form.Item label="文字颜色" name="fillStyle">
        <ColorPicker showText format="hex" />
      </Form.Item>

      <Form.Item label={`字体大小: ${options.fontSize}px`} name="fontSize">
        <Slider min={12} max={64} />
      </Form.Item>

      <Form.Item label={`旋转角度: ${options.rotate}°`} name="rotate">
        <Slider min={0} max={45} />
      </Form.Item>

      <Form.Item label={`水印宽度: ${options.watermarkWidth}px`} name="watermarkWidth">
        <Slider min={100} max={560} />
      </Form.Item>

      <Form.Item label={`水印高度: ${options.watermarkHeight}px`} name="watermarkHeight">
        <Slider min={100} max={360} />
      </Form.Item>

      <Button
        block
        type="primary"
        onClick={handleExport}
        loading={isLoading}
        className="mb-2"
      >
        导出图片
      </Button>

      <Button block onClick={handleExportAll} loading={isLoading}>
        批量导出 ZIP
      </Button>
    </Form>
  );

  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <header className="fixed z-40 top-4 left-4 flex justify-start items-center">
        <div className="pr-4 text-gray-800">
          <div className="text-xl md:text-2xl font-bold font-sans">WaterMark Pro</div>
        </div>
        <a
          href="https://github.com/Turkyden/watermark-pro"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block"
        >
          <img
            className="w-24"
            alt="GitHub Repo stars"
            src="https://img.shields.io/github/stars/Turkyden/watermark-pro?style=social"
            loading="lazy"
          />
        </a>
      </header>

      {/* 移动端设置按钮 */}
      {isMobile && (
        <Button
          type="primary"
          shape="circle"
          icon={<SettingOutlined />}
          className="fixed z-50 top-4 right-4"
          onClick={() => setShowMobileControl(true)}
        />
      )}

      {/* Buy me a coffee - 仅桌面端显示 */}
      <div className="fixed top-20 left-4 z-40 cursor-pointer animate-bounce hidden md:block">
        <Popover
          content={
            <div className="p-2">
              <img
                className="w-64 rounded"
                src={new URL('@/assets/weixin.jpeg', import.meta.url).href}
                alt="buymeacoffee"
              />
            </div>
          }
          title=""
        >
          <img
            className="w-36 shadow-2xl transition"
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            loading="lazy"
          />
        </Popover>
      </div>

      {/* Canvas 区域 */}
      <section
        ref={(el) => {
          // 合并 refs
          (dropRef as any).current = el;
          if (gestureRef.current !== el) {
            (gestureRef as any).current = el;
          }
        }}
        className={`pattern-checks-sm w-full relative bg-gray-200 text-gray-300 flex flex-col justify-center items-center overflow-hidden transition-all ${
          isDragging ? 'drag-over' : ''
        }`}
        style={{ height: screenHeight ? screenHeight - 128 : 'calc(100vh - 128px)' }}
        onWheel={scaleAction.onWheel as any}
      >
        {/* 拖拽提示 */}
        {isDragging && (
          <div className="absolute inset-0 bg-indigo-500/30 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg px-8 py-4 shadow-xl">
              <span className="text-xl text-indigo-600 font-bold">
                释放以上传图片
              </span>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50">
            <Spin size="large" tip="处理中..." />
          </div>
        )}

        {/* 无图片提示 */}
        {!previewImage && !isLoading && (
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">请上传图片</p>
            <p className="text-sm">支持拖拽上传或 Ctrl+V 粘贴</p>
          </div>
        )}

        {/* 水印 Canvas */}
        {previewImage && (
          <div
            className="relative"
            style={{ transform: `scale(${scale / 100})` }}
          >
            <div className="absolute -top-10 left-0">
              <span className="inline-block px-3 py-1 text-base md:text-lg font-semibold text-gray-700 bg-white/80 rounded shadow-sm truncate max-w-xs">{fileName}</span>
            </div>
            <Watermark url={previewImage} options={options} />
          </div>
        )}

        {/* 桌面端控制面板 */}
        {!isMobile && (
          <Control title="水印设置" defaultPosition={{ x: -16, y: 16 }}>
            {renderForm()}
          </Control>
        )}

        {/* 缩放控制 */}
        <Scaler scale={scale} {...scaleAction} />

        {/* 快捷键提示 - 仅桌面端 */}
        {!isMobile && <HotKey />}
      </section>

      {/* 上传区域 */}
      <section className="w-full min-h-32 p-4 overflow-auto bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 shadow">
        <Upload
          listType="picture-card"
          fileList={fileList as any}
          onPreview={handlePreview}
          onChange={handleUploadChange}
          beforeUpload={() => false}
          accept="image/*"
          multiple
        >
          {fileList.length >= 8 ? null : (
            <div className="text-white">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </div>
          )}
        </Upload>

        {/* 滚动提示 */}
        <div className="animate-bounce w-full absolute bottom-2 left-0 text-center text-gray-300 hidden md:block">
          <ArrowDownOutlined
            className="text-2xl cursor-pointer"
            onClick={() =>
              window.scrollTo({
                top: window.outerHeight,
                behavior: 'smooth',
              })
            }
          />
        </div>
      </section>

      {/* 懒加载 Market 组件 */}
      <Suspense
        fallback={
          <div className="w-full h-64 flex items-center justify-center">
            <Spin size="large" />
          </div>
        }
      >
        <Market />
      </Suspense>

      {/* 移动端控制面板抽屉 */}
      <Drawer
        title="水印设置"
        placement="bottom"
        open={showMobileControl}
        onClose={() => setShowMobileControl(false)}
        height="auto"
        styles={{
          body: { paddingBottom: 40 },
        }}
      >
        {renderForm()}
      </Drawer>
    </div>
  );
}
