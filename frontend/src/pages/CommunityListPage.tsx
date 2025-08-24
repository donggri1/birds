import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// API로부터 받아올 게시글의 타입 정의
interface CommunityPost {
  id: number;
  title: string;
  createdAt: string;
  User: {
    nick: string;
  };
}

/**
 * 커뮤니티 게시글 목록 페이지
 */
export default function CommunityListPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 백엔드 API에 게시글 목록을 요청합니다.
        const response = await axios.get<CommunityPost[]>('/api/community/api');
        setPosts(response.data);
      } catch (err) {
        setError('게시글을 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">커뮤니티</h1>
        <Link to="/community/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          글쓰기
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">번호</th>
              <th className="py-2 px-4 border-b">제목</th>
              <th className="py-2 px-4 border-b">작성자</th>
              <th className="py-2 px-4 border-b">작성일</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b text-center">{post.id}</td>
                  <td className="py-2 px-4 border-b">
                    <Link to={`/community/${post.id}`} className="text-blue-600 hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="py-2 px-4 border-b text-center">{post.User.nick}</td>
                  <td className="py-2 px-4 border-b text-center">{new Date(post.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-500">게시글이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
