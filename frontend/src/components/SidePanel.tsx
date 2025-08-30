
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown'; // NotificationDropdown 컴포넌트 import
import useSockets from '../hooks/useSocket'; // useSockets 훅 import

// 컴포넌트 props 타입을 정의합니다.
interface SidePanelProps {
  user: {
    id: number;
    nick: string;
  } | null;
  onLogout: () => void; // 로그아웃 처리 함수
}

// 알림 데이터 타입을 정의합니다.
interface Notification {
  id: number;
  read: boolean;
}

/**
 * 화면 왼쪽에 위치하는 사이드 패널 컴포넌트.
 * 로그인 상태에 따라 프로필 정보 또는 로그인 폼을 보여줍니다.
 */
export default function SidePanel({ user, onLogout }: SidePanelProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { notificationSocket } = useSockets();

  // 읽지 않은 알림 개수를 가져오는 함수
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get<Notification[]>('/api/notifications');
      const count = response.data.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('읽지 않은 알림 개수를 가져오는데 실패했습니다.', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }

    if (notificationSocket) {
      // 새 알림이 오면 개수를 다시 가져옴
      notificationSocket.on('new_notification', fetchUnreadCount);
    }

    return () => {
      notificationSocket?.off('new_notification', fetchUnreadCount);
    };
  }, [user, notificationSocket]);

  // 로그인 폼 제출 핸들러
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      await axios.post('/api/auth/login', { email, password });
      window.location.reload();
    } catch (error) {
      console.error('로그인 실패', error);
      alert('로그인에 실패했습니다.');
    }
  };

  return (
    <div className="w-1/4 mr-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        {user ? (
          <div className="text-center">
            <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg">{`안녕하세요! ${user.nick}님`}</div>
                <div className="relative">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadCount}</span>
                        )}
                    </button>
                    {isDropdownOpen && <NotificationDropdown onClose={() => { setIsDropdownOpen(false); fetchUnreadCount(); }} />}
                </div>
            </div>
            <div className="flex justify-around mb-4">
              <div>
                <div className="text-gray-600">팔로잉</div>
                <div className="font-bold text-xl">0</div>
              </div>
              <div>
                <div className="text-gray-600">팔로워</div>
                <div className="font-bold text-xl">0</div>
              </div>
            </div>
            <Link to="/" className="block w-full bg-blue-500 text-white text-center py-2 rounded-md mb-2 hover:bg-blue-600">홈</Link>
            <Link to="/profile" className="block w-full bg-blue-500 text-white text-center py-2 rounded-md mb-2 hover:bg-blue-600">내 프로필</Link>
            <Link to="/community" className="block w-full bg-blue-500 text-white text-center py-2 rounded-md mb-2 hover:bg-blue-600">자유게시판</Link>
            <button onClick={onLogout} className="block w-full bg-gray-300 text-gray-700 text-center py-2 rounded-md hover:bg-gray-400">로그아웃</button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="mb-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
              <input id="email" type="email" name="email" required autoFocus className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">비밀번호</label>
              <input id="password" type="password" name="password" required className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">로그인</button>
            <Link to="/join" className="block w-full text-center bg-gray-200 text-gray-700 py-2 rounded-md mt-2 hover:bg-gray-300">회원가입</Link>
            <a href="/api/auth/kakao" className="block w-full text-center bg-yellow-400 text-black py-2 rounded-md mt-2 hover:bg-yellow-500">카카오톡</a>
          </form>
        )}
      </div>
      <footer className="text-center text-xs text-gray-500 mt-4">
        made by dCha
      </footer>
    </div>
  );
}
