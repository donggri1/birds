import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { afterUploadImage, uploadPost, getPosts, deletePost } from '../controllers/post'; // getPosts, deletePost import 추가
import { isLoggedIn } from '../middlewares';

const router = express.Router();

// GET /post (게시글 조회)
router.get('/', getPosts);

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
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

// POST /post/img
router.post('/img', isLoggedIn, upload.single('img'), afterUploadImage); 

// POST /post
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), uploadPost);

// POST /post/:id/delete (게시글 삭제)
router.post('/:id/delete', isLoggedIn, deletePost);

export default router;