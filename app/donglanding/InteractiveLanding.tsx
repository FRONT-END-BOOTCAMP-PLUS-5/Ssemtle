'use client';

import React, { useMemo, useRef, useState } from 'react';
import PracticeInterface from '@/app/_components/organisms/PracticeInterface';
import Mascot from './Mascot';
import ConfettiBurst from './ConfettiBurst';

type ResultState = 'idle' | 'correct' | 'wrong';

type Problem = {
  id: string;
  question: string;
  answer: string;
  helpText: string;
};

export default function LandingInteractive() {
  // 데모 문제(항상 같은 식, id는 리셋용으로만 갱신)
  const [problem, setProblem] = useState<Problem>({
    id: 'demo-0',
    question: '3 + 4',
    answer: '7',
    helpText: '더하기 기본 예제예요. 3과 4를 더해보세요!',
  });

  const [state, setState] = useState<ResultState>('idle');
  const [burstKey, setBurstKey] = useState(0); // 컨페티 재생용 키
  const [eyeTarget, setEyeTarget] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  const mood = useMemo<'neutral' | 'happy' | 'sad'>(() => {
    if (state === 'correct') return 'happy';
    if (state === 'wrong') return 'sad';
    return 'neutral';
  }, [state]);

  // PracticeInterface에게 제공되는 제출 핸들러
  const onSubmitAnswer = async (userInput: string) => {
    const isCorrect = String(userInput).trim() === problem.answer;
    if (isCorrect) {
      setState('correct');
      setBurstKey((k) => k + 1); // 컨페티 발사
    } else {
      setState('wrong');
      // 살짝 놀란 다음 천천히 idle 복귀
      setTimeout(() => setState('idle'), 900);
    }
    return { isCorrect };
  };

  // 다음 문제: 데모에선 같은 문제를 리셋(입력창/상태 초기화 목적)
  const onGenerateNext = () => {
    setState('idle');
    setProblem((p) => ({
      ...p,
      id: `demo-${Date.now()}`, // id 바꿔서 내부 입력 초기화 유도
    }));
  };

  // 눈동자용 마우스 타깃( -1~1 범위 )
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nx = (e.clientX - cx) / (rect.width / 2);
    const ny = (e.clientY - cy) / (rect.height / 2);
    setEyeTarget({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    });
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMouseMove}
      className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-16 tablet:flex-row tablet:items-start"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 to-white" />

      {/* 왼쪽: PracticeInterface */}
      <div className="w-full tablet:flex-1">
        <div className="mb-6 text-center tablet:text-left">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            쌤틀과 함께 문제를 풀어봐요!
          </h1>
          <p className="mt-2 text-gray-600">예시 문제를 풀어보세요.</p>
        </div>

        <PracticeInterface
          userName="게스트"
          unitName="사칙연산"
          currentProblem={problem}
          videoUrl={undefined}
          loading={false}
          onSubmitAnswer={onSubmitAnswer}
          onGenerateNext={onGenerateNext}
        />
      </div>

      {/* 오른쪽: 마스코트 + 컨페티 */}
      <div className="relative w-full max-w-[320px] tablet:sticky tablet:top-16 tablet:w-auto">
        <Mascot mood={mood} eyeTarget={eyeTarget} shaking={state === 'wrong'} />
        {state === 'correct' && <ConfettiBurst key={burstKey} />}
      </div>
    </div>
  );
}
