import app, { sessionMiddleware ,sessionStore } from './app';
import webSocket from './socket';


const server = app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기중');
});

webSocket(server, app, sessionMiddleware);// 소켓 서버 설정