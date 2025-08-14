'use client';

import { useEffect } from 'react';

/**
 * 헤더 DOM을 관찰해 높이를 CSS 변수(--header-h)로 주입하는 컴포넌트
 * 헤더 컴포넌트를 수정하지 않고도 레이아웃이 자동 반영되도록 함
 */
export default function HeaderSizeObserver() {
  useEffect(() => {
    const headerEl = document.querySelector('header');
    if (!headerEl) return;

    const setVar = () => {
      const h = Math.round(
        (headerEl as HTMLElement).getBoundingClientRect().height
      );
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    };

    setVar();

    const ro = new ResizeObserver(setVar);
    ro.observe(headerEl as Element);
    window.addEventListener('load', setVar);
    window.addEventListener('resize', setVar);

    return () => {
      ro.disconnect();
      window.removeEventListener('load', setVar);
      window.removeEventListener('resize', setVar);
    };
  }, []);

  return null;
}
