import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';

export const authController = {
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Username, email, and password are required',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Password must be at least 6 characters',
        });
        return;
      }

      const result = await authService.register(username, email, password);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(400).json({
          success: false,
          error: 'Registration Failed',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  },

  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Email and password are required',
        });
        return;
      }

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        res.status(401).json({
          success: false,
          error: 'Authentication Failed',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  },
};
