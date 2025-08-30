import express, {ErrorRequestHandler, RequestHandler} from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';   
import path from 'path';   
import session from 'express-session'; 
import nunjucks from 'nunjucks';
import dotenv from 'dotenv';
import passport from 'passport';

dotenv.config(); // .env 파일을 읽어서 process.env 로 만듬
import pageRouter from './routes/page';
import authRouter from './routes/auth';
import passportConfig from './passport';
import postRouter from './routes/post';
import {sequelize} from './models';
import userRouter from './routes/user';
import webSocket from './socket';

import communityRouter from './routes/community';
import notificationRouter from './routes/notification'; // 추가
import methodOverride from 'method-override'; // 추가

const app = express();
passportConfig();
app.set('port',process.env.PORT || 8001);
app.set('view engine','html');
nunjucks.configure('views',{
    express:app,
    watch:true,
});
// 데이터베이스 연결
// sequelize.sync()는 데이터베이스와 모델을 동기화합니다.
// force: true 옵션을 사용하면 기존 테이블을 삭제하고 새로 생성합니다.
// 개발 중에는 유용하지만, 배포 시에는 false로 설정해야 합니다.
// sequelize.sync()는 비동기 함수이므로, then()과 catch()를 사용
sequelize.sync({ force: false }) // force: true로 설정하면 기존 테이블을 삭제하고 새로 생성합니다. 배포시에는 false로 설정해야 합니다. 하는 이유는 개발 중에만 테이블을 새로 만들기 위함입니다.
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan('dev')); // 로그를 남김, dev, combined, common, short, tiny , morgan(format) 형식으로도 가능, 개발시 dev, 배포시 combined
app.use(express.static(path.join(__dirname,'public'))); // 정적 파일 제공
// app.use('/img',express.static(path.join(__dirname,'uploads'))); // 정적 파일 제공
app.use('/uploads',express.static(path.join(__dirname,'uploads'))); // 정적 파일 제공
app.use(express.json());//   body-parser 대체, json 형식으로 데이터를 받음
app.use(express.urlencoded({extended:false})); // body-parser 대체
app.use(methodOverride('_method')); // _method 쿼리 파라미터 또는 폼 필드를 사용하여 HTTP 메서드를 오버라이드
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키를 암호화 하기 위한 키값

const sessionStore = new session.MemoryStore(); // 세션 저장소, 메모리 스토어를 사용합니다. 실제 배포 환경에서는 Redis나 MySQL 등의 외부 저장소를 사용하는 것이 좋습니다.

export const sessionMiddleware:RequestHandler = session({
    // 세션이 변경되지 않아도 세션 저장소에 다시 저장할지 여부
    // 일반적으로 false로 설정하여 불필요한 저장 작업을 방지합니다.
    resave: false,

    // 초기화되지 않은(새로 생성되었지만 수정되지 않은) 세션을 저장소에 저장할지 여부
    // false로 설정하면 사용자가 로그인하는 등 실제로 세션에 무언가 저장될 때만 세션을 생성하고 저장합니다.
    saveUninitialized: false,

    // 세션을 암호화하는 데 사용되는 비밀 키
    // 외부 공격으로부터 세션 데이터를 보호하는 중요한 값으로, 환경 변수에서 가져오는 것이 좋습니다.
    secret: process.env.COOKIE_SECRET!,
    store : sessionStore,

    // 세션 쿠키에 대한 설정
    cookie: {
        // 클라이언트 측 JavaScript에서 쿠키에 접근하지 못하도록 설정
        // XSS(크로스 사이트 스크립팅) 공격을 방어하는 데 도움을 줍니다.
        httpOnly: true,

        // HTTPS 연결에서만 쿠키를 전송할지 여부
        // 개발 환경에서는 false로 설정할 수 있지만, 운영 환경에서는 true로 설정해야 보안에 안전합니다.
        secure: false,
    },
});

export {sessionStore};

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());


import notificationRouter from './routes/notification';

console.log("newBranch");
app.use('/',pageRouter);
app.use('/auth',authRouter);
app.use('/post',postRouter);
app.use('/user',userRouter);
app.use('/community', communityRouter);
app.use('/notifications', notificationRouter); // 알림 라우터 추가

app.use((req,res,next)=>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다..`);
    error.status = 404;
    next(error);
});

const errorHandler :ErrorRequestHandler = (err,req,res,next)=>{
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};// 개발환경일때만 에러를 보여줌, 배포시에는 에러를 보여주지 않음
    res.status(err.status ||500);
    res.render('error');
}
app.use(errorHandler); // 에러 핸들러 미들웨어, 마지막에 위치해야함

export default app;


