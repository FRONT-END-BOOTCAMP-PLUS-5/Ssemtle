'use client';

import React, { useEffect, useMemo, useState } from 'react';

export default function ConfettiBurst() {
  const pieces = useMemo(() => {
    const n = 38;
    return Array.from({ length: n }).map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      dist: 70 + Math.random() * 90,
      size: 6 + Math.random() * 6,
      dur: 900 + Math.random() * 600,
      color: pick([
        '#ef4444',
        '#f59e0b',
        '#10b981',
        '#3b82f6',
        '#a855f7',
        '#ec4899',
      ]),
    }));
  }, []);

  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setPlaying(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!playing) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
      <div className="relative h-0 w-0 translate-x-[130px] translate-y-[120px]">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute block"
            style={
              {
                width: p.size,
                height: p.size * 0.6,
                background: p.color,
                borderRadius: 2,
                transform: 'translate(-50%, -50%)',
                animation: `cf-burst ${p.dur}ms ease-out forwards`,
                '--tx': `${Math.cos(p.angle) * p.dist}px`,
                '--ty': `${Math.sin(p.angle) * p.dist}px`,
                opacity: 0.95,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes cf-burst {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0.95;
          }
          70% {
            transform: translate(
                calc(-50% + var(--tx) * 0.9),
                calc(-50% + var(--ty) * 0.9)
              )
              rotate(25deg);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty)))
              rotate(45deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
