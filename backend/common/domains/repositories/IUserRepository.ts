// ABOUTME: User repository interface defining data access contracts using Prisma User type
// ABOUTME: Provides abstraction for user-related database operations

import { User } from '../entities/User';

export interface IUserRepository {
  findByUserId(userId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(userData: {
    userId: string;
    password: string;
    name: string;
    role: string;
  }): Promise<User>;
}
