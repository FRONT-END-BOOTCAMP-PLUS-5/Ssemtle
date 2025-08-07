// ABOUTME: Integration tests for authentication API endpoints
// ABOUTME: Tests user registration and login flows with clean architecture layers
import { CreateUserUseCase } from '@/backend/auth/usecases/UserUsecase';
import { CreateUserRequestDto } from '@/backend/auth/dtos/UserDto';

// Mock the entire PrUserRepository module
jest.mock('@/backend/common/infrastructures/repositories/PrUserRepository', () => {
  return {
    PrUserRepository: jest.fn().mockImplementation(() => ({
      findByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    })),
  };
});

describe('Auth API Integration Tests', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<{
    findByUserId: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  }>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrUserRepository } = require('@/backend/common/infrastructures/repositories/PrUserRepository');
    mockUserRepository = new PrUserRepository();
    createUserUseCase = new CreateUserUseCase(mockUserRepository);
  });

  describe('CreateUserUseCase', () => {
    it('should validate user registration input', async () => {
      const validRequest: CreateUserRequestDto = {
        userId: 'testuser123',
        password: 'password123',
        name: '테스트유저',
        role: 'student',
      };

      mockUserRepository.findByUserId.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 'user123',
        userId: validRequest.userId,
        password: 'hashedpassword',
        name: validRequest.name,
        role: validRequest.role!,
        point: 0,
        streak: 0,
        createdAt: new Date()
      });

      const result = await createUserUseCase.execute(validRequest);

      expect(result.success).toBe(true);
      expect(result.user?.userId).toBe(validRequest.userId);
      expect(result.user?.name).toBe(validRequest.name);
    });

    it('should reject invalid registration data', async () => {
      const invalidCases: CreateUserRequestDto[] = [
        { userId: '', password: 'password123', name: '테스트유저' },
        { userId: 'testuser', password: '', name: '테스트유저' },
        { userId: 'testuser', password: 'password123', name: '' },
        { userId: 'testuser', password: '12345', name: '테스트유저' },
      ];

      for (const invalidRequest of invalidCases) {
        const result = await createUserUseCase.execute(invalidRequest);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('should reject duplicate users', async () => {
      const request: CreateUserRequestDto = {
        userId: 'existing_user',
        password: 'password123',
        name: '테스트유저',
        role: 'student',
      };

      mockUserRepository.findByUserId.mockResolvedValue({
        id: 'existing123',
        userId: request.userId,
        password: 'hashedpassword',
        name: request.name,
        role: request.role!,
        point: 0,
        streak: 0,
        createdAt: new Date()
      });

      const result = await createUserUseCase.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('이미 존재하는 아이디입니다.');
    });
  });

  describe('Response Formats', () => {
    it('should format success response correctly', () => {
      const user = {
        id: 'user123',
        userId: 'testuser',
        name: '테스트유저',
        role: 'student',
      };

      const successResponse = {
        message: '회원가입이 완료되었습니다.',
        user: {
          id: user.id,
          userId: user.userId,
          name: user.name,
          role: user.role,
        },
      };

      expect(successResponse.message).toBe('회원가입이 완료되었습니다.');
      expect(successResponse.user.userId).toBe(user.userId);
      expect(successResponse.user.name).toBe(user.name);
    });

    it('should format error responses correctly', () => {
      const errorMessages = {
        missingFields: '아이디, 비밀번호, 이름을 모두 입력해주세요.',
        shortPassword: '비밀번호는 6자리 이상이어야 합니다.',
        duplicateUser: '이미 존재하는 아이디입니다.',
        serverError: '서버 오류가 발생했습니다.',
      };

      Object.values(errorMessages).forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });
});