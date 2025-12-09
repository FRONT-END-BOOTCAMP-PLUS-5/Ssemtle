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
  '/signup/teacher/pending',
  '/robots.txt',
  '/sitemap.xml',
];

// 역할별 메인 페이지 매핑
const ROLE_MAIN_PAGES = {
  student: '/practice-category',
  teacher: '/teacher/student',
  admin: '/admin/teacher-approval',
};

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // 공개 경로들 처리
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

  // role이 pending_teacher인 경우 대기 페이지로 리다이렉트
  if (
    role === 'pending_teacher' &&
    !pathname.startsWith('/signup/teacher/pending')
  ) {
    return NextResponse.redirect(
      new URL('/signup/teacher/pending', req.nextUrl.origin)
    );
  }

  // 루트 경로('/')로 접근 시 역할별 메인 페이지로 리다이렉트
  if (pathname === '/') {
    const mainPage = ROLE_MAIN_PAGES[role as keyof typeof ROLE_MAIN_PAGES];
    if (mainPage) {
      return NextResponse.redirect(new URL(mainPage, req.nextUrl.origin));
    }
  }

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
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|signin|signup|landing|logos).*)',
  ],
};
