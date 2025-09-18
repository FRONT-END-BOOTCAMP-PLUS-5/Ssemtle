'use client';

import { useEffect, useMemo, useState } from 'react';
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

  // 사이드바 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSidebarClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // 링크/버튼/명시적 닫기 타깃이면 닫기
    const clickable = target.closest('a[href], button, [data-close-sidebar]');
    if (clickable) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Header
        logoSrc="/logos/Ssemtle_logo.png"
        logoHref="/"
        onHamburgerClick={isSidebarEnabled ? toggle : undefined}
      />

      {isSidebarEnabled && (
        <>
          <div
            id="mobile-sidebar"
            className={`fixed inset-y-0 left-0 z-[60] overflow-y-auto bg-[var(--color-sidebar,_#fff)] shadow-xl transition-transform duration-300 min-[1181px]:hidden ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={handleSidebarClick}
          >
            <RoleBasedSidebar />
          </div>

          <div
            id="mobile-overlay"
            className={`fixed inset-0 z-[55] bg-black/40 transition-opacity duration-300 min-[1181px]:hidden ${
              isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            } `}
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}

      {children}
    </>
  );
}
