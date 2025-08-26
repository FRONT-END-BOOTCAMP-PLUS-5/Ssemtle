'use client';

import React, { useCallback, useMemo, useState } from 'react';
import PracticeInterface from '@/app/_components/organisms/PracticeInterface';
import MascotCuteLavender from './Mascot'; // ← 네가 쓴 마스코트 컴포넌트
import type { JSX, MouseEvent } from 'react';

type EyeTarget = { x: number; y: number }; // -1 ~ 1
type Mood = 'neutral' | 'happy' | 'sad';

function useIsDesktop(minWidth = 768): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  React.useEffect((): (() => void) => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const apply = (): void => setIsDesktop(mq.matches);
    apply();
    const listener = (e: MediaQueryListEvent): void => setIsDesktop(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [minWidth]);
  return isDesktop;
}

export default function SamtleLanding(): JSX.Element {
  const isDesktop = useIsDesktop(); // md 기준
  const [mood, setMood] = useState<Mood>('neutral');
  const [eyeTarget, setEyeTarget] = useState<EyeTarget>({ x: 0, y: 0 });
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // 하드코딩 체험 문제
  const demoProblem = useMemo(
    () => ({
      id: 'demo-3plus4',
      question: '3 + 4',
      answer: '7',
      helpText: '3과 4를 더하면 7이에요!',
    }),
    []
  );

  const handlePointerMove = useCallback(
    (e: MouseEvent<HTMLDivElement>): void => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      // -1 ~ 1로 클램프
      const clamp = (v: number): number => Math.max(-1, Math.min(1, v));
      setEyeTarget({ x: clamp(dx), y: clamp(dy) });
    },
    []
  );

  const handleSubmitAnswer = useCallback(
    async (userInput: string): Promise<{ isCorrect: boolean }> => {
      const ok = userInput.trim() === demoProblem.answer;
      if (ok) {
        setMood('happy');
        setIsShaking(false);
      } else {
        setMood('sad');
        setIsShaking(true);
        // 짧은 흔들림 후 정지
        window.setTimeout(() => setIsShaking(false), 500);
      }
      return { isCorrect: ok };
    },
    [demoProblem.answer]
  );

  const handleNext = useCallback((): void => {
    // 체험용이므로 다음 문제는 없음. 기분만 초기화
    setMood('neutral');
  }, []);

  // 데스크탑에선 마스코트 크게
  const mascotSize = isDesktop ? 360 : 240;

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12"
      onMouseMove={handlePointerMove}
    >
      {/* 모바일: 마스코트가 위 / 데스크탑: 좌우 배치 */}
      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-center">
        {/* 마스코트: 모바일에서 위 (order-1), 데스크탑에서 오른쪽 (order-2) */}
        <div className="order-1 flex justify-center md:order-2">
          <MascotCuteLavender
            mood={mood}
            eyeTarget={eyeTarget}
            shaking={isShaking}
            size={mascotSize}
          />
        </div>

        {/* 문제 인터페이스: 모바일에서 아래 (order-2), 데스크탑에서 왼쪽 (order-1) */}
        <div className="order-2 md:order-1">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <PracticeInterface
              userName="체험모드"
              unitName="쌤틀 체험 문제"
              currentProblem={demoProblem}
              videoUrl={undefined}
              loading={false}
              onSubmitAnswer={async (userInput) => {
                // _problem은 무시하고 데모 정답과 비교
                return handleSubmitAnswer(userInput);
              }}
              onGenerateNext={handleNext}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
