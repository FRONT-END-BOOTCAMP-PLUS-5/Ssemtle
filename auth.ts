// ABOUTME: NextAuth configuration with credentials provider for user authentication
// ABOUTME: Handles login using userId and password with bcrypt verification
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import prisma from '@/libs/prisma';

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
      authorize: async (credentials) => {
        if (!credentials?.id || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              userId: credentials.id as string,
            },
          });

          if (!user) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id.toString(),
            name: user.name,
            userId: user.userId,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
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
