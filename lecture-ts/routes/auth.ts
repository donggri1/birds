import express from 'express';
import passport from 'passport';

import { isLoggedIn, isNotLoggedIn } from '../middlewares';
import { join, login, logout ,getMe } from '../controllers/auth';

const router = express.Router();

// GET /auth/me
router.get('/me', isLoggedIn, getMe);

// POST /auth/join
router.post('/join', isNotLoggedIn, join); 

// POST /auth/login
router.post('/login', isNotLoggedIn, login);

// GET /auth/logout
router.get('/logout', isLoggedIn, logout);

router.get('/kakao',passport.authenticate('kakao'));



// /auth/kakao/callback
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/?error=카카오로그인 실패',
}), (req, res) => {
    // res.redirect('/');
    res.redirect('http://localhost:5173'); // 성공 시에는 / 로 이동
});



export default router;