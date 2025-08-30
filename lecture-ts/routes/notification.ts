
import express from 'express';
import { isLoggedIn } from '../middlewares';
import { getNotifications, markAsRead } from '../controllers/notification';

const router = express.Router();

// GET /notifications - 내 알림 목록 조회
router.get('/', isLoggedIn, getNotifications);

// PATCH /notifications/:id/read - 특정 알림 읽음 처리
router.patch('/:id/read', isLoggedIn, markAsRead);

export default router;
