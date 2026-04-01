import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/summary/:roomId', authMiddleware, aiController.getSummary);

export default router;
