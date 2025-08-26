// ABOUTME: Use case for user authentication following clean architecture
// ABOUTME: Contains business logic for credential validation and user authentication

import { IAuthRepository } from '@/backend/common/domains/repositories/IAuthRepository';
import {
  AuthenticateUserRequestDto,
  AuthenticationResult,
} from '../dtos/UserDto';

export class AuthenticateUserUsecase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(
    request: AuthenticateUserRequestDto
  ): Promise<AuthenticationResult> {
    // Validate required fields
    if (!request.userId || !request.password) {
      return {
        success: false,
        error: '아이디와 비밀번호를 모두 입력해주세요.',
      };
    }

    try {
      // Delegate authentication to repository
      const result = await this.authRepository.authenticateUser(
        request.userId,
        request.password
      );

      return result;
    } catch (error) {
      console.error('Authentication usecase error:', error);
      return {
        success: false,
        error: '인증 중 오류가 발생했습니다.',
      };
    }
  }
}
