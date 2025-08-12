// ABOUTME: Integration tests for full authentication flow
// ABOUTME: Tests NextAuth integration with clean architecture components

import { AuthenticateUserUsecase } from '@/backend/auth/usecases/AuthenticateUserUsecase';
import { PrAuthRepository } from '@/backend/common/infrastructures/repositories/PrAuthRepository';

// Create mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
} as jest.Mocked<{ user: { findUnique: jest.Mock; create: jest.Mock } }>;

describe('Authentication Flow Integration Tests', () => {
  let authUsecase: AuthenticateUserUsecase;
  let authRepository: PrAuthRepository;

  beforeEach(() => {
    authRepository = new PrAuthRepository(mockPrisma);
    authUsecase = new AuthenticateUserUsecase(authRepository);
    jest.clearAllMocks();
  });

  describe('Full authentication flow', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      // Arrange
      const hashedPassword = await import('bcryptjs').then((bcrypt) =>
        bcrypt.hash('testpassword123', 12)
      );

      const mockUser = {
        id: '1',
        userId: 'integrationtest001',
        password: hashedPassword,
        name: 'Integration Test User',
        role: 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act - Authenticate the user
      const authRequest = {
        userId: 'integrationtest001',
        password: 'testpassword123',
      };

      const authResult = await authUsecase.execute(authRequest);

      // Assert
      expect(authResult.success).toBe(true);
      expect(authResult.user).toBeDefined();
      expect(authResult.user?.userId).toBe('integrationtest001');
      expect(authResult.user?.name).toBe('Integration Test User');
      expect(authResult.user?.role).toBe('student');
      expect(authResult.error).toBeUndefined();
    });

    it('should validate input properly', async () => {
      // Test empty userId
      let authResult = await authUsecase.execute({
        userId: '',
        password: 'password',
      });

      expect(authResult.success).toBe(false);
      expect(authResult.error).toBe('아이디와 비밀번호를 모두 입력해주세요.');

      // Test empty password
      authResult = await authUsecase.execute({
        userId: 'testuser',
        password: '',
      });

      expect(authResult.success).toBe(false);
      expect(authResult.error).toBe('아이디와 비밀번호를 모두 입력해주세요.');
    });

    it('should handle non-existent user', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act - Try to authenticate non-existent user
      const authRequest = {
        userId: 'nonexistentuser999',
        password: 'anypassword',
      };

      const authResult = await authUsecase.execute(authRequest);

      // Assert
      expect(authResult.success).toBe(false);
      expect(authResult.user).toBeUndefined();
      expect(authResult.error).toBe(
        '아이디 또는 비밀번호가 올바르지 않습니다.'
      );
    });
  });
});
