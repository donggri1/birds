
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// 여러 소켓 연결을 관리하기 위한 객체 타입 정의
interface Sockets {
  chatSocket: Socket | null;
  notificationSocket: Socket | null;
}

/**
 * 채팅 및 알림용 Socket.IO 연결을 관리하는 커스텀 훅
 */
const useSockets = () => {
  const [sockets, setSockets] = useState<Sockets>({ chatSocket: null, notificationSocket: null });

  useEffect(() => {
    // 백엔드 소켓 서버 URL
    const backendUrl = 'http://localhost:8001';

    // 채팅 소켓 연결
    const newChatSocket = io(`${backendUrl}/chat`, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true, // 세션 정보를 보내기 위해 필요
    });

    // 알림 소켓 연결
    const newNotificationSocket = io(`${backendUrl}/notification`, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true, // 세션 정보를 보내기 위해 필요
    });

    setSockets({ chatSocket: newChatSocket, notificationSocket: newNotificationSocket });

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      newChatSocket.disconnect();
      newNotificationSocket.disconnect();
    };
  }, []);

  return sockets;
};

export default useSockets;
