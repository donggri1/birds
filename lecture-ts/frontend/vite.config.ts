import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Vite 플러그인 배열입니다. @vitejs/plugin-react를 추가하여 React 지원을 활성화합니다.
  plugins: [react()],
  server: {
    // 개발 서버의 프록시 설정입니다.
    proxy: {
      // '/api'로 시작하는 모든 요청을 'http://localhost:8001'로 전달합니다.
      // 이렇게 하면 React 앱에서 API를 호출할 때 '/api/users'와 같은 경로를 사용하면,
      // 실제로는 'http://localhost:8001/api/users'로 요청이 전송됩니다.
      // 이를 통해 CORS(Cross-Origin Resource Sharing) 오류를 피할 수 있습니다.
      '/api': 'http://localhost:8001',
    },
  },
});

