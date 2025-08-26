// ABOUTME: Integration tests for AuthRepository with mocked database
// ABOUTME: Tests authentication repository implementation with Prisma mocked

import { PrAuthRepository } from '@/backend/common/infrastructures/repositories/PrAuthRepository';
import { AuthenticationResult } from '@/backend/auth/dtos/UserDto';

// Create mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
} as jest.Mocked<{ user: { findUnique: jest.Mock } }>;

describe('PrAuthRepository Integration Tests', () => {
  let repository: PrAuthRepository;

  beforeEach(() => {
    repository = new PrAuthRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      // Arrange
      const hashedPassword = await import('bcryptjs').then((bcrypt) =>
        bcrypt.hash('testpassword123', 12)
      );

      const mockUser = {
        id: '1',
        userId: 'testuser001',
        password: hashedPassword,
        name: 'Test User',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result: AuthenticationResult = await repository.authenticateUser(
        'testuser001',
        'testpassword123'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.userId).toBe('testuser001');
      expect(result.user?.id).toBe('1');
      expect(result.user?.name).toBe('Test User');
      expect(result.user?.role).toBe('student');
    });

    it('should fail authentication with wrong password', async () => {
      // Arrange
      const hashedPassword = await import('bcryptjs').then((bcrypt) =>
        bcrypt.hash('correctpassword', 12)
      );

      const mockUser = {
        id: '2',
        userId: 'testuser002',
        password: hashedPassword,
        name: 'Test User 2',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result: AuthenticationResult = await repository.authenticateUser(
        'testuser002',
        'wrongpassword'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('아이디 또는 비밀번호가 올바르지 않습니다.');
      expect(result.user).toBeUndefined();
    });

    it('should fail authentication with non-existent user', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result: AuthenticationResult = await repository.authenticateUser(
        'nonexistentuser',
        'anypassword'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('아이디 또는 비밀번호가 올바르지 않습니다.');
      expect(result.user).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act
      const result: AuthenticationResult = await repository.authenticateUser(
        'testuser',
        'password'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('인증 중 오류가 발생했습니다.');
      expect(result.user).toBeUndefined();
    });

    it('should return correct user data structure', async () => {
      // Arrange
      const hashedPassword = await import('bcryptjs').then((bcrypt) =>
        bcrypt.hash('correctpassword', 12)
      );

      const mockUser = {
        id: '3',
        userId: 'testuser003',
        password: hashedPassword,
        name: 'Test User 3',
        role: 'teacher',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result: AuthenticationResult = await repository.authenticateUser(
        'testuser003',
        'correctpassword'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBeDefined();
      expect(typeof result.user?.id).toBe('string');
      expect(typeof result.user?.userId).toBe('string');
      expect(typeof result.user?.name).toBe('string');
      expect(typeof result.user?.role).toBe('string');
      expect(['student', 'teacher', 'admin']).toContain(result.user?.role);
    });
  });
});
