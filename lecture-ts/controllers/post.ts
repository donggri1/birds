import Post from '../models/post';
import Hashtag from '../models/hashtag';
import User from '../models/user'; // User 모델 import 추가
import { RequestHandler } from 'express';

const afterUploadImage: RequestHandler = (req, res) => {
    console.log(req.file);
    // const originalUrl = req.file?.location! ; // multerS3를 사용하면 req.file에 location이 생김
    // const url = originalUrl.replace(/\/original\//,`/thumb/`); // 원본 이미지 URL에서 썸네일 URL로 변경
    // res.json({url , originalUrl}); // multerS3를 사용하면 req.file에 location이 생김
    if (req.file) {
        res.json({ url: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ message: '이미지 업로드 실패' });
    }
};

const uploadPost: RequestHandler = async (req, res, next) => {
    //req,body.content, req.body.img
    try {
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.user?.id,
        });
        const hashtags: string[] | null = req.body.content.match(/#[^\s#]*/g);
        if (hashtags) {
            const result = await Promise.all(hashtags.map((tag) => {
                return Hashtag.findOrCreate({
                    where: { title: tag.slice(1).toLowerCase() }
                })
            }));
            console.log(result, 'result');
            await post.addHashtags(...result.map(r => r[0]));
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

/**
 * 모든 게시글을 조회하는 컨트롤러
 * 작성자 정보를 포함하여 최신순으로 정렬된 게시글 목록을 반환합니다.
 */
const getPosts: RequestHandler = async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: User, // 작성자 정보를 포함
                attributes: ['id', 'nick'], // 작성자의 id와 닉네임만 선택
            },
            order: [['createdAt', 'DESC']], // 최신순으로 정렬
        });
        res.json(posts);
    } catch (err) {
        console.error(err);
        next(err);
    }
};

/**
 * 게시글을 삭제하는 컨트롤러
 * 게시글 ID를 받아 해당 게시글을 삭제합니다.
 * 요청을 보낸 사용자가 작성자인지 확인합니다.
 */
 const deletePost: RequestHandler = async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.id } });
        if (!post) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }
        if (post.UserId  !== req.user?.id) {
            return res.status(403).send('삭제 권한이 없습니다.');
        }
        await Post.destroy({ where: { id: req.params.id, UserId: req.user?.id } });
        res.status(200).json({ PostId: parseInt(req.params.id, 10) });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export { afterUploadImage, uploadPost, getPosts ,deletePost };