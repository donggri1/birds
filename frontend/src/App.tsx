
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Main from './pages/Main';
import Profile from './pages/Profile';
import Join from './pages/Join';
import Login from './pages/Login';
import CommunityListPage from './pages/CommunityListPage';
import CommunityWritePage from './pages/CommunityWritePage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import useSockets from './hooks/useSocket'; // useSockets 훅 import
import { Toaster, toast } from 'react-hot-toast'; // Toaster와 toast import

/**
 * 애플리케이션의 메인 컴포넌트입니다.
 * react-router-dom을 사용하여 페이지 라우팅을 설정합니다.
 */
function App() {
  // useSockets 훅을 사용하여 소켓 인스턴스를 가져옵니다.
  const { notificationSocket } = useSockets();

  useEffect(() => {
    // notificationSocket이 연결되면 이벤트 리스너를 등록합니다.
    if (notificationSocket) {
      // 'new_notification' 이벤트를 수신하면 토스트 메시지를 띄웁니다.
      notificationSocket.on('new_notification', (data) => {
        toast.success(data.message, {
          position: 'bottom-right',
        });
      });
    }

    // 컴포넌트가 언마운트될 때 이벤트 리스너를 정리합니다.
    return () => {
      notificationSocket?.off('new_notification');
    };
  }, [notificationSocket]);

  return (
    <>
      {/* 토스트 메시지를 화면에 렌더링하기 위한 컨테이너 */}
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Main />} />
          <Route path="profile" element={<Profile />} />
          <Route path="join" element={<Join />} />
          <Route path="login" element={<Login />} />
          <Route path="community" element={<CommunityListPage />} />
          <Route path="community/new" element={<CommunityWritePage />} />
          <Route path="community/:id" element={<CommunityDetailPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
