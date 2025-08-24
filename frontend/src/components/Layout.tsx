import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './Chat';
import SidePanel from './SidePanel'; // SidePanel 컴포넌트 임포트

// 사용자 정보를 담을 인터페이스 정의
interface User {
  id: number;
  nick: string;
}

/**
 * 모든 페이지에 공통적으로 적용되는 레이아웃 컴포넌트입니다.
 * 네비게이션 바와 메인 컨텐츠 영역으로 구성됩니다.
 * 로그인 상태를 확인하여 동적으로 메뉴를 변경합니다.
 */
export default function Layout() {
  // 로그인한 사용자 정보를 저장하는 state
  const [user, setUser] = useState<User | null>(null);
  // 데이터 로딩 상태를 저장하는 state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 컴포넌트가 처음 마운트될 때 로그인 상태를 확인합니다.
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 백엔드에 현재 로그인한 사용자 정보를 요청합니다.
        // vite.config.ts의 프록시 설정에 따라 /api/auth/me는 백엔드 서버의 /auth/me로 전달됩니다.
        const response = await axios.get<User>('/api/auth/me');
        setUser(response.data); // 성공 시 사용자 정보 저장
      } catch (error) {
        // 요청 실패 시 (로그인하지 않은 경우 등) user state는 null로 유지됩니다.
        console.error('사용자 정보를 가져오는데 실패했습니다.', error);
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };

    fetchUser();
  }, []);

  // 채팅창 표시 여부를 관리하는 state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      // 페이지를 새로고침하여 로그아웃 상태를 확실히 반영합니다.
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
  };

  // 로딩 중일 때는 간단한 메시지를 표시
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex w-full max-w-6xl mx-auto">
        {/* 왼쪽 사이드 패널 */}
        <SidePanel user={user} onLogout={handleLogout} />

        {/* 오른쪽 메인 컨텐츠 */}
        <div className="w-3/4">
          <Outlet context={{ user }} />
        </div>
      </div>

      {/* 로그인한 사용자에게만 채팅 기능 표시 */}
      {user && (
        <>
          {isChatOpen && (
            <div className="fixed bottom-20 right-4 z-20">
              <Chat />
            </div>
          )}
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-4 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl z-30 hover:bg-blue-700 transition-transform transform hover:scale-110"
          >
            {isChatOpen ? 'X' : '💬'}
          </button>
        </>
      )}
    </div>
  );
}