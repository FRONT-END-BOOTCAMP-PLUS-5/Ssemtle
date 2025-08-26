// app/test/interactive/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fef7ff] p-8">
      <div className="space-y-6 text-center">
        <h1 className="text-sm text-gray-600">Googly Eyes Logo Test</h1>
        <GooglyLogo
          text="쌤틀"
          className="text-7xl font-extrabold sm:text-8xl"
        />
        <p className="text-gray-500">마우스를 움직여보세요 👀</p>
      </div>
    </main>
  );
}

function GooglyLogo({
  text = '쌤틀',
  className = 'text-7xl font-extrabold',
  eyeSize = 20,
  pupilSize = 8,
}: {
  text?: string;
  className?: string;
  eyeSize?: number;
  pupilSize?: number;
}) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 타입을 DOM 이벤트로 확정 (React.MouseEvent와 혼동 방지)
    const onMove = (e: WindowEventMap['mousemove']) =>
      setMouse({ x: e.clientX, y: e.clientY });

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className={`flex gap-4 ${className}`}>
      {text.split('').map((ch, i) => (
        <LetterWithEyes
          key={`${ch}-${i}`}
          char={ch}
          mouse={mouse}
          eyeSize={eyeSize}
          pupilSize={pupilSize}
        />
      ))}
    </div>
  );
}

function LetterWithEyes({
  char,
  mouse,
  eyeSize,
  pupilSize,
}: {
  char: string;
  mouse: { x: number; y: number };
  eyeSize: number;
  pupilSize: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // 필요하면 글자별로 좌표 튜닝 가능
  const eyes = [
    { left: '15%', top: '10%' }, // 왼쪽 눈
    { left: '55%', top: '12%' }, // 오른쪽 눈
  ];

  return (
    <div ref={ref} className="relative inline-block px-1 leading-none">
      <span className="relative z-0">{char}</span>
      {eyes.map((pos, i) => (
        <Eye
          key={i}
          containerRef={ref}
          mouse={mouse}
          left={pos.left}
          top={pos.top}
          size={eyeSize}
          pupil={pupilSize}
        />
      ))}
    </div>
  );
}

function Eye({
  containerRef,
  mouse,
  left,
  top,
  size,
  pupil,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  mouse: { x: number; y: number };
  left: string;
  top: string;
  size: number;
  pupil: number;
}) {
  const radius = (size - pupil) / 2.5; // 동공 이동 한계
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;

    const el = containerRef.current;
    if (!el) return; // 널 가드

    raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      // 요소가 아직 레이아웃되지 않았을 때 방어
      const w = rect.width || 1;
      const h = rect.height || 1;

      // 퍼센트를 px로 변환
      const cx = rect.left + (parseFloat(left) / 100) * w + size / 2;
      const cy = rect.top + (parseFloat(top) / 100) * h + size / 2;

      const dx = mouse.x - cx;
      const dy = mouse.y - cy;
      const d = Math.hypot(dx, dy) || 1;

      const nx = (dx / d) * Math.min(radius, Math.abs(dx));
      const ny = (dy / d) * Math.min(radius, Math.abs(dy));
      setOffset({ x: nx, y: ny });
    });

    return () => cancelAnimationFrame(raf);
  }, [mouse.x, mouse.y, containerRef, left, top, size, pupil, radius]);

  return (
    <span
      className="absolute z-10 rounded-full bg-white shadow-sm"
      style={{
        left,
        top,
        width: size,
        height: size,
        boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.15)',
      }}
    >
      <span
        className="absolute rounded-full bg-black transition-transform duration-75 will-change-transform"
        style={{
          width: pupil,
          height: pupil,
          left: `calc(50% - ${pupil / 2}px)`,
          top: `calc(50% - ${pupil / 2}px)`,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      />
      {/* 하이라이트 점 */}
      <span
        className="absolute rounded-full bg-white/70"
        style={{
          width: Math.max(3, pupil * 0.4),
          height: Math.max(3, pupil * 0.4),
          left: 2,
          top: 2,
        }}
      />
    </span>
  );
}
