// ABOUTME: Prisma implementation of authentication repository
// ABOUTME: Handles user authentication with database using bcrypt password verification

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { IAuthRepository } from '../../domains/repositories/IAuthRepository';
import { AuthenticationResult } from '@/backend/auth/dtos/UserDto';

export class PrAuthRepository implements IAuthRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  async authenticateUser(
    userId: string,
    password: string
  ): Promise<AuthenticationResult> {
    try {
      // Find user by userId
      const user = await this.prisma.user.findUnique({
        where: { userId },
      });

      if (!user) {
        return {
          success: false,
          error: '아이디 또는 비밀번호가 올바르지 않습니다.',
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return {
          success: false,
          error: '아이디 또는 비밀번호가 올바르지 않습니다.',
        };
      }

      // Return successful authentication result
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
      console.error('Authentication repository error:', error);
      return {
        success: false,
        error: '인증 중 오류가 발생했습니다.',
      };
    }
  }
}
