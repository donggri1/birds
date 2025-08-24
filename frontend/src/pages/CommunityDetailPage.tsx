import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';

// 타입 정의
interface User {
  id: number;
  nick: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  User: User;
  UserId: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  User: User;
  UserId: number;
  Comments: Comment[];
}

interface OutletContextType {
  user: User | null;
}

/**
 * 커뮤니티 게시글 상세 페이지
 */
export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');

  const fetchPost = async () => {
    try {
      const response = await axios.get<Post>(`/api/community/api/${id}`);
      setPost(response.data);
    } catch (err) {
      setError('게시글을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      await axios.post(`/api/community/api/${id}/comments`, { content: commentContent });
      setCommentContent('');
      fetchPost(); // 댓글 작성 후 게시글 정보 다시 로드
    } catch (err) {
      console.error('댓글 작성 실패', err);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handlePostDelete = async () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/community/api/${id}`);
        navigate('/community');
      } catch (err) {
        console.error('게시글 삭제 실패', err);
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/community/api/${id}/comments/${commentId}`);
        fetchPost(); // 댓글 삭제 후 게시글 정보 다시 로드
      } catch (err) {
        console.error('댓글 삭제 실패', err);
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* 게시글 내용 */}
      <div className="border-b pb-4 mb-4">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>작성자: {post.User.nick}</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </div>
        <div className="prose max-w-none">
          {post.content}
        </div>
        {user && user.id === post.UserId && (
          <div className="text-right mt-4 space-x-2">
            {/* TODO: 수정 기능 구현 */}
            <button className="px-3 py-1 bg-gray-200 rounded-md text-sm">수정</button>
            <button onClick={handlePostDelete} className="px-3 py-1 bg-red-500 text-white rounded-md text-sm">삭제</button>
          </div>
        )}
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-bold">댓글</h2>
        {post.Comments.length > 0 ? (
          post.Comments.map(comment => (
            <div key={comment.id} className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{comment.User.nick}</span>
                {user && user.id === comment.UserId && (
                  <button onClick={() => handleCommentDelete(comment.id)} className="text-xs text-red-500">삭제</button>
                )}
              </div>
              <p className="text-gray-800 my-1">{comment.content}</p>
              <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">아직 댓글이 없습니다.</p>
        )}
      </div>

      {/* 댓글 작성 폼 */}
      {user && (
        <form onSubmit={handleCommentSubmit} className="flex gap-2">
          <input
            type="text"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-shrink-0">등록</button>
        </form>
      )}
    </div>
  );
}
