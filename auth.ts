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

        // Dynamic imports to avoid bundling in Edge Runtime
        const bcrypt = await import('bcryptjs');
        const prismaModule = await import('@/libs/prisma');
        const prisma = prismaModule.default;

        try {
          // Find user by userId
          const user = await prisma.user.findUnique({
            where: { userId: credentials.id as string },
          });

          if (!user) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          // Return user data for session
          return {
            id: user.id,
            userId: user.userId,
            name: user.name,
            role: user.role,
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
