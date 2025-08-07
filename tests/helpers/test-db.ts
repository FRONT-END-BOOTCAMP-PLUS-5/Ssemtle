// ABOUTME: Database test utilities for creating and cleaning test data
// ABOUTME: Provides helper functions for test user creation and database cleanup
import bcrypt from 'bcrypt';
import prisma from '@/libs/prisma';

// Type assertion for mocked Prisma to avoid type conflicts in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

export interface TestUser {
  id: string;
  userId: string;
  password: string;
  name: string;
  role: string;
}

export async function createTestUser(
  userData: Partial<TestUser> = {}
): Promise<TestUser> {
  const defaultUser = {
    userId: `testuser_${Date.now()}`,
    password: 'testpassword123',
    name: '테스트유저',
    role: 'student',
  };

  const user = { ...defaultUser, ...userData };
  const hashedPassword = await bcrypt.hash(user.password, 12);

  const createdUser = await mockPrisma.user.create({
    data: {
      userId: user.userId,
      password: hashedPassword,
      name: user.name,
      role: user.role,
    },
  });

  return {
    id: createdUser.id,
    userId: createdUser.userId,
    password: user.password, // Return original password for testing
    name: createdUser.name,
    role: createdUser.role,
  };
}

export async function cleanupTestUsers(userIds: string[]): Promise<void> {
  await mockPrisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
}

export async function cleanupAllTestUsers(): Promise<void> {
  await mockPrisma.user.deleteMany({
    where: {
      userId: {
        startsWith: 'testuser_',
      },
    },
  });
}

export { prisma };
