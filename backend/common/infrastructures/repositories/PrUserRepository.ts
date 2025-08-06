// ABOUTME: Prisma implementation of user repository for database operations
// ABOUTME: Handles all user-related data access and database queries using Prisma

import prisma from '@/libs/prisma';
import { User } from '../../domains/entities/User';
import { IUserRepository } from '../../domains/repositories/IUserRepository';

export class PrUserRepository implements IUserRepository {
  async findByUserId(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.userId,
      user.password,
      user.name,
      user.role,
      user.point,
      user.streak,
      user.createdAt
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.userId,
      user.password,
      user.name,
      user.role,
      user.point,
      user.streak,
      user.createdAt
    );
  }

  async create(userData: {
    userId: string;
    password: string;
    name: string;
    role: string;
  }): Promise<User> {
    const user = await prisma.user.create({
      data: userData,
    });

    return new User(
      user.id,
      user.userId,
      user.password,
      user.name,
      user.role,
      user.point,
      user.streak,
      user.createdAt
    );
  }
}