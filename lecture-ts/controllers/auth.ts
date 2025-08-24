
import  User from '../models/user';
import  bcrypt from 'bcrypt';
import  passport from 'passport';
import { RequestHandler } from 'express';


const  join :RequestHandler = async (req,res,next)=>{
 const { nick, email,password} = req.body;

 try{
    const exUser = await User.findOne({where:{email}});
    if(exUser){
        return res.redirect('/join?error=exist');
    }   
    const hash = await bcrypt.hash(password,12);
    await User.create({
        email,
        nick,
        password:hash,
    });
    return res.redirect('/');
 }catch(error){
     console.error(error);
     next(error);
 }  ;
}
const login :RequestHandler= (req,res,next)=>{
    passport.authenticate('local',(authError: Error | null, user?: Express.User | false, info?: { message: string }) => {
        if (authError) {
            console.error(authError);
            return next(authError); // 500 에러
        }
        if (!user) {
            // 유저가 없거나 비밀번호가 틀렸을 때 (401 Unauthorized)
            return res.status(401).json({ message: info?.message });
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError); // 500 에러
            }
            // 로그인 성공. 사용자 정보를 JSON으로 반환
            return res.status(200).json(user);
        });
    })(req, res, next);
};
const logout :RequestHandler = (req,res,error)=>{ //로그아웃, req.logout() 메서드를 사용 
    req.logout(()=>{ // req.logout() 메서드를 사용, 세션을 제거
        res.redirect('/');
    })
}

const getMe: RequestHandler = (req, res, next) => {
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: '로그인이 필요합니다.' });
    }
};

export { join, login, logout, getMe };