'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * 현재 세션의 유저 역할을 브라우저 콘솔에 출력하는 디버그 컴포넌트
 */
export default function RoleDebugger() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // 로딩/세션 상태, 역할 모두 출력
    const currentRole = session?.user?.role ?? 'unknown';
    console.log('[RoleDebugger] status:', status);
    console.log('[RoleDebugger] current user role:', currentRole);
    console.log('[RoleDebugger] session from useSession:', session ?? null);

    // 세션 API 직접 점검 (라우트/쿠키/설정 문제 진단)
    fetch('/api/auth/session')
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        console.log('[RoleDebugger] /api/auth/session status:', res.status);
        console.log('[RoleDebugger] /api/auth/session body:', json);
      })
      .catch((err) => {
        console.error('[RoleDebugger] /api/auth/session error:', err);
      });
  }, [session, status]);

  return null;
}
