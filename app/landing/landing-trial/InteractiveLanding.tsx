'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { JSX, MouseEvent } from 'react';
import PracticeInterface from '@/app/_components/organisms/PracticeInterface';
import MascotCuteLavender from './Mascot';
import ConfettiBurst from './ConfettiBurst';

type EyeTarget = { x: number; y: number }; // -1 ~ 1
type Mood = 'neutral' | 'happy' | 'sad';

// PracticeInterface 에 맞춘 문제 타입(간단 버전)
type Problem = {
  id: string;
  question: string;
  answer: string;
  helpText: string;
};

export default function InteractiveLanding(): JSX.Element {
  // ===== 마스코트 상태 =====
  const [mood, setMood] = useState<Mood>('neutral');
  const [eyeTarget, setEyeTarget] = useState<EyeTarget>({ x: 0, y: 0 });
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // ===== 데모용 문제 5개 (원하면 여기만 교체) =====
  const problems: Problem[] = useMemo(
    () => [
      {
        id: 'p1',
        question: '3 + 4',
        answer: '7',
        helpText: '3과 4를 더하면 7!',
      },
      {
        id: 'p2',
        question: '5 - 2',
        answer: '3',
        helpText: '5에서 2를 빼면 3!',
      },
      {
        id: 'p3',
        question: '6 + 1',
        answer: '7',
        helpText: '6에 1을 더하면 7!',
      },
      {
        id: 'p4',
        question: '8 - 3',
        answer: '5',
        helpText: '8에서 3을 빼면 5!',
      },
      { id: 'p5', question: '2 + 2', answer: '4', helpText: '2 더하기 2는 4!' },
    ],
    []
  );
  const [idx, setIdx] = useState<number>(0);
  const current = problems[idx];

  // 포인터에 따라 눈동자 이동
  const handlePointerMove = useCallback(
    (e: MouseEvent<HTMLDivElement>): void => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const clamp = (v: number): number => Math.max(-1, Math.min(1, v));
      setEyeTarget({ x: clamp(dx), y: clamp(dy) });
    },
    []
  );

  // 정답 제출 처리: 맞으면 행복 + 폭죽, 틀리면 잠깐 흔들림
  const handleSubmitAnswer = useCallback(
    async (userInput: string): Promise<{ isCorrect: boolean }> => {
      const ok = userInput.trim() === current.answer;
      if (ok) {
        setMood('happy');
        setIsShaking(false);
        setShowConfetti(true);
        // 짧게 축포 보여주고 종료
        window.setTimeout(() => setShowConfetti(false), 1200);
      } else {
        setMood('sad');
        setIsShaking(true);
        window.setTimeout(() => setIsShaking(false), 500);
      }
      return { isCorrect: ok };
    },
    [current.answer]
  );

  // 다음 문제: 5개를 순환
  const handleNext = useCallback((): void => {
    setMood('neutral');
    setIdx((prev) => (prev + 1) % problems.length);
  }, [problems.length]);

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12"
      onMouseMove={handlePointerMove}
    >
      {/* 레이아웃: 모바일=세로 / 데스크탑=좌우. 마스코트는 오른쪽 고정 높이 */}
      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:items-start">
        {/* 마스코트(오른쪽) */}
        <div className="order-1 flex justify-center md:order-2 md:self-start">
          <div className="relative">
            <MascotCuteLavender
              mood={mood}
              eyeTarget={eyeTarget}
              shaking={isShaking}
              size={360}
            />
            {showConfetti && (
              <div className="pointer-events-none absolute inset-0">
                <ConfettiBurst />
              </div>
            )}
          </div>
        </div>

        {/* 문제 인터페이스(왼쪽) */}
        <div className="order-2 md:order-1">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <PracticeInterface
              userName="체험모드"
              unitName="쌤틀 체험 문제"
              currentProblem={current}
              videoUrl={undefined}
              loading={false}
              onSubmitAnswer={async (userInput) =>
                handleSubmitAnswer(userInput)
              }
              onGenerateNext={handleNext}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
