'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface WorkbookAuthGuardProps {
  children: ReactNode;
}

export default function WorkbookAuthGuard({
  children,
}: WorkbookAuthGuardProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="mx-auto">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="mx-auto">
        <div className="flex h-96 items-center justify-center">
          <div className="text-gray-600">로그인이 필요합니다</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
