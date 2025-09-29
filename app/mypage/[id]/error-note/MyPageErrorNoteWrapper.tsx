'use client';

import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ErrorNoteInterface from '@/app/error-note/_components/ErrorNoteInterface';
import { createMyPageConfig } from '@/app/error-note/_components/createMyPageConfig';

export default function MyPageErrorNoteWrapper() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const params = useParams();

  // ✅ 우선순위: 쿼리 userId > 경로 [id] (세션으로 덮지 않음)
  const queryUserId = searchParams.get('userId') || undefined;
  const pathUserId = (params?.id as string | undefined) || undefined;

  const effectiveUserId = useMemo(() => {
    const raw = queryUserId ?? pathUserId ?? '';
    return raw ? decodeURIComponent(raw).trim() : '';
  }, [queryUserId, pathUserId]);

  // 편집 가능(내 페이지면 true). 데이터 조회는 위 effectiveUserId 기준.
  const sessionUserId = session?.user?.userId;
  const canEdit =
    !!sessionUserId &&
    (!!effectiveUserId ? effectiveUserId === sessionUserId : true);

  // Create configuration for MyPage
  const config = useMemo(() => {
    if (!effectiveUserId) {
      return undefined; // Don't render until we have a userId
    }
    return createMyPageConfig(effectiveUserId, canEdit);
  }, [effectiveUserId, canEdit]);

  // Loading states
  if (status === 'loading') {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="mb-4 text-gray-600">로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  if (!effectiveUserId || !config) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="mb-4 text-gray-600">유효하지 않은 사용자입니다</p>
        </div>
      </div>
    );
  }

  return <ErrorNoteInterface config={config} />;
}
