import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { generateToken } from '../utils/jwt';

interface UserResponse {
  _id: string;
  username: string;
  email: string;
  avatar: string | null;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: UserResponse;
  token: string;
}

export const authService = {
  async register(username: string, email: string, password: string): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id.toString());

    const { password: _pwd, ...userData } = user.toObject();

    return {
      user: userData as unknown as UserResponse,
      token,
    };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id.toString());

    const { password: _pwdHash, ...userData } = user.toObject();

    return {
      user: userData as unknown as UserResponse,
      token,
    };
  },

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  },
};
