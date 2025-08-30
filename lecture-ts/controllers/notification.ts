
import { RequestHandler } from 'express';
import { Notification } from '../models/notification';
import  User  from '../models/user';

// 알림 목록 조회 컨트롤러
export const getNotifications: RequestHandler = async (req, res, next) => {
    try {
        // 현재 로그인한 사용자가 받은 모든 알림을 조회
        const notifications = await Notification.findAll({
            where: { recipientId: req.user!.id }, // receiverId -> recipientId로 수정
            include: [{
                model: User,
                as: 'Sender',
                attributes: ['id', 'nick'], // profileImage 속성이 없어 제거
            }],
            order: [['createdAt', 'DESC']],
        });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 알림 읽음 처리 컨트롤러
export const markAsRead: RequestHandler = async (req, res, next) => {
    try {
        // 특정 알림을 읽음 상태로 변경
        const notification = await Notification.findOne({
            where: { id: req.params.id, recipientId: req.user!.id }, // receiverId -> recipientId로 수정
        });

        if (!notification) {
            return res.status(404).send('Notification not found.');
        }

        notification.read = true;
        await notification.save();

        res.send('success');
    } catch (error) {
        console.error(error);
        next(error);
    }
};
