'use client';

import HeaderSizeObserver from './HeaderSizeObserver';
import Icons from './Icons';
import { LuUserRoundPlus, LuLogOut } from 'react-icons/lu';
import { BsFillGridFill } from 'react-icons/bs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function SidebarAdmin() {
  const pathname = usePathname();

  const NAV = [
    {
      label: '선생님 승인',
      href: '/admin/teacher-approval',
      icon: LuUserRoundPlus,
      type: 'link' as const,
    },
    {
      label: '단원 생성',
      href: '/admin/unit',
      icon: BsFillGridFill,
      type: 'link' as const,
    },
    { label: '로그아웃', icon: LuLogOut, type: 'logout' as const },
  ] as const;

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <div
      className="h-screen-dvh-minus-header-safe pt-safe-top pb-safe sticky top-[var(--header-h,50px)] flex w-30 shrink-0 flex-col items-center justify-start gap-10 bg-[var(--color-sidebar)]"
      style={{ height: 'calc(100vh - var(--header-h, 0px))' }}
    >
      <HeaderSizeObserver />

      {NAV.map((item) =>
        item.type === 'link' ? (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            prefetch
            className={`group cursor-pointer rounded-md transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isActive(item.href) ? 'text-indigo-600' : 'text-gray-700'
            }`}
            title={item.label}
          >
            <div className="mx-auto flex flex-col items-center justify-center text-center transition-transform duration-150 ease-out group-hover:scale-[1.06]">
              <Icons Icon={item.icon} />
              <div>{item.label}</div>
            </div>
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            title={item.label}
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="group cursor-pointer rounded-md text-gray-700 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <div className="mx-auto flex flex-col items-center justify-center text-center transition-transform duration-150 ease-out group-hover:scale-[1.06]">
              <Icons Icon={item.icon} />
              <div>{item.label}</div>
            </div>
          </button>
        )
      )}
    </div>
  );
}
