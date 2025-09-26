'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export function useKeyboardDetection() {
  const lastNotificationRef = useRef<number>(0);
  const THROTTLE_DELAY = 3000; // 3 seconds

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip system keys and modifier keys
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.key === 'Shift' ||
        event.key === 'Control' ||
        event.key === 'Alt' ||
        event.key === 'Meta' ||
        event.key === 'Tab' ||
        event.key === 'Escape' ||
        event.key === 'F1' ||
        event.key === 'F2' ||
        event.key === 'F3' ||
        event.key === 'F4' ||
        event.key === 'F5' ||
        event.key === 'F6' ||
        event.key === 'F7' ||
        event.key === 'F8' ||
        event.key === 'F9' ||
        event.key === 'F10' ||
        event.key === 'F11' ||
        event.key === 'F12'
      ) {
        return;
      }

      // Only trigger for meaningful input keys
      const meaningfulKeys = /^[a-zA-Z0-9\+\-\*\/\.\,\(\)\^\√\=\s]$/;
      if (!meaningfulKeys.test(event.key)) {
        return;
      }

      // Throttle notifications
      const now = Date.now();
      if (now - lastNotificationRef.current < THROTTLE_DELAY) {
        return;
      }

      lastNotificationRef.current = now;
      toast.info('이 페이지에서는 키보드를 사용하지 않습니다');
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
