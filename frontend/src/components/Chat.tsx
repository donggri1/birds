
// /frontend/src/components/Chat.tsx

import React, { useState, useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';

// 메시지 타입을 정의합니다.
interface IMessage {
  user: {
    nick: string;
  };
  chat: string;
}

interface ChatProps {
  setIsChatOpen: (isOpen: boolean) => void; // 채팅 열림/닫힘 상태를 설정하는 함수
}

/**
 * 모든 페이지의 레이아웃에 포함될 글로벌 채팅 컴포넌트
 */
export default function Chat({ setIsChatOpen }: ChatProps) {
  // "global" 채팅방에 연결합니다.
  const { socket } = useSocket('global');
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleSystemMessage = (data: { user: string; chat: string }) => {
      setMessages((prev) => [...prev, { user: { nick: 'System' }, chat: data.chat }]);
    };

    const handleChatMessage = (data: IMessage) => {
      setMessages((prev) => [...prev, data]);
    };

    // 초기 메시지 목록을 받아오는 이벤트 (필요 시 구현)
    socket.on('initialMessages', (msgs) => setMessages(msgs));
    socket.on('join', handleSystemMessage);
    socket.on('exit', handleSystemMessage);
    socket.on('chat', handleChatMessage);

    return () => {
      socket.off('initialMessages');
      socket.off('join', handleSystemMessage);
      socket.off('exit', handleSystemMessage);
      socket.off('chat', handleChatMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit('chat', { chat: input });
      setInput('');
    }
  };

  return (
    <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
      <h2 className="text-xl font-bold p-3 border-b text-center bg-gray-50 rounded-t-lg flex justify-between items-center">
        Chat
        <button 
          onClick={() => setIsChatOpen(false)} // 닫기 버튼 클릭 시 채팅 닫기
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          &times;
        </button>
      </h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.user.nick === 'System' ? 'items-center' : 'items-start'}`}>
            {msg.user.nick !== 'System' && <span className="font-bold text-sm">{msg.user.nick}</span>}
            <p className={`rounded-lg px-3 py-2 max-w-xs break-words ${msg.user.nick === 'System' ? 'bg-gray-200 text-gray-600 text-xs' : 'bg-blue-500 text-white'}`}>
              {msg.chat}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-2 border-t flex bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="message..."
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  );
}
