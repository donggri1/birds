import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useSockets from '../hooks/useSocket'; // useSockets 훅으로 변경

// 메시지 타입을 정의합니다.
// user는 발신자 정보를, chat은 메시지 내용을 담습니다.
interface Message {
  user: {
    nick: string; // 발신자의 닉네임
  };
  chat: string; // 채팅 메시지 내용
}

/**
 * 커뮤니티 실시간 채팅 페이지 컴포넌트
 * URL 파라미터에서 커뮤니티 ID를 받아와 해당 커뮤니티의 채팅방에 연결합니다.
 */
export default function CommunityChatPage(): JSX.Element {
  const { id: communityId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  
  // useSockets 훅을 사용하고 chatSocket을 가져옵니다.
  const { chatSocket } = useSockets();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSocket) return;

    const handleSystemMessage = (data: { chat: string }) => {
      setMessages((prev) => [...prev, { user: { nick: 'System' }, chat: data.chat }]);
    };

    const handleChatMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    chatSocket.on('join', handleSystemMessage);
    chatSocket.on('exit', handleSystemMessage);
    chatSocket.on('chat', handleChatMessage);

    return () => {
      chatSocket.off('join', handleSystemMessage);
      chatSocket.off('exit', handleSystemMessage);
      chatSocket.off('chat', handleChatMessage);
    };
  }, [chatSocket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && chatSocket) {
      chatSocket.emit('chat', { chat: input });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold p-4 border-b">실시간 채팅방 (커뮤니티: {communityId})</h1>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.user.nick === 'System' ? 'justify-center' : 'items-end'}`}
          >
            {msg.user.nick !== 'System' && (
              <span className="font-bold mr-2">{msg.user.nick}:</span>
            )}
            <p
              className={`rounded-lg px-4 py-2 ${
                msg.user.nick === 'System'
                  ? 'bg-gray-200 text-gray-600 text-sm'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {msg.chat}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 border-t flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="메시지를 입력하세요..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
        >
          전송
        </button>
      </form>
    </div>
  );
}
