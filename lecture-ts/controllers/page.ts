import  Post from  '../models/post';
import  User from  '../models/user';
import  Hashtag from  '../models/hashtag';
import Community from  '../models/community';
import { RequestHandler } from 'express';
import { title } from 'process';

const renderProfile:RequestHandler  = (req,res,next)=>{
    // 서비스를 호출출
    res.render('profile',{title : '내 정보 - NodeBird'});
};

const renderJoin :RequestHandler  = (req,res,next)=>{
    res.render('join', {title : '회원 가입 - NodeBird'});
};

const renderMain :RequestHandler  = async (req,res,next)=>{
    try{
        const posts = await Post.findAll({
            include:{
                model:User,
                attributes:['id','nick'],
            },
            order : [['createdAt','DESC']],
        })
        res.render('main',{
            title : 'NodeBird',
            twits : posts,
        });// 서비스를 호출 twits = posts  -> twits로 넘겨줌
    }catch(error){
        console.error(error);
        next(error);
    }
};

//라우터 -> 컨트롤러 -> 서비스(요청,응답 모름)


const renderHashtag :RequestHandler  = async(req,res,next)=>{
    const query = req.query.hashtag as string; // 쿼리스트링에서 hashtag를 가져옴   // hashtag?hashtag=고양이
    if(!query){
        return res.redirect('/');
    }

    try{
        const hashtag = await Hashtag.findOne({where : {title:query}});
        let posts : Post[] = [];
        if(hashtag){
            posts =  await hashtag.getPosts({
                include :[{model: User, attributes:['id','nick']}],
                order : [['createdAt','DESC']]
            });
        }
        res.render('main',{
            title: `${query} | NodeBird`,
            twits : posts,
        })
    }catch(error){
        console.error(error);
        next(error);
    }
}

const renderCommunity:RequestHandler = async(req,res,next)=>{

    try {
        const posts = await Community.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            order: [['createdAt', 'DESC']],
        });
        res.render('community', {// 커뮤니티 페이지 렌더링
            title: '자유게시판 - NodeBird',
            posts: posts,
            user: req.user, // 현재 로그인한 사용자 정보를 템플릿으로 전달
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}


const renderCommunityForm:RequestHandler = (req, res) => {
    res.render('community-form', { title: '새 글 작성 - NodeBird' });
};

const renderCommunityEditForm: RequestHandler = async (req, res, next) => {
    const postId = req.params.id; // URL 파라미터에서 게시글 ID를 가져옵니다.
    try {
        // 데이터베이스에서 해당 ID의 게시글을 찾습니다.
        const post = await Community.findOne({ where: { id: postId } });

        // 게시글이 존재하지 않으면 404 에러를 응답합니다.
        if (!post) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        // 수정 폼 페이지를 렌더링하고, 게시글 데이터를 템플릿으로 전달합니다.
        res.render('community-form', {
            title: '게시글 수정 - NodeBird',
            post: post, // 수정할 게시글 데이터
            isEdit: true, // 수정 모드임을 템플릿에 알림
            user: req.user, // 현재 로그인한 사용자 정보 (권한 확인용)
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export { renderProfile, renderJoin, renderMain, renderHashtag ,renderCommunity, renderCommunityForm, renderCommunityEditForm};