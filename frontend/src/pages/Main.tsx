import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

// API 응답으로 받을 사용자 정보 인터페이스
interface PostUser {
  id: number;
  nick: string;
}

// API 응답으로 받을 게시글 정보 인터페이스
interface Post {
  id: number;
  content: string;
  img: string | null;
  createdAt: string;
  User: PostUser;
  UserId: number;
}

// Outlet context 타입을 위한 인터페이스
interface OutletContextType {
  user: { id: number; nick: string } | null;
}

/**
 * 메인 페이지 컴포넌트
 * 게시글 작성 폼과 타임라인을 표시합니다.
 */
export default function Main() {
  const { user } = useOutletContext<OutletContextType>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Post[]>('/api/post');
      setPosts(response.data);
      setError(null);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    if (!imageFile) return;
    const formData = new FormData();
    formData.append('img', imageFile);
    try {
      const response = await axios.post<{ url: string }>('/api/post/img', formData);
      setImageUrl(response.data.url);
    } catch (err) {
      console.error('이미지 업로드 실패', err);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('내용을 입력하세요.');
      return;
    }
    try {
      await axios.post('/api/post', { content, url: imageUrl });
      setContent('');
      setImageUrl('');
      fetchPosts();
    } catch (err) {
      console.error('게시글 작성 실패', err);
      alert('게시글 작성에 실패했습니다.');
    }
  };

  // 게시글 삭제 처리 함수
  const handleDelete = async (postId: number) => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await axios.post(`/api/post/${postId}/delete`);
        // 상태 업데이트: 삭제된 게시글을 목록에서 제거
        setPosts(posts.filter(post => post.id !== postId));
      } catch (err) {
        console.error('게시글 삭제 실패', err);
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      {user && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">새 게시글 작성</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="무슨 일이 있었나요?"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <div>
                <label htmlFor="image-upload" className="cursor-pointer text-blue-500 hover:text-blue-700">
                  이미지 선택
                </label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {imageUrl && <span className="ml-4 text-sm text-gray-600">이미지 선택됨</span>}
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                게시하기
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold">타임라인</h2>
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">{post.User.nick}</span>
              <span className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <p className="mb-2">{post.content}</p>
            {post.img && (
              <div className="my-2">
                <img src={post.img} alt="게시글 이미지" className="max-w-full h-auto rounded-lg" />
              </div>
            )}
            {user && user.id === post.UserId && (
              <div className="text-right">
                <button onClick={() => handleDelete(post.id)} className="text-sm text-red-500 hover:text-red-700">
                  삭제
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
