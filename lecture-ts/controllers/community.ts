import { RequestHandler } from 'express';
import Community from '../models/community';
import { User, Comment, Notification } from '../models'; // Notification 모델 추가
import { Op } from 'sequelize';

//<editor-fold desc="기존 서버 사이드 렌더링(SSR) 컨트롤러">

const createCommunityPost: RequestHandler = async (req, res, next) => {
    const { title, content } = req.body;
    const userId = req.user?.id;
    const img = req.file?.filename;

    if (!userId) {
        return res.status(403).send('로그인이 필요합니다.');
    }

    try {
        await Community.create({
            title,
            content,
            img,
            UserId: userId,
        });
        res.redirect('/community');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updateCommunityPost: RequestHandler = async (req, res, next) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user?.id;

    try {
        const post = await Community.findOne({ where: { id: postId } });

        if (!post) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        if (post.UserId !== userId) {
            return res.status(403).send('게시글을 수정할 권한이 없습니다.');
        }

        await Community.update({ title, content }, { where: { id: postId } });
        res.redirect('/community');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const deleteCommunityPost: RequestHandler = async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user?.id;

    try {
        const post = await Community.findOne({ where: { id: postId } });

        if (!post) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        if (post.UserId !== userId) {
            return res.status(403).send('게시글을 삭제할 권한이 없습니다.');
        }

        await Community.destroy({ where: { id: postId } });
        res.redirect('/community');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getCommunityPost: RequestHandler = async (req, res, next) => {
    try {
        const post = await Community.findOne({
            where: { id: req.params.id },
            include: [{
                model: User,
                attributes: ['id', 'nick'],
            },
            {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['id', 'nick'],
                }],
                order: [['createdAt', 'ASC']],
            },
            ],
        });

        if (!post) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }
        res.render('community-detail', {
            title: post.title,
            post,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const renderEditForm: RequestHandler = async (req, res, next) => {
    try {
        const post = await Community.findOne({ where: { id: req.params.id } });
        if (!post) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }
        if (post.UserId !== req.user?.id) {
            return res.status(403).send('게시글을 수정할 권한이 없습니다.');
        }
        res.render('community-form', {
            title: '게시글 수정',
            post,
            isEdit: true,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const createComment: RequestHandler = async (req, res, next) => {
    try {
        const postId = parseInt(req.params.id as string, 10);
        const { content } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).send('로그인이 필요합니다.');
        }

        if (!content) {
            return res.status(400).send('댓글 내용을 입력해주세요.');
        }

        await Comment.create({
            content,
            UserId: userId,
            CommunityId: postId,
        });

        res.redirect(`/community/${postId}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const deleteComment: RequestHandler = async (req, res, next) => {
    try {
        const commentId = parseInt(req.params.commentId as string, 10);
        const postId = parseInt(req.params.id as string, 10);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).send('로그인이 필요합니다.');
        }

        const comment = await Comment.findOne({ where: { id: commentId } });

        if (!comment) {
            return res.status(404).send('댓글을 찾을 수 없습니다.');
        }

        if (comment.UserId !== userId) {
            return res.status(403).send('댓글을 삭제할 권한이 없습니다.');
        }

        await Comment.destroy({ where: { id: commentId } });

        res.redirect(`/community/${postId}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

//</editor-fold>

//<editor-fold desc="React API용 컨트롤러">

export const apiGetPosts: RequestHandler = async (req, res, next) => {
    try {
        const posts = await Community.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick'],
            },
            order: [['createdAt', 'DESC']],
        });
        res.json(posts);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const apiGetPost: RequestHandler = async (req, res, next) => {
    try {
        const postId = parseInt(req.params.id, 10);
        const post = await Community.findOne({
            where: { id: postId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'nick'],
                },
                {
                    model: Comment,
                    include: [{
                        model: User,
                        attributes: ['id', 'nick'],
                    }],
                    order: [['createdAt', 'ASC']],
                },
            ],
        });

        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 이전 글 찾기
        const prevPost = await Community.findOne({
            where: { id: { [Op.lt]: postId } }, // op.lt는 less than (작다) op는 sequelize에서 제공하는 연산자, lt는 less than
            order: [['id', 'DESC']],
            attributes: ['id', 'title'],
        });

        // 다음 글 찾기
        const nextPost = await Community.findOne({
            where: { id: { [Op.gt]: postId } },
            order: [['id', 'ASC']],
            attributes: ['id', 'title'],
        });

        // 현재 게시글 정보와 이전/다음 글 정보를 함께 응답
        res.json({
            post,
            prevPost,
            nextPost,
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const apiCreatePost: RequestHandler = async (req, res, next) => {
    const { title, content } = req.body;
    const userId = req.user?.id;
    const img = req.file?.filename;
    if (!userId) {
        return res.status(403).json({ message: '로그인이 필요합니다.' });
    }

    try {
        const post = await Community.create({
            title,
            content,
            img,
            UserId: userId,
        });
        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const apiUpdatePost: RequestHandler = async (req, res, next) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user?.id;

    try {
        const post = await Community.findOne({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        if (post.UserId !== userId) {
            return res.status(403).json({ message: '게시글을 수정할 권한이 없습니다.' });
        }
        await Community.update({ title, content }, { where: { id: postId } });
        const updatedPost = await Community.findOne({ where: { id: postId } });
        res.json(updatedPost);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const apiDeletePost: RequestHandler = async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user?.id;

    try {
        const post = await Community.findOne({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        if (post.UserId !== userId) {
            return res.status(403).json({ message: '게시글을 삭제할 권한이 없습니다.' });
        }
        await Community.destroy({ where: { id: postId } });
        res.status(200).json({ message: '게시글이 삭제되었습니다.', postId });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const apiCreateComment: RequestHandler = async (req, res, next) => {
    try {
        const postId = parseInt(req.params.id as string, 10); // 주소에서 게시글 ID를 가져옵니다.
        const { content } = req.body; // 요청 본문에서 댓글 내용을 가져옵니다.
        const userId = req.user?.id; // 로그인한 사용자의 ID를 가져옵니다.

        // 로그인하지 않은 경우 에러 처리
        if (!userId) {
            return res.status(403).json({ message: '로그인이 필요합니다.' });
        }
        // 댓글 내용이 없는 경우 에러 처리
        if (!content) {
            return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
        }

        // Step 1: 댓글을 데이터베이스에 생성합니다.
        const comment = await Comment.create({
            content,
            UserId: userId,
            CommunityId: postId,
        });

        // Step 2: 알림을 보내기 위해 원본 게시글을 찾습니다.
        const post = await Community.findOne({ where: { id: postId } });


        // Step 3: 게시글이 존재하고, 게시글 작성자와 댓글 작성자가 다른 경우에만 알림을 생성합니다.
        // (자신이 자기 게시글에 댓글을 달 때는 알림을 보낼 필요가 없습니다.)
        if (post && post.UserId !== userId) {
            // 데이터베이스에 알림 저장
            const notification = await Notification.create({
                type: 'comment', // 알림 종류: 댓글
                content: `'${post.title}' 게시글에 새로운 댓글이 달렸습니다.`, // 알림 메시지
                read: false, // 초기에는 읽지 않은 상태(false)
                recipientId: post.UserId, // 알림을 받을 사람: 게시글 작성자
                senderId: userId,        // 알림을 보낸 사람: 댓글 작성자
                link: `/community/${postId}`, // 알림 클릭 시 이동할 경로
            });

            // Step 3-1: 실시간으로 알림을 전송합니다.
            const io = req.app.get('io');
            // 게시글 작성자의 ID를 이름으로 가진 방(room)에만 이벤트를 보냅니다.
            io.of('/notification').to(post.UserId.toString()).emit('new_notification', notification); //emit = send new_notification라는 이벤트를 보냄
        }

        // Step 4: 성공적으로 생성된 댓글 정보를 클라이언트에게 반환합니다.
        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const apiDeleteComment: RequestHandler = async (req, res, next) => {
    try {
        const commentId = parseInt(req.params.commentId as string, 10);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({ message: '로그인이 필요합니다.' });
        }

        const comment = await Comment.findOne({ where: { id: commentId } });
        if (!comment) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }
        if (comment.UserId !== userId) {
            return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });
        }

        await Comment.destroy({ where: { id: commentId } });
        res.status(200).json({ message: '댓글이 삭제되었습니다.', commentId });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

//</editor-fold>

// 기존 SSR용 export와 새로운 API용 export를 함께 내보냅니다.
export {
    createCommunityPost, getCommunityPost, updateCommunityPost, deleteCommunityPost, renderEditForm, createComment, deleteComment
};