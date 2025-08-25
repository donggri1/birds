
// /frontend/src/components/SidePanel.tsx

import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 컴포넌트 props 타입을 정의합니다.
interface SidePanelProps {
  user: {
    id: number;
    nick: string;
  } | null;
  onLogout: () => void; // 로그아웃 처리 함수
}

/**
 * 화면 왼쪽에 위치하는 사이드 패널 컴포넌트.
 * 로그인 상태에 따라 프로필 정보 또는 로그인 폼을 보여줍니다.
 */
export default function SidePanel({ user, onLogout }: SidePanelProps) {
  const navigate = useNavigate();

  // 로그인 폼 제출 핸들러
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      await axios.post('/api/auth/login', { email, password });
      // 로그인 성공 시 페이지를 새로고침하여 전체 앱의 상태를 업데이트합니다.
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
          // 로그인 상태일 때
          <div className="text-center">
            <div className="font-bold text-lg mb-4">{`안녕하세요! ${user.nick}님`}</div>
            {/* 팔로잉/팔로워 수는 추후 구현 */}
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
          // 로그아웃 상태일 때
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
            {/* 카카오 로그인 버튼은 추후 구현 */}
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
