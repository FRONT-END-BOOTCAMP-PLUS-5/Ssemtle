'use client';

import HeaderSizeObserver from './HeaderSizeObserver';
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
      label: '선생님 승인',
      href: '/admin/teacher-approval',
      icon: LuUserRoundPlus,
    },
    { label: '단원 생성', href: '/admin/unit', icon: BsFillGridFill },
    { label: '로그아웃', href: '/', icon: LuLogOut },
  ];

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <div
        className="flex w-30 flex-col items-center justify-start gap-10 bg-[var(--color-sidebar)] pt-10"
        style={{ height: 'calc(100vh - var(--header-h, 0px))' }}
      >
        <HeaderSizeObserver />
        {NAV.map(({ label, href, icon: I }) => (
          <Link
            key={label}
            href={href}
            aria-label={label}
            prefetch // (기본 true지만 명시적으로; 무거운 페이지면 false 고려)
            className={`group cursor-pointer rounded-md transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${isActive(href) ? 'text-indigo-600' : 'text-gray-700'}`}
            title={label}
          >
            <div className="mx-auto flex flex-col items-center justify-center text-center transition-transform duration-150 ease-out group-hover:scale-[1.06]">
              <Icons Icon={I} />
              <div>{label}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default SidebarAdmin;
