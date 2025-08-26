import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        id: {
          type: 'text',
          label: '아이디',
          placeholder: '아이디',
        },
        password: {
          type: 'password',
          label: '비밀번호',
          placeholder: '비밀번호',
        },
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.password) {
          return null;
        }

        try {
          // Dynamic imports to avoid bundling in Edge Runtime
          const { AuthenticateUserUsecase } = await import(
            '@/backend/auth/usecases/AuthenticateUserUsecase'
          );
          const { PrAuthRepository } = await import(
            '@/backend/common/infrastructures/repositories/PrAuthRepository'
          );
          const prismaModule = await import('@/libs/prisma');
          const prisma = prismaModule.default;

          // Use clean architecture components with explicit dependency injection
          const authRepository = new PrAuthRepository(prisma);
          const authenticateUserUsecase = new AuthenticateUserUsecase(
            authRepository
          );

          const result = await authenticateUserUsecase.execute({
            userId: credentials.id as string,
            password: credentials.password as string,
          });

          if (!result.success || !result.user) {
            return null;
          }

          // Return user data for session
          return {
            id: result.user.id,
            userId: result.user.userId,
            name: result.user.name,
            role: result.user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.userId = user.userId;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub as string;
        session.user.userId = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
