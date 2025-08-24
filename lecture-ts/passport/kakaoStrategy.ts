import  passport from "passport";
import  {Strategy as KakaoStrategy} from "passport-kakao";
import  User from "../models/user";

export default () => {
    passport.use(new KakaoStrategy({
        clientID : process.env.KAKAO_ID!,
        callbackURL:'/auth/kakao/callback',
    }, async(accessToken, refreshToken, profile, done)=>{
        console.log('profile',profile);
        try{
            const exUser = await User.findOne({
                where:{snsId:profile.id,provider:'kakao'}
            });
            console.log('엑스유저임',exUser);

            if(exUser){
                done(null,exUser);
            }else{
                const newUser = await User.create({
                    email : profile._json?.kakao_account?.email,
                    nick:profile.displayName,
                    snsId:profile.id,
                    provider:'kakao',
                })
                done(null,newUser);
            }
        }catch(error){
            console.error(error);
            done(error);
        }
    }));
};