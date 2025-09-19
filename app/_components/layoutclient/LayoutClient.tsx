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
  const toggle = () => setIsOpen((v) => !v);

  const isSidebarEnabled = useMemo(() => {
    const isAuth =
      pathname?.startsWith('/signin') || pathname?.startsWith('/signup');
    const isLanding =
      pathname === '/landing' || pathname?.startsWith('/landing/');
    return !(isAuth || isLanding);
  }, [pathname]);

  const handleSidebarClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const clickable = target.closest('a[href], button, [data-close-sidebar]');
    if (clickable) {
      setIsOpen(false);
    }
  };

  return (
    <div className={isOpen ? 'overflow-hidden' : ''}>
      <Header
        logoSrc="/logos/Ssemtle_logo.png"
        logoHref="/"
        onHamburgerClick={isSidebarEnabled ? toggle : undefined}
      />

      {isSidebarEnabled && (
        <>
          <div
            id="mobile-sidebar"
            className={`fixed inset-y-0 left-0 z-[60] overflow-y-auto bg-[var(--color-sidebar,_#fff)] shadow-xl transition-transform duration-300 min-[1181px]:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={handleSidebarClick}
          >
            <RoleBasedSidebar />
          </div>

          <div
            id="mobile-overlay"
            className={`fixed inset-0 z-[55] bg-black/40 transition-opacity duration-300 min-[1181px]:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'} `}
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}

      {children}
    </div>
  );
}
