'use client';
import Image from 'next/image';
export default function Header({
  logoSrc = '/logos/Ssemtle_logo.png',
  logoAlt = 'Ssemtle',
  logoHref = '/',
}: {
  logoSrc?: string;
  logoAlt?: string;
  logoHref?: string;
}) {
  const handleHamburgerClick = () => {
    console.log('햄버거 버튼 눌림');
  };

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: 'rgb(254,247,255)' }}
    >
      <div className="mx-auto flex h-12 max-w-screen-xl items-center justify-between px-3 sm:px-4">
        {/* Left: Hamburger */}
        <button
          onClick={handleHamburgerClick}
          aria-label="Open menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-gray-50 active:scale-[.98] sm:h-10 sm:w-10"
        >
          <span className="relative block h-3.5 w-5" aria-hidden>
            <span className="absolute inset-x-0 top-0 h-0.5 rounded bg-gray-900" />
            <span className="absolute inset-x-0 top-1.5 h-0.5 rounded bg-gray-900" />
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded bg-gray-900" />
          </span>
        </button>

        {/* Center: Logo */}
        <a
          href={logoHref}
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 select-none"
          aria-label="Go to homepage"
        >
          <Image
            src={logoSrc}
            alt={logoAlt}
            className="h-6 w-auto sm:h-6"
            width={100}
            height={24}
            draggable={false}
          />
        </a>

        {/* Right spacer */}
        <div className="w-10 sm:w-10" aria-hidden />
      </div>
    </header>
  );
}
