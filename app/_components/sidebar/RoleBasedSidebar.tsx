'use client';

import SidebarUser from '@/app/_components/sidebar/SidebarUser';
import SidebarTeacher from '@/app/_components/sidebar/SidebarTeacher';
import SidebarAdmin from '@/app/_components/sidebar/SidebarAdmin';
import RoleConsole from './RoleConsole';
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

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 서버에서는 로딩 상태 표시
  if (!isClient || status === 'loading') {
    return null;
  }

  if (isLandingPage) {
    return null;
  }

  const rawRole = session?.user?.role;
  const normalizedRole = rawRole?.toString().trim().toLowerCase();

  // 브라우저 콘솔에도 세션 원본 출력
  const Console = <RoleConsole />;

  if (normalizedRole === 'teacher')
    return (
      <>
        {Console}
        <SidebarTeacher />
      </>
    );
  if (normalizedRole === 'admin')
    return (
      <>
        {Console}
        <SidebarAdmin />
      </>
    );
  return (
    <>
      {Console}
      <SidebarUser />
    </>
  );
}
