import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/auth';

interface NextAuthRequest extends NextRequest {
  auth?: { user?: { role?: string }; token?: { role?: string } };
}

const PUBLIC_PREFIXES = [
  '/signin',
  '/signup',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/public',
  '/assets',
];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // auth 정보 접근
  const authInfo = (req as NextAuthRequest).auth;

  // 인증 정보가 없으면 signin으로
  if (!authInfo) {
    const signInUrl = new URL('/signin', req.nextUrl.origin);
    signInUrl.searchParams.set(
      'callbackUrl',
      req.nextUrl.pathname + req.nextUrl.search
    );
    signInUrl.searchParams.set('alert', '1');
    signInUrl.searchParams.set(
      'from',
      encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)
    );
    return NextResponse.redirect(signInUrl);
  }

  // role 우선순위: user.role, token.role
  const role = authInfo.user?.role ?? authInfo.token?.role ?? '';

  // role 기반 접근 제어
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.nextUrl.origin));
  }
  if (
    pathname.startsWith('/teacher') &&
    !(role === 'teacher' || role === 'admin')
  ) {
    return NextResponse.redirect(new URL('/unauthorized', req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|api|signin|signup|favicon.ico).*)'],
};
