// ABOUTME: User repository interface defining data access contracts
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