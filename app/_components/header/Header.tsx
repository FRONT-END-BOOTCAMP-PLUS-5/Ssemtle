'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type MinimalHeaderProps = {
  logoSrc?: string;
  logoAlt?: string;
  logoHref?: string;
  onHamburgerClick?: () => void;
  className?: string;
};

export default function MinimalHeader({
  logoSrc = '/logos/Ssemtle_logo.png',
  logoAlt = 'Ssemtle',
  logoHref = '/',
  onHamburgerClick,
  className = '',
}: MinimalHeaderProps) {
  const HEADER_HEIGHT = 52;
  const pathname = usePathname();

  // 클라 마운트 여부 (SSR/CSR 마크업 차이 방지)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hideHeader = mounted && pathname === '/landing';
  const hiddenHamburgerPaths = ['/signin', '/signup'];
  const hideHamburger = mounted && hiddenHamburgerPaths.includes(pathname);

  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <header
        suppressHydrationWarning
        className={`fixed inset-x-0 top-0 z-50 h-[52px] bg-[#fef7ff] ${hideHeader ? 'hidden' : ''} ${className}`}
        aria-hidden={hideHeader ? 'true' : 'false'}
      >
        <label
          htmlFor="nav-toggle"
          aria-label="Open navigation"
          className={`absolute top-1/2 right-0 z-10 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center p-2 text-gray-700 hover:text-black min-[1181px]:hidden ${hideHamburger ? 'pointer-events-none invisible' : ''}`}
          onClick={() => onHamburgerClick?.()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && onHamburgerClick?.()
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </label>

        <nav className="relative flex h-full items-center justify-center">
          <a href={logoHref} className="inline-flex items-center">
            <span className="sr-only">{logoAlt}</span>
            <picture>
              <source srcSet="/logos/Ssemtle_logo.avif" type="image/avif" />
              <source srcSet="/logos/Ssemtle_logo.webp" type="image/webp" />
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={200}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </picture>
          </a>
        </nav>
      </header>
    </div>
  );
}
