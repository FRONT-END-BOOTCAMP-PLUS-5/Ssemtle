// ABOUTME: Data Transfer Objects for user-related API operations
// ABOUTME: Defines input/output structures for user creation and validation

export interface CreateUserRequestDto {
  userId: string;
  password: string;
  name: string;
  role?: string;
}

export interface CreateUserResponseDto {
  id: string;
  userId: string;
  name: string;
  role: string;
}

export interface UserCreationResult {
  success: boolean;
  user?: CreateUserResponseDto;
  error?: string;
}

export interface CheckDuplicateRequestDto {
  userId: string;
}

export interface CheckDuplicateResponseDto {
  exists: boolean;
  message?: string;
}

export interface DuplicateCheckResult {
  success: boolean;
  exists?: boolean;
  error?: string;
}
