import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/:roomId', authMiddleware, messageController.getMessagesByRoom);

export default router;
