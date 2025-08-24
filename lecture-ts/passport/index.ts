import passport from 'passport';
import local from './localStrategy';
import kakao from './kakaoStrategy';
import User from '../models/user';

export default () => {

    // 세션에 사용자 id만 저장 serializeUser는 req.login() 메서드가 호출될 때 실행
    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });

    // 매 요청 시마다 실행, 세션에 저장된 id로 사용자 정보 조회 deserializeUser는 req.user에 사용자 정보 넣어줌
    passport.deserializeUser((id : number,done)=>{
        User.findOne({
            where:{id},
            include :[
                {
                    model :User,
                    attributes : ['id','nick'],
                    as : 'Followers',
                }, // 팔로잉
                {
                    model : User,
                    attributes : ['id','nick'],
                    as: 'Followings',
                } //팔로워
            ]
        })
            .then((user)=>done(null,user)) 
            .catch(err=>done(err));
    });

    // 전략 등록
    local();
    // 위의 local() 함수 호출로 로컬 전략이 등록됨 그다음 아래의 kakao() 함수 호출로 카카오 전략이 등록됨 local()과 kakao() 함수는 각각의 전략을 설정하는 역할을 함
    kakao();
};
