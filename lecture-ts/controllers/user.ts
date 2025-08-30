import User from '../models/user';
import { Notification } from '../models/notification'; // Notification 모델 import
import { follow as followService } from '../services/user';

import { RequestHandler } from 'express';

const follow: RequestHandler = async (req, res, next) => {
    try {
        const result = await followService(req.user!.id, req.params.id);
        if (result === 'ok') {
            // 알림 생성
            await Notification.create({
                type: 'follow',
                content: `${req.user!.nick}님이 회원님을 팔로우하기 시작했습니다.`,
                recipientId: parseInt(req.params.id, 10), // receiverId -> recipientId로 수정
                senderId: req.user!.id,
                link: `/profile?userId=${req.user!.id}` // 팔로우한 사람의 프로필로 이동
            });

            // 실시간 알림 전송
            const io = req.app.get('io');
            io.of('/notification').to(req.params.id).emit('new_notification', {
                message: `${req.user!.nick}님이 회원님을 팔로우하기 시작했습니다.`
            });

            res.send('success');
        } else if (result === 'no User') {
            res.status(404).send('no User');
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export { follow };