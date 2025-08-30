
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// 알림 데이터 타입을 정의합니다.
interface Notification {
  id: number;
  content: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

// 컴포넌트 props 타입을 정의합니다.
interface NotificationDropdownProps {
  onClose: () => void; // 드롭다운을 닫는 함수
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 컴포넌트 마운트 시 알림 목록을 가져옵니다.
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get<Notification[]>('/api/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('알림 목록을 가져오는데 실패했습니다.', error);
      }
    };
    fetchNotifications();
  }, []);

  // 알림을 읽음 상태로 변경하는 함수
  const handleMarkAsRead = async (id: number) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      // 상태를 업데이트하여 UI에 반영
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('알림을 읽음 처리하는데 실패했습니다.', error);
    }
  };

  return (
    <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 font-bold border-b">알림</div>
      <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <li key={notification.id} className={`${notification.read ? 'bg-gray-50' : 'bg-white'}`}>
              <Link 
                to={notification.link || '#'}
                className="block p-4 hover:bg-gray-100"
                onClick={() => {
                  handleMarkAsRead(notification.id);
                  onClose(); // 링크 클릭 시 드롭다운 닫기
                }}
              >
                <p className="text-sm text-gray-700">{notification.content}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
              </Link>
            </li>
          ))
        ) : (
          <li className="p-4 text-center text-sm text-gray-500">새로운 알림이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
