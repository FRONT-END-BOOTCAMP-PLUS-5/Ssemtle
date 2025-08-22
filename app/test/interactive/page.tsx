'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

type Q = { text: string; answer: number };

function makeQuestion(): Q {
  // 난이도: +-*/ 섞어서 간단 산술 (정수 결과)
  const ops = ['+', '-', '×', '÷'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];

  let a = Math.floor(Math.random() * 10) + 2; // 2~11
  const b = Math.floor(Math.random() * 9) + 2; // 2~10

  // 나눗셈은 나누어 떨어지도록 조정
  if (op === '÷') {
    const prod = a * b;
    a = prod; // a ÷ b = 정수
  }

  const text = `${a} ${op} ${b} = ?`;
  const answer =
    op === '+'
      ? a + b
      : op === '-'
        ? a - b
        : op === '×'
          ? a * b
          : /* ÷ */ Math.round(a / b);

  return { text, answer };
}

export default function LandingMiniGame() {
  const [q, setQ] = useState<Q>(() => makeQuestion());
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [progress, setProgress] = useState(0); // 0~100
  const [cleared, setCleared] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const step = 20; // 정답 1회마다 20% 전진 → 5문제면 골인

  const onSubmit = useCallback(() => {
    const val = Number(input.trim());
    if (Number.isNaN(val)) return;

    if (val === q.answer) {
      setStatus('correct');
      const next = Math.min(100, progress + step);
      setProgress(next);
      setTimeout(() => {
        setInput('');
        setQ(makeQuestion());
        setStatus('idle');
        if (next >= 100) {
          setCleared(true);
        }
        inputRef.current?.focus();
      }, 500);
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus('idle'), 450);
    }
  }, [input, q, progress]);

  const hint = useMemo(() => {
    if (status === 'wrong') return '다시 시도해볼까요?';
    if (status === 'correct') return '굿! 다음 문제로 이동 중…';
    return '정답을 입력하고 Enter!';
  }, [status]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      {/* 헤더 */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-indigo-800">
          ✨ 쌤틀 미니 체험
        </h2>
        <p className="mt-2 text-gray-600">
          문제를 맞출 때마다 캐릭터가 <b>앞으로 전진</b>해요. 5문제 정답 시
          골인!
        </p>
      </div>

      {/* 트랙 + 캐릭터 */}
      <div className="relative h-40 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white shadow-sm">
        {/* 골인지점 */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-indigo-700">
          🎯 Goal
        </div>

        {/* 진행선 */}
        <div
          className="absolute top-0 left-0 h-full bg-indigo-100/60 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />

        {/* 캐릭터 컨테이너 */}
        <div
          className="absolute bottom-3 left-3 transition-transform duration-500"
          style={{ transform: `translateX(calc(${progress}%))` }}
        >
          <Character status={status} />
        </div>

        {/* 골인 폭죽(간단 반짝) */}
        {cleared && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="animate-pop text-4xl">🏆</span>
          </div>
        )}
      </div>

      {/* 문제 카드 */}
      <div
        className={[
          'mx-auto mt-8 max-w-xl rounded-2xl border bg-white p-6 shadow-md transition-all',
          status === 'wrong'
            ? 'animate-shake border-red-300'
            : 'border-gray-200',
        ].join(' ')}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">진행률</div>
          <div className="text-sm font-semibold text-indigo-700">
            {progress}%
          </div>
        </div>

        <div className="mb-4 text-center text-2xl font-bold text-gray-800">
          {q.text}
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder="정답"
            inputMode="numeric"
            className="flex-1 rounded-xl border px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <button
            onClick={onSubmit}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
          >
            제출
          </button>
        </div>

        <div className="mt-3 text-center text-sm text-gray-600">{hint}</div>

        {cleared && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-amber-800">
            미션 완료! 🎉 다시 시작하려면 페이지를 새로고침하거나 정답을 계속
            제출해보세요.
          </div>
        )}
      </div>

      {/* 커스텀 키프레임 */}
      <style jsx global>{`
        @keyframes shake {
          0% {
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
          100% {
            transform: translateX(0);
          }
        }
        .animate-shake {
          animation: shake 0.45s ease-in-out;
        }

        @keyframes pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-pop {
          animation: pop 600ms ease-out both;
        }
      `}</style>
    </div>
  );
}

/** 심플 캐릭터: 표정이 정답/오답 상태에 따라 바뀜 */
function Character({ status }: { status: 'idle' | 'correct' | 'wrong' }) {
  const face = status === 'correct' ? '😀' : status === 'wrong' ? '😵' : '🙂';
  return (
    <div className="flex flex-col items-center select-none">
      {/* 몸통 */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-indigo-200 bg-white text-3xl shadow">
        {face}
      </div>
      {/* 다리(뛰는 느낌) */}
      <div
        className={[
          'mt-1 h-2 w-10 rounded-full bg-indigo-200/70',
          status === 'correct' ? 'animate-pop' : '',
        ].join(' ')}
      />
    </div>
  );
}
