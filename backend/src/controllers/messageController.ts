import { Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { AuthRequest } from '../types';

export const messageController = {
  async getMessagesByRoom(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const skip = (page - 1) * limit;

      const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'username avatar')
        .lean();

      const total = await Message.countDocuments({ roomId });

      res.status(200).json({
        success: true,
        data: messages.reverse(),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
