import { User, IUser } from '../models/user.model';

export const userService = {
  async getAllUsers(): Promise<IUser[]> {
    const users = await User.find().select('-password');
    return users;
  },

  async getUserById(id: string): Promise<IUser | null> {
    const user = await User.findById(id).select('-password');
    return user;
  },

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email }).select('+password');
    return user;
  },

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = await User.create(userData);
    return user;
  },

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');
    return user;
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  },

  async updateLastSeen(id: string): Promise<void> {
    await User.findByIdAndUpdate(id, { lastSeen: new Date() });
  },
};
