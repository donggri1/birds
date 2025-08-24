import express from 'express';
import {
    createCommunityPost, // SSR용
    getCommunityPost,    // SSR용
    updateCommunityPost, // SSR용
    deleteCommunityPost, // SSR용
    renderEditForm,      // SSR용
    createComment,       // SSR용
    deleteComment,       // SSR용
    // --- API용 ---
    apiGetPosts,
    apiGetPost,
    apiCreatePost,
    apiUpdatePost,
    apiDeletePost,
    apiCreateComment,
    apiDeleteComment
} from '../controllers/community';
import { isLoggedIn } from '../middlewares';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// uploads 폴더 확인 및 생성
try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

// multer 설정
let upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            // 파일명 인코딩 문제 해결
            const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
            const ext = path.extname(originalname);
            cb(null, path.basename(originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// ===============================================
// React SPA를 위한 API 라우트
// ===============================================
router.get('/api', apiGetPosts); // 모든 게시글 조회
router.post('/api', isLoggedIn, upload.single('img'), apiCreatePost); // 게시글 생성
router.get('/api/:id', apiGetPost); // 특정 게시글 조회
router.put('/api/:id', isLoggedIn, apiUpdatePost); // 특정 게시글 수정
router.delete('/api/:id', isLoggedIn, apiDeletePost); // 특정 게시글 삭제
router.post('/api/:id/comments', isLoggedIn, apiCreateComment); // 댓글 생성
router.delete('/api/:id/comments/:commentId', isLoggedIn, apiDeleteComment); // 댓글 삭제


// ===============================================
// 기존 Nunjucks SSR(서버 사이드 렌더링)용 라우트
// ===============================================
try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

 upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', (req, res, next) => { res.render('community', { title: '커뮤니티' }); });
router.get('/new', isLoggedIn, (req, res, next) => { res.render('community-form', { title: '새 게시글 작성' }); });
router.post('/', isLoggedIn, upload.single('img'), createCommunityPost);
router.get('/:id', getCommunityPost);
router.get('/:id/edit', isLoggedIn, renderEditForm);
router.post('/:id', isLoggedIn, updateCommunityPost);
router.post('/:id/delete', isLoggedIn, deleteCommunityPost);
router.post('/:id/comments', isLoggedIn, createComment);
router.delete('/:id/comments/:commentId', isLoggedIn, deleteComment);

export default router;