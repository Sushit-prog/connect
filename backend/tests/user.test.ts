import { userService } from '../src/services/user.service';
import { User } from '../src/models/user.model';

describe('UserService', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('getAllUsers', () => {
    it('should return an empty array when no users exist', async () => {
      const users = await userService.getAllUsers();
      expect(users).toEqual([]);
    });

    it('should return all users excluding password', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      });

      const users = await userService.getAllUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('testuser');
      expect(users[0].email).toBe('test@example.com');
      expect(users[0].password).toBeUndefined();
    });
  });

  describe('getUserById', () => {
    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById('nonexistentid');
      expect(user).toBeNull();
    });

    it('should return user by id excluding password', async () => {
      const created = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      });

      const user = await userService.getUserById(created._id.toString());
      expect(user).not.toBeNull();
      expect(user?.username).toBe('testuser');
      expect(user?.password).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const user = await userService.createUser(userData);
      expect(user.username).toBe('newuser');
      expect(user.email).toBe('new@example.com');
    });
  });

  describe('deleteUser', () => {
    it('should return false for non-existent user', async () => {
      const result = await userService.deleteUser('nonexistentid');
      expect(result).toBe(false);
    });

    it('should return true when user is deleted', async () => {
      const created = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      });

      const result = await userService.deleteUser(created._id.toString());
      expect(result).toBe(true);

      const user = await User.findById(created._id);
      expect(user).toBeNull();
    });
  });
});
