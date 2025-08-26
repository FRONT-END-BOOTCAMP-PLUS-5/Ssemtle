// ABOUTME: Unit tests for AuthenticateUserUsecase following TDD
// ABOUTME: Tests authentication business logic in isolation

import { AuthenticateUserUsecase } from '@/backend/auth/usecases/AuthenticateUserUsecase';
import { IAuthRepository } from '@/backend/common/domains/repositories/IAuthRepository';
import {
  AuthenticateUserRequestDto,
  AuthenticationResult,
} from '@/backend/auth/dtos/UserDto';

// Mock repository
class MockAuthRepository implements IAuthRepository {
  async authenticateUser(): Promise<AuthenticationResult> {
    throw new Error('Mock not implemented');
  }
}

describe('AuthenticateUserUsecase', () => {
  let usecase: AuthenticateUserUsecase;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    usecase = new AuthenticateUserUsecase(mockRepository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return success when credentials are valid', async () => {
      // Arrange
      const request: AuthenticateUserRequestDto = {
        userId: 'testuser',
        password: 'validpassword123',
      };

      const mockResult: AuthenticationResult = {
        success: true,
        user: {
          id: '1',
          userId: 'testuser',
          name: 'Test User',
          role: 'student',
        },
      };

      jest
        .spyOn(mockRepository, 'authenticateUser')
        .mockResolvedValue(mockResult);

      // Act
      const result = await usecase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: '1',
        userId: 'testuser',
        name: 'Test User',
        role: 'student',
      });
      expect(mockRepository.authenticateUser).toHaveBeenCalledWith(
        'testuser',
        'validpassword123'
      );
    });

    it('should return failure when credentials are invalid', async () => {
      // Arrange
      const request: AuthenticateUserRequestDto = {
        userId: 'testuser',
        password: 'wrongpassword',
      };

      const mockResult: AuthenticationResult = {
        success: false,
        error: '아이디 또는 비밀번호가 올바르지 않습니다.',
      };

      jest
        .spyOn(mockRepository, 'authenticateUser')
        .mockResolvedValue(mockResult);

      // Act
      const result = await usecase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('아이디 또는 비밀번호가 올바르지 않습니다.');
      expect(result.user).toBeUndefined();
    });

    it('should return failure when userId is missing', async () => {
      // Arrange
      const request: AuthenticateUserRequestDto = {
        userId: '',
        password: 'password123',
      };
      const spy = jest.spyOn(mockRepository, 'authenticateUser');

      // Act
      const result = await usecase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('아이디와 비밀번호를 모두 입력해주세요.');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should return failure when password is missing', async () => {
      // Arrange
      const request: AuthenticateUserRequestDto = {
        userId: 'testuser',
        password: '',
      };
      const spy = jest.spyOn(mockRepository, 'authenticateUser');

      // Act
      const result = await usecase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('아이디와 비밀번호를 모두 입력해주세요.');
      expect(spy).not.toHaveBeenCalled();
    });

    it('should return failure when user does not exist', async () => {
      // Arrange
      const request: AuthenticateUserRequestDto = {
        userId: 'nonexistent',
        password: 'password123',
      };

      const mockResult: AuthenticationResult = {
        success: false,
        error: '아이디 또는 비밀번호가 올바르지 않습니다.',
      };

      jest
        .spyOn(mockRepository, 'authenticateUser')
        .mockResolvedValue(mockResult);

      // Act
      const result = await usecase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('아이디 또는 비밀번호가 올바르지 않습니다.');
      expect(result.user).toBeUndefined();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const request: AuthenticateUserRequestDto = {
        userId: 'testuser',
        password: 'password123',
      };

      jest
        .spyOn(mockRepository, 'authenticateUser')
        .mockRejectedValue(new Error('Database error'));

      // Act
      const result = await usecase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('인증 중 오류가 발생했습니다.');
      expect(result.user).toBeUndefined();
    });
  });
});
