
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { RequestHandler } from 'express';
import User from './models/user';

export default (server: HttpServer, app: any, sessionMiddleware: RequestHandler) => {
    const io = new Server(server, {
        path: '/socket.io',
        cors: {
            origin: '*',
            credentials: true,
        }
    });
    app.set('io', io);

    const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);
    
    // 채팅 네임스페이스
    const chat = io.of('/chat');
    chat.use(wrap(sessionMiddleware));
    chat.on('connection', async (socket: any) => {
        const req = socket.request;
        try {
            const userId = req.session.passport?.user;
            if (!userId) {
                socket.emit('error', '로그인이 필요합니다.');
                socket.disconnect();
                return;
            }
            const user = await User.findOne({ where: { id: userId } });
            if (!user) {
                socket.emit('error', '사용자 정보를 찾을 수 없습니다.');
                socket.disconnect();
                return;
            }
            socket.user = user;

            // 새로운 사용자가 접속했음을 모든 클라이언트에게 알립니다.
            chat.emit('join', {
                user: 'System',
                chat: `${socket.user.nick}님이 입장하셨습니다.`,
            });

            socket.on('disconnect', () => {
                console.log('채팅 클라이언트 접속 해제', socket.id);
                // 사용자가 접속을 해제했음을 모든 클라이언트에게 알립니다.
                chat.emit('exit', {
                    user: 'System',
                    chat: `${socket.user.nick}님이 퇴장하셨습니다.`,
                });
            });

            socket.on('chat', (data: any) => {
                if (socket.user) {
                    chat.emit('chat', {
                        user: socket.user.toJSON(),
                        chat: data.chat,
                    });
                }
            });
        } catch (error) {
            console.error('채팅 소켓 연결 중 오류 발생:', error);
            socket.emit('error', '채팅 소켓 연결 중 오류가 발생했습니다.');
            socket.disconnect();
        }
    });

    // 알림 네임스페이스
    const notification = io.of('/notification');
    notification.use(wrap(sessionMiddleware));
    notification.on('connection', (socket: any) => {
        const req = socket.request;
        const userId = req.session.passport?.user;

        if (userId) {
            // 로그인한 사용자를 자신의 ID를 이름으로 하는 방에 입장시킴
            socket.join(userId.toString());
            console.log(`${userId} 사용자가 알림 소켓에 연결되었습니다. 방에 입장합니다.`);
        } else {
            socket.emit('error', '로그인이 필요합니다.');
            socket.disconnect();
            return;
        }

        socket.on('disconnect', () => {
            console.log('알림 클라이언트 접속 해제', socket.id);
            if(userId) {
                socket.leave(userId.toString());
            }
        });
    });
};