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

  updateUserId(id: string, newUserId: string): Promise<User>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
}
