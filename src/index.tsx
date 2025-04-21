import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // App 컴포넌트를 가져옵니다.
import './styles/globals.css'; // 전역 스타일을 가져옵니다.

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('루트 요소를 찾을 수 없습니다.');
}
