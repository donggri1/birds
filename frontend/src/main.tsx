import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// public/index.html 파일에 있는 id가 'root'인 요소를 찾습니다.
// "!"는 이 요소가 항상 존재한다고 TypeScript에 알려주는 non-null assertion 입니다.
const rootElement = document.getElementById('root')!;

// 찾은 요소를 루트로 사용하여 React 애플리케이션을 렌더링합니다.
ReactDOM.createRoot(rootElement).render(
  // React.StrictMode는 개발 중에 잠재적인 문제를 감지하고 경고를 표시하는 데 도움이 됩니다.
  <React.StrictMode>
    {/* BrowserRouter는 HTML5 History API를 사용하여 UI와 URL을 동기화하는 라우터입니다. */}
    {/* 이 컴포넌트로 App을 감싸면, App 컴포넌트와 그 모든 자식 컴포넌트에서 라우팅 기능을 사용할 수 있게 됩니다 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);