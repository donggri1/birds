
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { RequestHandler } from 'express'; // RequestHandler 타입을 임포트합니다.
import session from 'express-session';
import User from './models/user'; // User 모델을 가져옵니다.

// Socket.io를 이용한 실시간 채팅 서버 설정
export default (server: HttpServer, app: any, sessionMiddleware: RequestHandler) => {
    // Socket.io 서버 인스턴스 생성
    const io = new Server(server, {
        path: '/socket.io', // 소켓 연결 경로 설정
        cors: {
            origin: '*', // 모든 도메인에서의 접근 허용
            credentials: true, // 인증 정보 전달 허용
        }
    });
    app.set('io', io); // app 객체에 Socket.io 인스턴스 저장

    // 세션 미들웨어를 Socket.io에서 사용할 수 있도록 래핑
    const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);
    io.use(wrap(sessionMiddleware));

    // 클라이언트 연결 이벤트 처리
    io.on('connection', async (socket: any) => {
        console.log('새로운 클라이언트 접속', socket.id);
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

                // 사용자 입장 처리
                console.log(`${socket.user.nick}님이 입장하셨습니다.`);
                io.emit('join', {
                    user: 'system',
                    chat: `${socket.user.nick}님이 입장하셨습니다.`,
                });

                // 연결 종료 이벤트 처리
                socket.on('disconnect', () => {
                    console.log('클라이언트 접속 해제', socket.id);
                    if (req.session && req.session.user) {
                        io.emit('exit', {
                            user: 'system',
                            chat: `${socket.user.nick}님이 퇴장하셨습니다.`,
                        });
                    }
                });

                // 채팅 메시지 이벤트 처리
                socket.on('chat', (data: any) => {
                    // [수정] req.session 대신 socket.user 객체의 존재 여부를 확인합니다.
                    if (socket.user) {
                        io.emit('chat', {
                            // [최종 수정] .toJSON()을 호출하여 순수한 데이터 객체만 클라이언트로 전송합니다.
                            user: socket.user.toJSON(),
                            chat: data.chat,
                        });
                    }
                });
        }catch (error) {
            console.error('소켓 연결 중 오류 발생:', error);
            socket.emit('error', '소켓 연결 중 오류가 발생했습니다.');
            socket.disconnect();
            return;
        }
    });
};