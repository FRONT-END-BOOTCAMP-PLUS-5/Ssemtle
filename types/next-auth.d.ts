// ABOUTME: NextAuth type extensions for custom user properties
// ABOUTME: Extends default User and JWT types to include userId and role
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      userId: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    userId: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userId: string;
    role: string;
  }
}
