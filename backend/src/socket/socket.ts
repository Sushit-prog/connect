import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
  AuthenticatedSocket,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../types/socket';
import { Message } from '../models/Message';
import { aiService } from '../services/ai.service';

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const initSocket = (
  httpServer: HTTPServer
): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> => {
  io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      (socket.handshake.auth as { token?: string }).token ||
      (socket.handshake.query as { token?: string }).token;

    if (!token) {
      socket.emit('error', { message: 'Authentication required' });
      return next(new Error('Authentication required'));
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      socket.userId = decoded.userId;
      next();
    } catch {
      socket.emit('error', { message: 'Invalid token' });
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    void socket.join(`user:${socket.userId}`);

    socket.on('join_room', (roomId: string) => {
      void socket.join(`room:${roomId}`);
      console.log(`👤 User ${socket.userId} joined room: ${roomId}`);

      socket.to(`room:${roomId}`).emit('user_joined', {
        userId: socket.userId as string,
        roomId,
      });
    });

    socket.on('leave_room', (roomId: string) => {
      void socket.leave(`room:${roomId}`);
      console.log(`👤 User ${socket.userId} left room: ${roomId}`);

      socket.to(`room:${roomId}`).emit('user_left', {
        userId: socket.userId as string,
        roomId,
      });
    });

    socket.on('send_message', async ({ roomId, message }) => {
      try {
        const savedMessage = await Message.create({
          sender: socket.userId,
          content: message,
          roomId,
        });

        await savedMessage.populate('sender', 'username avatar');

        const senderData = savedMessage.sender as unknown as { username: string; avatar?: string };

        io.to(`room:${roomId}`).emit('receive_message', {
          userId: socket.userId as string,
          username: senderData.username,
          message,
          timestamp: savedMessage.createdAt,
          roomId,
          messageId: savedMessage._id.toString(),
        });
      } catch (error) {
        console.error('Failed to save message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(`room:${roomId}`).emit('user_typing', {
        userId: socket.userId as string,
        isTyping,
      });
    });

    socket.on('get_ai_summary', async (roomId: string) => {
      try {
        const messages = await Message.find({ roomId })
          .sort({ createdAt: -1 })
          .limit(20)
          .populate('sender', 'username')
          .lean();

        if (messages.length === 0) {
          socket.emit('receive_ai_summary', {
            roomId,
            summary: 'No vibes to check yet - the chat is empty! 💭',
            messageCount: 0,
          });
          return;
        }

        const summary = await aiService.generateVibeSummary(
          messages.reverse() as unknown as Parameters<typeof aiService.generateVibeSummary>[0]
        );

        socket.emit('receive_ai_summary', {
          roomId,
          summary,
          messageCount: messages.length,
        });
      } catch (error) {
        console.error('Failed to generate vibe summary:', error);
        socket.emit('error', { message: 'Failed to generate vibe summary' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.userId} (${reason})`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToUser = (
  userId: string,
  event: keyof ServerToClientEvents,
  data: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>[0]
): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data as never);
  }
};

export const emitToRoom = (
  roomId: string,
  event: keyof ServerToClientEvents,
  data: Parameters<ServerToClientEvents[keyof ServerToClientEvents]>[0]
): void => {
  if (io) {
    io.to(`room:${roomId}`).emit(event, data as never);
  }
};
