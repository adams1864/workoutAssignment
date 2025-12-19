const authService = require('../../../src/services/authService');
const prisma = require('../../../src/config/database');
const bcrypt = require('bcryptjs');
const { ConflictError, UnauthorizedError } = require('../../../src/utils/errors');

// Mock Prisma and bcrypt
jest.mock('../../src/config/database', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('bcryptjs');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'CLIENT',
        createdAt: new Date()
      };

      prisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await authService.register('test@example.com', 'password123', 'CLIENT');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictError if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '123', email: 'test@example.com' });

      await expect(
        authService.register('test@example.com', 'password123', 'CLIENT')
      ).rejects.toThrow(ConflictError);
    });

    it('should validate role and throw error for invalid role', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.register('test@example.com', 'password123', 'INVALID')
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should successfully login user with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'CLIENT'
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password123');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedError for invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login('wrong@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'CLIENT'
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'CLIENT'
      };

      const token = authService.generateToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'CLIENT'
      };

      const token = authService.generateToken(mockUser);
      const decoded = authService.verifyToken(token);

      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('should throw UnauthorizedError for invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid.token.here');
      }).toThrow(UnauthorizedError);
    });
  });
});
