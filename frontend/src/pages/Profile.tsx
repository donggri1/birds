import { useOutletContext } from 'react-router-dom';

// Outlet context에서 받아올 user 객체의 타입 정의
interface User {
  id: number;
  nick: string;
  Followings: { nick: string }[];
  Followers: { nick: string }[];
}

interface OutletContextType {
  user: User | null;
}

/**
 * 프로필 페이지 컴포넌트
 * 로그인한 사용자의 팔로워 및 팔로잉 목록을 표시합니다.
 */
export default function Profile() {
  // Layout으로부터 user 정보를 받아옵니다.
  const { user } = useOutletContext<OutletContextType>();

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">프로필</h1>
        <p>로그인이 필요한 서비스입니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 팔로잉 목록 */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">팔로잉 목록</h2>
          {user.Followings && user.Followings.length > 0 ? (
            <ul>
              {user.Followings.map((following, index) => (
                <li key={index} className="py-2 border-b">{following.nick}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">팔로잉하는 사용자가 없습니다.</p>
          )}
        </div>

        {/* 팔로워 목록 */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">팔로워 목록</h2>
          {user.Followers && user.Followers.length > 0 ? (
            <ul>
              {user.Followers.map((follower, index) => (
                <li key={index} className="py-2 border-b">{follower.nick}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">팔로워가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}