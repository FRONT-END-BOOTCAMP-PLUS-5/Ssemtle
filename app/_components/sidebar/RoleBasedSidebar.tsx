'use client';

import SidebarUser from '@/app/_components/sidebar/SidebarUser';
import SidebarTeacher from '@/app/_components/sidebar/SidebarTeacher';
import SidebarAdmin from '@/app/_components/sidebar/SidebarAdmin';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * 세션의 역할(role)에 따라 적절한 사이드바를 렌더링하는 클라이언트 컴포넌트
 */
export default function RoleBasedSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const isLandingPage = pathname === '/landing';
  const isAuthPage =
    pathname?.startsWith('/signin') || pathname?.startsWith('/signup');

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 서버에서는 로딩 상태 표시
  if (!isClient || status === 'loading') {
    return null;
  }

  // 랜딩/인증 페이지에서는 사이드바 숨김
  if (isLandingPage || isAuthPage) {
    return null;
  }

  const rawRole = session?.user?.role;
  const normalizedRole = rawRole?.toString().trim().toLowerCase();

  if (normalizedRole === 'teacher') return <SidebarTeacher />;
  if (normalizedRole === 'admin') return <SidebarAdmin />;
  return <SidebarUser />;
}
