import SidebarUser from '@/app/_components/sidebar/SidebarUser';
import SidebarTeacher from '@/app/_components/sidebar/SidebarTeacher';
import SidebarAdmin from '@/app/_components/sidebar/SidebarAdmin';
import { auth } from '@/auth';
import RoleConsole from './RoleConsole';

/**
 * 세션의 역할(role)에 따라 적절한 사이드바를 렌더링하는 서버 컴포넌트
 */
export default async function RoleBasedSidebar() {
  const session = await auth();
  const rawRole = session?.user?.role;
  const normalizedRole = rawRole?.toString().trim().toLowerCase();

  // 서버 콘솔에 세션 전체를 기록 (배포 환경에서는 제거 가능)
  console.log('[RoleBasedSidebar] session:', session);

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
