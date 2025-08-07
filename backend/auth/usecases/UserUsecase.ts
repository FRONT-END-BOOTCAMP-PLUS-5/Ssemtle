// ABOUTME: User use cases containing business logic for user operations
// ABOUTME: Handles validation, password hashing, and user creation workflows

import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../common/domains/repositories/IUserRepository';
import { CreateUserRequestDto, UserCreationResult, CheckDuplicateRequestDto, DuplicateCheckResult } from '../dtos/UserDto';

export class CreateUserUseCase {
  private userRepository: IUserRepository;
  private readonly saltRounds = 12;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(request: CreateUserRequestDto): Promise<UserCreationResult> {
    // Validate required fields
    if (!request.userId || !request.password || !request.name) {
      return {
        success: false,
        error: '아이디, 비밀번호, 이름을 모두 입력해주세요.',
      };
    }

    // Validate password length
    if (request.password.length < 6) {
      return {
        success: false,
        error: '비밀번호는 6자리 이상이어야 합니다.',
      };
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByUserId(request.userId);
    if (existingUser) {
      return {
        success: false,
        error: '이미 존재하는 아이디입니다.',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(request.password, this.saltRounds);

    // Create user
    try {
      const user = await this.userRepository.create({
        userId: request.userId,
        password: hashedPassword,
        name: request.name,
        role: request.role || 'student',
      });

      return {
        success: true,
        user: {
          id: user.id,
          userId: user.userId,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('User creation error:', error);
      return {
        success: false,
        error: '사용자 생성 중 오류가 발생했습니다.',
      };
    }
  }
}

export class CheckUserIdDuplicateUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(request: CheckDuplicateRequestDto): Promise<DuplicateCheckResult> {
    // Validate required field
    if (!request.userId) {
      return {
        success: false,
        error: '아이디를 입력해주세요.',
      };
    }

    try {
      const existingUser = await this.userRepository.findByUserId(request.userId);
      
      return {
        success: true,
        exists: !!existingUser,
      };
    } catch (error) {
      console.error('Duplicate check error:', error);
      return {
        success: false,
        error: '중복 확인 중 오류가 발생했습니다.',
      };
    }
  }
}
