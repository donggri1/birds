import passport from 'passport';
import {Strategy as LocalStrategy}  from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/user';

export default  ()=>{
    passport.use(new LocalStrategy({
        usernameField :'email',
        passwordField : 'password',
        passReqToCallback: false
    },async ( email, password, done)=>{ //done(에러,성공,실패)
        try{
            const exUser = await User.findOne({where:{email}});
            if(exUser){
                // 로컬 가입자만 비밀번호 비교
                if (exUser.password) {
                    const result = await bcrypt.compare(password,exUser.password);
                    if(result){
                        done(null,exUser);
                    }else{
                        done(null,false,{message:'비밀번호가 일치하지 않습니다.'});
                    }
                } else {
                    // 소셜 로그인 가입자일 경우
                    done(null, false, { message: '카카오로 가입된 회원입니다. 카카오 로그인을 이용해주세요.' });
                }
            }else{
                done(null,false,{message:'가입되지 않은 회원입니다.'});
            }
        }catch(error){
            console.error(error);
            done(error);
        }
    }));
};