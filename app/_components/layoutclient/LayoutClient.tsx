'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/_components/header/Header';

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((v) => !v);

  useEffect(() => {
    const mobile = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-overlay');

    if (!mobile || !overlay) return;

    // isOpen에 따라 보이기/숨기기
    if (isOpen) {
      mobile.classList.remove('hidden');
      overlay.classList.remove('hidden');
    } else {
      mobile.classList.add('hidden');
      overlay.classList.add('hidden');
    }

    // 오버레이 클릭 → 닫기
    const onOverlayClick = () => setIsOpen(false);
    overlay.addEventListener('click', onOverlayClick);

    // ESC로 닫기 (옵션)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      overlay.removeEventListener('click', onOverlayClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <>
      <Header
        logoSrc="/logos/Ssemtle_logo.png"
        logoHref="/"
        onHamburgerClick={toggle} // 햄버거 → 열고/닫기
      />
      {children}
    </>
  );
}
