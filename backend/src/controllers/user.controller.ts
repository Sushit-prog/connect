import { Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { AuthRequest } from '../types';

export const userController = {
  async getAllUsers(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await User.find().select('-password');
      res.status(200).json({
        success: true,
        data: users,
        message: 'Users retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: null,
        message: 'User creation - to be implemented',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: null,
        message: 'User update - to be implemented',
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'User deletion - to be implemented',
      });
    } catch (error) {
      next(error);
    }
  },
};
