'use client';

import { useEffect } from 'react';

/**
 * 세션 API를 직접 호출해 브라우저 콘솔에 세션 원본을 기록
 * SessionProvider 컨텍스트 없이도 동작하도록 구현
 */
export default function RoleConsole() {
  useEffect(() => {
    const logSession = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        await res.json().catch(() => null);
      } catch (e) {
        console.error('[SessionConsole] fetch error:', e);
      }
    };
    logSession();
  }, []);

  return null;
}
