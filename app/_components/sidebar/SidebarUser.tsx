'use client';

import HeaderSizeObserver from './HeaderSizeObserver';
import Image from 'next/image';
import { LuLogOut } from 'react-icons/lu';
import { FaPen } from 'react-icons/fa6';
import { GiBookshelf } from 'react-icons/gi';
import { PiExamLight } from 'react-icons/pi';
import { FaCircleUser } from 'react-icons/fa6';
import Icon from './Icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const SidebarUser = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  console.log(session?.user.userId);
  const NAV = [
    { label: '문제풀기', href: '/write', icon: FaPen },
    { label: '문제집', href: '/bookshelf', icon: GiBookshelf },
    { label: '단원평가', href: '/unit', icon: PiExamLight },
    {
      label: '마이페이지',
      href: `/mypage/${session?.user.userId}`,
      icon: FaCircleUser,
    },
    { label: '로그아웃', href: '/logout', icon: LuLogOut },
  ];

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/');

  // const handleLogout = () => {
  //   // TODO: 실제 로그아웃 로직 (예: next-auth signOut() 또는 /api/auth/signout 호출)
  //   console.log('[Sidebar] logout clicked');
  // };

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
        {/* ✅ 라우팅: 각 아이템을 Link로 감싸기 */}
        {NAV.map(({ label, href, icon: I }) => (
          <Link
            key={label}
            href={href}
            aria-label={label}
            prefetch // (기본 true지만 명시적으로; 무거운 페이지면 false 고려)
            className={`rounded-md transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${isActive(href) ? 'text-indigo-600' : 'text-gray-700'}`}
            title={label}
          >
            <Icon Icon={I} />
          </Link>
        ))}
      </div>
    </>
  );
};

export default SidebarUser;
