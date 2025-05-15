import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastProvider } from '../contexts/ToastContext'; // ToastProvider import 추가
import './index.css';

// DOM이 로드되었는지 확인
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error(
      'Root element #root not found in DOM! 렌더링 대상 요소를 찾을 수 없습니다.',
    );
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <ToastProvider>
          <App />
        </ToastProvider>
      </React.StrictMode>,
    );
    console.log('React 앱이 성공적으로 렌더링되었습니다.');
  } catch (error) {
    console.error('React 앱 렌더링 중 오류 발생:', error);
  }
});
