'use client';

import HeaderSizeObserver from './HeaderSizeObserver';
import Image from 'next/image';
import Icons from './Icons';
import { LuUserRoundPlus } from 'react-icons/lu';
import { BsFillGridFill } from 'react-icons/bs';
import { LuLogOut } from 'react-icons/lu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SidebarAdmin = () => {
  const pathname = usePathname();

  const NAV = [
    {
      label: '선생님 허가',
      href: '/admin/teacher-approval',
      icon: LuUserRoundPlus,
    },
    { label: '카테고리 생성', href: '/admin/unit', icon: BsFillGridFill },
    { label: '로그아웃', href: '/logout', icon: LuLogOut },
  ];

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <div
        className="top-[var(--header-h,0px)] flex w-30 flex-col items-center justify-start gap-10 bg-[var(--color-sidebar)]"
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

export default SidebarAdmin;
