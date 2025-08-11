// ABOUTME: Interface for authentication repository operations
// ABOUTME: Defines contract for user authentication and credential verification

import { AuthenticationResult } from '@/backend/auth/dtos/UserDto';

export interface IAuthRepository {
  /**
   * Authenticates a user with given credentials
   * @param userId - User's login ID
   * @param password - Plain text password
   * @returns Promise<AuthenticationResult> - Authentication result with user data or error
   */
  authenticateUser(
    userId: string,
    password: string
  ): Promise<AuthenticationResult>;
}
