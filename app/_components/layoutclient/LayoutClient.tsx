'use client';

import { useMemo, useState } from 'react';
import Header from '@/app/_components/header/Header';
import { usePathname } from 'next/navigation';
import RoleBasedSidebar from '@/app/_components/sidebar/RoleBasedSidebar';

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 모바일 사이드바 열고/닫기 토글
  const toggle = () => setIsOpen((v) => !v);

  // 인증/랜딩 페이지에서는 사이드바 기능 비활성화
  const isSidebarEnabled = useMemo(() => {
    const isAuth =
      pathname?.startsWith('/signin') || pathname?.startsWith('/signup');
    const isLanding =
      pathname === '/landing' || pathname?.startsWith('/landing/');
    return !(isAuth || isLanding);
  }, [pathname]);

  return (
    <>
      <Header
        logoSrc="/logos/Ssemtle_logo.png"
        logoHref="/"
        onHamburgerClick={isSidebarEnabled ? toggle : undefined}
      />

      {/* 모바일 전용 사이드바 및 오버레이: 상태로 제어 (DOM 직접 접근 없음) */}
      {isSidebarEnabled && (
        <>
          <div
            id="mobile-sidebar"
            className={`fixed inset-y-0 left-0 z-[60] overflow-y-auto bg-[var(--color-sidebar,_#fff)] shadow-xl min-[1181px]:hidden ${
              isOpen ? '' : 'hidden'
            }`}
          >
            <RoleBasedSidebar />
          </div>
          <div
            id="mobile-overlay"
            className={`fixed inset-0 z-[55] bg-black/40 min-[1181px]:hidden ${
              isOpen ? '' : 'hidden'
            }`}
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}

      {children}
    </>
  );
}
