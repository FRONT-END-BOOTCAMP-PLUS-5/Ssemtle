// ABOUTME: Mock implementation of Prisma client for testing
// ABOUTME: Provides in-memory database simulation for unit and integration tests

interface MockUser {
  id: string;
  userId: string;
  password: string;
  name: string;
  role: string;
}

const users = new Map<string, MockUser>();

export const prisma = {
  user: {
    findUnique: jest.fn(async ({ where }: { where: { userId?: string; id?: string } }) => {
      if (where.userId) {
        return Array.from(users.values()).find(u => u.userId === where.userId) || null;
      }
      if (where.id) {
        return users.get(where.id) || null;
      }
      return null;
    }),

    create: jest.fn(async ({ data }: { data: Omit<MockUser, 'id'> }) => {
      const id = `user_${Date.now()}_${Math.random().toString().substring(2)}`;
      const user = { id, ...data };
      users.set(id, user);
      return user;
    }),

    deleteMany: jest.fn(async ({ where }: { where: { userId?: { startsWith: string }; id?: { in: string[] } } }) => {
      if (where.userId?.startsWith) {
        const toDelete = Array.from(users.entries())
          .filter(([, user]) => user.userId.startsWith(where.userId.startsWith));
        toDelete.forEach(([id]) => users.delete(id));
        return { count: toDelete.length };
      }
      if (where.id?.in) {
        const toDelete = where.id.in.filter((id: string) => users.has(id));
        toDelete.forEach((id: string) => users.delete(id));
        return { count: toDelete.length };
      }
      return { count: 0 };
    }),
  },

  $disconnect: jest.fn(async () => {}),
};

// Clear users before each test
beforeEach(() => {
  users.clear();
});

export default prisma;