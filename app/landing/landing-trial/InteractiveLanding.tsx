'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { JSX, MouseEvent } from 'react';
import { useKeyboardDetection } from '@/app/_hooks/useKeyboardDetection';

// 업로드해둔 컴포넌트들
import ProblemDisplay from '@/app/_components/molecules/ProblemDisplay';
import AnswerSection, {
  SubmitState,
} from '@/app/_components/molecules/AnswerSection';
import NumberPad from '@/app/_components/molecules/NumberPad';
import HelpSection from '@/app/_components/molecules/HelpSection';

// 마스코트/컨페티
import MascotCuteLavender from './Mascot';
import ConfettiBurst from './ConfettiBurst';

type EyeTarget = { x: number; y: number }; // -1 ~ 1
type Mood = 'neutral' | 'happy' | 'sad';

type Problem = {
  id: string;
  question: string;
  answer: string;
  helpText: string;
  instruction?: string;
};

export default function InteractiveLanding(): JSX.Element {
  useKeyboardDetection();

  // ===== 마스코트 상태 =====
  const [mood, setMood] = useState<Mood>('neutral');
  const [eyeTarget, setEyeTarget] = useState<EyeTarget>({ x: 0, y: 0 });
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // ===== 문제/입력/제출 상태 =====
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
  const [idx, setIdx] = useState(0);
  const current = problems[idx];

  const [userInput, setUserInput] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasAnswerCorrect, setWasAnswerCorrect] = useState<boolean | undefined>(
    undefined
  );

  // 포인터에 따라 눈동자 이동
  const handlePointerMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    setEyeTarget({ x: clamp(dx), y: clamp(dy) });
  }, []);

  // 입력/버튼 핸들러
  const handleInputChange = (value: string) => {
    setUserInput(value);
    if (submitState !== 'initial') setSubmitState('initial');
  };
  const handleNumberClick = (number: string) => {
    if (submitState === 'initial') setUserInput((prev) => prev + number);
  };
  const handleOperatorClick = (operator: string) => {
    if (submitState === 'initial') setUserInput((prev) => prev + operator);
  };
  const handleClear = () => {
    setUserInput('');
    if (submitState !== 'initial') setSubmitState('initial');
  };

  // 제출 로직 (마스코트 반응 + 컨페티)
  const handleSubmit = async () => {
    if (!userInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const ok = userInput.trim() === current.answer;
      setWasAnswerCorrect(ok);
      setSubmitState(ok ? 'correct' : 'incorrect');

      if (ok) {
        setMood('happy');
        setIsShaking(false);
        setShowConfetti(true);
        window.setTimeout(() => setShowConfetti(false), 1200);
      } else {
        setMood('sad');
        setIsShaking(true);
        window.setTimeout(() => setIsShaking(false), 500);
      }

      // 1.5초 뒤 '다음' 상태로 전환
      window.setTimeout(() => setSubmitState('next'), 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다음 문제
  const handleNext = () => {
    setMood('neutral');
    setIdx((prev) => (prev + 1) % problems.length);
    setUserInput('');
    setSubmitState('initial');
    setWasAnswerCorrect(undefined);
  };

  // 비디오(선택)
  const videoUrl = undefined; // 필요 시 유튜브 ID 넣기

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12"
      onMouseMove={handlePointerMove}
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_380px] md:items-start">
        {/* ✅ 캐릭터 영역 - 모바일에서 먼저, 데스크탑에선 오른쪽 고정 */}
        <aside className="order-1 mx-auto md:sticky md:top-1/2 md:order-2 md:mx-0 md:-translate-y-1/2">
          <div className="relative overflow-visible">
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
        </aside>

        {/* ✅ 문제/답안/패드/해설 */}
        <div className="order-2 md:order-1">
          <div className="mx-auto flex w-full flex-col space-y-6">
            {/* Problem Display */}
            <ProblemDisplay
              title={`체험모드 - 쌤틀 체험 문제`}
              equation={current.question}
            />

            {/* Answer Input */}
            <AnswerSection
              value={userInput}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              onNext={handleNext}
              submitState={submitState}
              wasAnswerCorrect={wasAnswerCorrect}
              loading={isSubmitting}
              disabled={false}
            />

            {/* Number Pad */}
            <NumberPad
              onNumberClick={handleNumberClick}
              onOperatorClick={handleOperatorClick}
              onClear={handleClear}
              disabled={isSubmitting || submitState !== 'initial'}
            />

            {/* Help Section - 초기엔 자리 차지하지 않도록 조건부 렌더 */}
            {(submitState !== 'initial' || !!videoUrl) && (
              <HelpSection
                answerText={current.answer}
                helpText={current.helpText}
                videoUrl={videoUrl}
                unitName={'쌤틀 체험 문제'}
                submitState={submitState}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
