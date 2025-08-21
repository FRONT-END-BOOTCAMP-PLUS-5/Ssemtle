'use client';

import HeaderSizeObserver from './HeaderSizeObserver';
import Image from 'next/image';
import { FaUserGear } from 'react-icons/fa6';
import { LuLogOut } from 'react-icons/lu';
import Icons from './Icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarTeacher = () => {
  const pathname = usePathname();

  const NAV = [
    { label: '내 정보', href: '/teacher/profile', icon: FaUserGear },
    { label: '로그아웃', href: '/logout', icon: LuLogOut },
  ];

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <div
        className="sticky top-[var(--header-h,0px)] flex w-30 shrink-0 flex-col items-center justify-start gap-10 bg-[var(--color-sidebar)]"
        style={{ height: 'calc(100vh - var(--header-h, 0px))' }}
      >
        <HeaderSizeObserver />
        <Image
          className="mt-10"
          src="/logos/Ssemtle_logo.png"
          alt="Ssemtle 로고"
          width={110}
          height={110}
        />
        {NAV.map(({ label, href, icon: I }) => (
          <Link
            key={label}
            href={href}
            aria-label={label}
            prefetch // (기본 true지만 명시적으로; 무거운 페이지면 false 고려)
            className={`rounded-md transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${isActive(href) ? 'text-indigo-600' : 'text-gray-700'}`}
            title={label}
          >
            <Icons Icon={I} />
          </Link>
        ))}
      </div>
    </>
  );
};

export default SidebarTeacher;
