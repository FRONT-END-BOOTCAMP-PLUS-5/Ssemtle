'use client';

import { useEffect, useState } from 'react';

interface ProblemItem {
  id: number;
  question: string;
  answer: string;
  helpText: string;
}

interface ProblemsModalProps {
  isOpen: boolean;
  code: string;
  onClose: () => void;
}

export default function ProblemsModal({
  isOpen,
  code,
  onClose,
}: ProblemsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState('');
  const [items, setItems] = useState<ProblemItem[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !code) return;
      setIsLoading(true);
      setIsError('');
      try {
        const res = await fetch(`/api/admin/unit-exam-codes/${code}`, {
          method: 'GET',
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          setIsError(json?.error || '문제 조회에 실패했습니다.');
          setItems([]);
        } else {
          setItems(json.data?.problems ?? []);
        }
      } catch {
        setIsError('문제 조회 중 오류가 발생했습니다.');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen, code]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-[70vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-4 shadow-xl sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-700">
            문제 보기 - {code}
          </h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto rounded-xl border border-neutral-200 bg-white p-3">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-neutral-500">
              불러오는 중...
            </div>
          ) : isError ? (
            <div className="py-10 text-center text-sm text-rose-500">
              {isError}
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-neutral-500">
              문제가 없습니다.
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((p, idx) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-neutral-200 p-3"
                >
                  <div className="mb-1 text-xs font-semibold text-neutral-500">
                    문제 {idx + 1}
                  </div>
                  <div className="text-sm whitespace-pre-wrap text-neutral-800">
                    {p.question}
                  </div>
                  <div className="mt-2 text-xs text-neutral-600">
                    정답:{' '}
                    <span className="font-semibold text-emerald-700">
                      {p.answer}
                    </span>
                  </div>
                  {p.helpText && (
                    <div className="mt-1 text-xs whitespace-pre-wrap text-neutral-500">
                      {p.helpText}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
