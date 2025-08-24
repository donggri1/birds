import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useSocket from '../hooks/useSocket';

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
  // useParams 훅을 사용하여 URL에서 'id' 파라미터를 가져옵니다.
  // 이 'id'는 커뮤니티의 고유 ID로 사용됩니다.
  const { id: communityId } = useParams<{ id: string }>();

  // 채팅 메시지 목록을 관리하는 상태입니다.
  // 초기값은 빈 배열이며, 새로운 메시지가 도착하면 이 배열에 추가됩니다.
  const [messages, setMessages] = useState<Message[]>([]);

  // 사용자가 입력하는 채팅 메시지를 관리하는 상태입니다.
  // 초기값은 빈 문자열입니다.
  const [input, setInput] = useState<string>('');

  // 커스텀 훅인 useSocket을 사용하여 웹소켓 연결을 설정하고 소켓 인스턴스를 가져옵니다.
  // communityId를 인자로 넘겨 해당 커뮤니티 채팅방에 연결합니다.
  const { socket } = useSocket(communityId);

  // 메시지 목록의 맨 아래로 스크롤하기 위한 ref입니다.
  // 새로운 메시지가 추가될 때마다 자동으로 스크롤을 이동시킵니다.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 소켓 이벤트 리스너를 설정하는 useEffect 훅입니다.
  // 컴포넌트가 마운트될 때 한 번 실행되고, socket 객체가 변경될 때마다 다시 실행됩니다.
  useEffect(() => {
    // socket 객체가 없으면 (아직 연결되지 않았으면) 함수를 종료합니다.
    if (!socket) return;

    // 'join' 및 'exit' 이벤트는 시스템 메시지로 처리합니다.
    // 사용자가 채팅방에 입장하거나 퇴장할 때 서버에서 전송됩니다.
    const handleSystemMessage = (data: { chat: string }) => {
      setMessages((prev) => [...prev, { user: { nick: 'System' }, chat: data.chat }]);
    };

    // 'chat' 이벤트는 일반 사용자 채팅 메시지로 처리합니다.
    // 다른 사용자가 메시지를 보낼 때 서버에서 전송됩니다.
    const handleChatMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    // 각 이벤트에 대한 리스너를 등록합니다.
    socket.on('join', handleSystemMessage);
    socket.on('exit', handleSystemMessage);
    socket.on('chat', handleChatMessage);

    // 컴포넌트가 언마운트될 때 (화면에서 사라질 때) 이벤트 리스너를 정리합니다.
    // 메모리 누수를 방지하고 불필요한 동작을 막기 위함입니다.
    return () => {
      socket.off('join', handleSystemMessage);
      socket.off('exit', handleSystemMessage);
      socket.off('chat', handleChatMessage);
    };
  }, [socket]); // socket 객체가 변경될 때마다 이 useEffect가 다시 실행됩니다.

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동시키는 useEffect 훅입니다.
  // 새로운 메시지가 추가되면 자동으로 최신 메시지를 볼 수 있도록 합니다.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // messages 상태가 변경될 때마다 이 useEffect가 다시 실행됩니다.

  // 메시지 전송을 처리하는 함수입니다.
  // 폼 제출 이벤트(e)를 인자로 받습니다.
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault(); // 폼의 기본 제출 동작(페이지 새로고침)을 막습니다.
    // 입력 필드가 비어있지 않고 소켓이 연결되어 있으면 메시지를 전송합니다.
    if (input.trim() && socket) {
      // 'chat' 이벤트와 함께 입력된 메시지를 서버로 전송합니다.
      socket.emit('chat', { chat: input });
      setInput(''); // 메시지를 전송한 후 입력 필드를 초기화합니다.
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold p-4 border-b">실시간 채팅방</h1>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 메시지 목록을 렌더링합니다. */}
        {messages.map((msg, index) => (
          <div
            key={index} // 각 메시지에 고유한 key를 부여합니다. (실제 앱에서는 메시지 ID 등을 사용하는 것이 좋습니다.)
            className={`flex ${msg.user.nick === 'System' ? 'justify-center' : 'items-end'}`}
          >
            {/* 시스템 메시지가 아닌 경우에만 발신자 닉네임을 표시합니다. */}
            {msg.user.nick !== 'System' && (
              <span className="font-bold mr-2">{msg.user.nick}:</span>
            )}
            {/* 메시지 내용과 스타일에 따라 다른 배경색을 적용합니다. */}
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
        {/* 메시지 목록의 맨 아래를 가리키는 빈 div입니다. 스크롤 이동에 사용됩니다. */}
        <div ref={messagesEndRef} />
      </div>
      {/* 메시지 입력 폼입니다. */}
      <form onSubmit={handleSend} className="p-4 border-t flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)} // 입력 필드 값이 변경될 때마다 input 상태를 업데이트합니다.
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
