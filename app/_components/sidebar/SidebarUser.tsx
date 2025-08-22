'use client';

import HeaderSizeObserver from './HeaderSizeObserver';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react'; // ✅ 클라이언트용 signOut
import { LuLogOut } from 'react-icons/lu';
import { FaPen, FaCircleUser } from 'react-icons/fa6';
import { GiBookshelf } from 'react-icons/gi';
import { PiExamLight } from 'react-icons/pi';
import Icon from './Icons';

export default function SidebarUser() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.userId ?? 'me';

  const NAV = [
    {
      label: '문제풀기',
      href: '/practice-category',
      icon: FaPen,
      type: 'link' as const,
    },
    {
      label: '문제집',
      href: '/problem-solving',
      icon: GiBookshelf,
      type: 'link' as const,
    },
    {
      label: '단원평가',
      href: '/unit',
      icon: PiExamLight,
      type: 'link' as const,
    },
    {
      label: '내 정보',
      href: `/mypage/${userId}`,
      icon: FaCircleUser,
      type: 'link' as const,
    },
    { label: '로그아웃', icon: LuLogOut, type: 'logout' as const },
  ] as const;

  const isActive = (href?: string) =>
    href ? pathname === href || pathname.startsWith(href + '/') : false;

  return (
    <div
      className="sticky top-[var(--header-h,0px)] flex w-30 shrink-0 flex-col items-center justify-start gap-10 bg-[var(--color-sidebar)]"
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
            className={`rounded-md transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isActive(item.href) ? 'text-indigo-600' : 'text-gray-700'
            }`}
            title={item.label}
          >
            <div className="mx-auto flex flex-col items-center justify-center text-center">
              <Icon Icon={item.icon} />
              <div>{item.label}</div>
            </div>
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            title={item.label}
            onClick={() => signOut({ callbackUrl: '/' })} // ✅ 로그아웃 후 루트로 이동
            className="rounded-md text-gray-700 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <div className="mx-auto flex flex-col items-center justify-center text-center">
              <Icon Icon={item.icon} />
              <div>{item.label}</div>
            </div>
          </button>
        )
      )}
    </div>
  );
}
