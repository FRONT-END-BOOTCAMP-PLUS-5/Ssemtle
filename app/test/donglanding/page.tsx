'use client';

import { useState, useRef } from 'react';
import ProblemDisplay from '@/app/_components/molecules/ProblemDisplay';
import MascotSVG, { type MascotState } from './MascotSVG2';

export default function LandingPage() {
  const [input, setInput] = useState('');
  const [state, setState] = useState<MascotState>('idle');
  const announceRef = useRef<HTMLDivElement>(null);

  const correctAnswer = '7'; // 데모용

  const handleSubmit = () => {
    const ok = input.trim() === correctAnswer;
    setInput('');

    if (ok) {
      setState('celebrate');
      announceRef.current?.focus();
      setTimeout(() => setState('idle'), 1200);
    } else {
      setState('wrong');
      setTimeout(() => setState('idle'), 700);
    }
  };

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto grid max-w-4xl items-start gap-10 md:grid-cols-[1fr,360px]">
        <div>
          <ProblemDisplay title="쌤틀을 체험해 보세요!" equation="3 + 4 = ?" />
          <div className="mt-6 rounded-xl border bg-white p-4 shadow">
            <label htmlFor="answer" className="mb-2 block text-sm font-medium">
              정답 입력
            </label>
            <div className="flex gap-2">
              <input
                id="answer"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="숫자만 입력"
                inputMode="numeric"
                className="flex-1 rounded-lg border px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                onFocus={() => setState('thinking')}
                onBlur={() => setState('idle')}
              />
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
              >
                제출
              </button>
            </div>
          </div>
        </div>
        <MascotSVG state={state} size={220} />

        {/* keyframes */}
        <style jsx global>{`
          /* 기본 모션 */
          @keyframes breathe {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.03);
            }
          }
          @keyframes blink {
            0%,
            92%,
            100% {
              transform: scaleY(1);
            }
            96% {
              transform: scaleY(0.1);
            }
          }
          @keyframes glance {
            0%,
            100% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(6px);
            }
          }
          @keyframes hop {
            0% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-22px);
            }
            60% {
              transform: translateY(0);
            }
            80% {
              transform: translateY(-8px);
            }
            100% {
              transform: translateY(0);
            }
          }
          @keyframes spinPop {
            0% {
              transform: translateY(-8px) rotate(0deg) scale(0.9);
            }
            50% {
              transform: translateY(-28px) rotate(12deg) scale(1.05);
            }
            100% {
              transform: translateY(0) rotate(0deg) scale(1);
            }
          }
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            20% {
              transform: translateX(-8px);
            }
            40% {
              transform: translateX(8px);
            }
            60% {
              transform: translateX(-6px);
            }
            80% {
              transform: translateX(6px);
            }
          }
          @keyframes wave {
            0% {
              transform: rotate(0deg);
            }
            50% {
              transform: rotate(18deg);
            }
            100% {
              transform: rotate(0deg);
            }
          }
          @keyframes zzz {
            0% {
              opacity: 0;
              transform: translate(0, 0) scale(1);
            }
            100% {
              opacity: 1;
              transform: translate(-6px, -22px) scale(1.1);
            }
          }

          .anim-breathe {
            animation: breathe 2.2s ease-in-out infinite;
          }
          .anim-blink {
            animation: blink 3.6s ease-in-out infinite;
            transform-origin: center;
          }
          .anim-glance {
            animation: glance 2.4s ease-in-out infinite;
          }
          .anim-hop {
            animation: hop 700ms ease-out both;
          }
          .anim-shake {
            animation: shake 600ms ease-in-out both;
          }
          .anim-wave {
            animation: wave 900ms ease-in-out infinite;
            transform-origin: top right;
          }
          .anim-celebrate {
            animation: spinPop 1.1s ease-out both;
          }
          .anim-zzz {
            animation: zzz 1.3s ease-out forwards;
          }
        `}</style>
      </div>
    </main>
  );
}
