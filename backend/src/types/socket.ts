import { Server as SocketIOServer, Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export interface JoinRoomPayload {
  roomId: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface SendMessagePayload {
  roomId: string;
  message: string;
  senderName?: string;
}

export interface ReceiveMessagePayload {
  userId: string;
  username?: string;
  message: string;
  timestamp: Date;
  roomId: string;
  messageId?: string;
}

export interface TypingPayload {
  roomId: string;
  isTyping: boolean;
}

export interface ServerToClientEvents {
  receive_message: (data: ReceiveMessagePayload) => void;
  user_typing: (data: { userId: string; username?: string; isTyping: boolean }) => void;
  user_joined: (data: { userId: string; roomId: string }) => void;
  user_left: (data: { userId: string; roomId: string }) => void;
  receive_ai_summary: (data: { roomId: string; summary: string; messageCount: number }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  send_message: (data: SendMessagePayload) => void;
  typing: (data: { roomId: string; isTyping: boolean }) => void;
  get_ai_summary: (roomId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username?: string;
}

export type SocketServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
