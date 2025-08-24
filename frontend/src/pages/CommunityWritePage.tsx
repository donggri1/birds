import { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * 커뮤니티 새 게시글 작성 페이지
 */
export default function CommunityWritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // FormData 객체를 생성하여 폼 데이터와 파일을 담습니다.
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('img', image);
    }

    try {
      // FormData를 서버로 전송합니다.
      // axios는 자동으로 Content-Type을 multipart/form-data로 설정합니다.
      await axios.post('/api/community/api', formData);
      navigate('/community');
    } catch (err) {
      setError('게시글 작성에 실패했습니다.');
      console.error(err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

      return (
        <div className="p-4 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">새 게시글 작성</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">내용</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="img" className="block text-sm font-medium text-gray-700">이미지</label>
              <input
                type="file"
                id="img"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                작성하기
              </button>
            </div>
          </form>
        </div>
    )
};
