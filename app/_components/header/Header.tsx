'use client';

import Image from 'next/image';

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
  const HEADER_HEIGHT = 36;

  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-[36px] bg-[#fef7ff] ${className}`}
      >
        <label
          htmlFor="nav-toggle"
          aria-label="Open navigation"
          className="absolute top-1/2 left-0 z-10 inline-flex -translate-y-1/2 cursor-pointer items-center justify-center p-2 text-gray-700 hover:text-black min-[431px]:hidden"
          onClick={() => {
            console.log('[Header] hamburger clicked');
            onHamburgerClick?.();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && onHamburgerClick?.()
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={80}
              height={20}
              className="h-5 w-auto"
              priority
            />
          </a>
        </nav>
      </header>
    </div>
  );
}
