import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

// Ant Design 5 主题配置
const theme = {
  token: {
    // 主色调 - 靛蓝色
    colorPrimary: '#6366F1',
    // 圆角
    borderRadius: 4,
    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      // 按钮紧凑模式
      controlHeight: 32,
    },
    Upload: {
      // 上传组件配置
      colorBorder: '#d9d9d9',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={theme} locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
