// ABOUTME: Prisma implementation of user repository using Prisma User type
// ABOUTME: Handles all user-related data access and database queries using Prisma

import prisma from '@/libs/prisma';
import { User } from '@prisma/client';
import { IUserRepository } from '../../domains/repositories/IUserRepository';

export class PrUserRepository implements IUserRepository {
  async findByUserId(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) return null;

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return user;
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

    return user;
  }
}