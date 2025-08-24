import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Vite 플러그인 설정 배열입니다.
  // @vitejs/plugin-react: React 프로젝트를 빌드하고 개발 서버를 실행하기 위한 핵심 플러그인입니다.
  // JSX 변환, Fast Refresh (핫 리로딩) 등의 기능을 제공합니다.
  plugins: [react()],

  // 개발 서버 관련 설정입니다.
  server: {
    // 프록시(proxy) 설정입니다.
    // 프론트엔드 개발 서버(Vite)와 백엔드 API 서버(Express)가 다른 포트에서 실행될 때 발생하는
    // CORS(Cross-Origin Resource Sharing) 문제를 해결하기 위해 사용됩니다.
    proxy: {
      // '/api'로 시작하는 모든 API 요청을 백엔드 서버인 'http://localhost:8001'로 전달합니다.
      // 예를 들어, 프론트엔드에서 '/api/posts'로 요청을 보내면,
      // 실제로는 'http://localhost:8001/posts'로 요청이 전달됩니다.
      // 백엔드 라우터에서는 '/api' 접두사를 제외하고 '/posts'와 같은 경로로 라우팅을 구성해야 합니다.
      '/api': {
        target: 'http://localhost:8001', // 백엔드 서버 주소
        changeOrigin: true, // HTTP 요청 헤더의 Host를 타겟 URL로 변경합니다.
        rewrite: (path) => path.replace(/^\/api/, ''), // '/api' 접두사를 제거합니다.
      },
      // '/uploads' 경로로 오는 요청을 백엔드 서버로 전달합니다.
      // 이미지 파일을 표시하기 위해 필요합니다.
      '/uploads': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
});