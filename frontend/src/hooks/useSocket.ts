
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Socket.IO 연결을 관리하는 커스텀 훅
 * @param roomId - 접속할 채팅방의 ID (현재는 글로벌 채팅만 지원)
 */
const useSocket = (roomId: string | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // 백엔드 소켓 서버의 URL을 명시적으로 지정합니다.
    // 백엔드 서버가 다른 포트나 도메인에서 실행 중인 경우 여기에 정확한 주소를 입력해야 합니다.
    const newSocket = io('http://localhost:8001', { 
      path: '/socket.io',
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // 컴포넌트가 언마운트될 때 소켓 연결을 끊습니다.
    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  return { socket };
};

export default useSocket;
