import SidebarUser from '@/app/_components/sidebar/SidebarUser';
import SidebarTeacher from '@/app/_components/sidebar/SidebarTeacher';
import SidebarAdmin from '@/app/_components/sidebar/SidebarAdmin';
import { auth } from '@/auth';

/**
 * 세션의 역할(role)에 따라 적절한 사이드바를 렌더링하는 서버 컴포넌트
 */
export default async function RoleBasedSidebar() {
  const session = await auth();
  const role = session?.user?.role;

  if (role === 'teacher') return <SidebarTeacher />;
  if (role === 'admin') return <SidebarAdmin />;
  return <SidebarUser />;
}
