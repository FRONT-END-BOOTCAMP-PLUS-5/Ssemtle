'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, useMemo } from 'react';

/**
 * 라우트에 따라 메인 컨텐츠 영역의 오른쪽 패딩(가상 사이드바)을 조건부로 적용하는 컨테이너
 * - 인증 경로(/signin, /signup)와 랜딩(/landing)에서는 패딩 제거
 * - 데스크톱(≥1181px)에서만 패딩 적용
 */
export default function MainContainer({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const shouldApplyRightPadding = useMemo(() => {
    const isAuth =
      pathname?.startsWith('/signin') || pathname?.startsWith('/signup');
    const isLanding =
      pathname === '/landing' || pathname?.startsWith('/landing/');
    return !(isAuth || isLanding);
  }, [pathname]);

  // Tailwind 임의 값으로 CSS 변수 기반 패딩 적용
  const rightPaddingClass = shouldApplyRightPadding
    ? 'min-[1181px]:pr-[var(--sidebar-w,_120px)]'
    : 'pr-0';

  return (
    <main className={`flex-1 overflow-y-auto ${rightPaddingClass}`}>
      {children}
    </main>
  );
}
