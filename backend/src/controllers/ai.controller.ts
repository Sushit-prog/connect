import { Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { Message } from '../models/Message';
import { AuthRequest } from '../types';

export const aiController = {
  async getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;

      const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('sender', 'username')
        .lean();

      if (messages.length === 0) {
        res.status(200).json({
          success: true,
          data: {
            summary: 'No vibes to check yet - the chat is empty! 💭',
            messageCount: 0,
          },
        });
        return;
      }

      const summary = await aiService.generateVibeSummary(
        messages.reverse() as unknown as Parameters<typeof aiService.generateVibeSummary>[0]
      );

      res.status(200).json({
        success: true,
        data: {
          summary,
          messageCount: messages.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
