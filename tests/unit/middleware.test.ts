// ABOUTME: Unit tests for the Next.js middleware configuration
// ABOUTME: Ensures middleware runs on Node.js, since auth.ts pulls in the Prisma client
jest.mock('@/auth', () => ({
  auth: (handler: unknown) => handler,
}));

import { config } from '@/middleware';

describe('middleware config', () => {
  it('runs on the Node.js runtime, not Edge', () => {
    expect(config.runtime).toBe('nodejs');
  });
});
