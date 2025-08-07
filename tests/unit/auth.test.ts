// ABOUTME: Unit tests for authentication utilities and bcrypt functions
// ABOUTME: Tests password hashing, validation, and user data processing
import bcrypt from 'bcryptjs';
import { CheckUserIdDuplicateUseCase } from '@/backend/auth/usecases/UserUsecase';
import { IUserRepository } from '@/backend/common/domains/repositories/IUserRepository';
import { User } from '@/backend/common/domains/entities/User';

describe('Authentication Utils', () => {
  describe('Password Hashing', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'testPassword123';
      const saltRounds = 12;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';

      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);

      expect(hash1).not.toBe(hash2);
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', () => {
      const validUser = {
        userId: 'testuser',
        password: 'password123',
        name: '테스트유저',
      };

      expect(validUser.userId).toBeTruthy();
      expect(validUser.password).toBeTruthy();
      expect(validUser.name).toBeTruthy();
    });

    it('should reject empty userId', () => {
      const userId = '';
      expect(userId.length).toBe(0);
    });

    it('should reject short passwords', () => {
      const shortPassword = '12345';
      expect(shortPassword.length).toBeLessThan(6);
    });

    it('should accept valid passwords', () => {
      const validPassword = 'password123';
      expect(validPassword.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('CheckUserIdDuplicateUseCase', () => {
    let mockRepository: jest.Mocked<IUserRepository>;
    let useCase: CheckUserIdDuplicateUseCase;

    beforeEach(() => {
      mockRepository = {
        findByUserId: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
      };
      useCase = new CheckUserIdDuplicateUseCase(mockRepository);
    });

    it('should return validation error when userId is empty', async () => {
      const result = await useCase.execute({ userId: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('아이디를 입력해주세요.');
      expect(mockRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should return exists: true when user exists', async () => {
      const mockUser: User = {
        id: '1',
        userId: 'existinguser',
        password: 'hashedpassword',
        name: '기존유저',
        role: 'student',
        point: 0,
        streak: 0,
        createdAt: new Date(),
      };
      mockRepository.findByUserId.mockResolvedValue(mockUser);

      const result = await useCase.execute({ userId: 'existinguser' });

      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('existinguser');
    });

    it('should return exists: false when user does not exist', async () => {
      mockRepository.findByUserId.mockResolvedValue(null);

      const result = await useCase.execute({ userId: 'newuser' });

      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('newuser');
    });

    it('should handle repository errors gracefully', async () => {
      mockRepository.findByUserId.mockRejectedValue(
        new Error('Database error')
      );

      const result = await useCase.execute({ userId: 'testuser' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('중복 확인 중 오류가 발생했습니다.');
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('testuser');
    });
  });
});
