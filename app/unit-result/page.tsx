'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// 단원평가 결과 아이템 타입
type UnitSolveItem = {
  id: number;
  question: string;
  answer: string;
  helpText?: string;
  userInput: string;
  isCorrect: boolean;
  createdAt: string;
};

// 사용자 단원평가 결과 조회 함수 (React Query용)
async function fetchMyUnitSolves(
  code?: string
): Promise<{ items: UnitSolveItem[]; codeExists: boolean }> {
  const qs = code ? `?code=${encodeURIComponent(code)}` : '';
  const res = await fetch(`/api/unit-exam/solves${qs}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('단원평가 결과를 불러오지 못했습니다.');
  }
  const data = await res.json();
  const list: Array<{
    id: number;
    question: string;
    answer: string;
    helpText?: string;
    userInput: string;
    isCorrect: boolean;
    createdAt: string | number | Date;
  }> = Array.isArray(data?.solves) ? data.solves : [];
  const items = list.map((s) => ({
    id: s.id,
    question: s.question,
    answer: s.answer,
    helpText: s.helpText,
    userInput: s.userInput,
    isCorrect: Boolean(s.isCorrect),
    createdAt: new Date(s.createdAt).toISOString(),
  }));
  return { items, codeExists: Boolean(data?.codeExists) };
}

// 정답률 및 요약 계산
function useSummary(items: UnitSolveItem[]) {
  return useMemo(() => {
    const total = items.length;
    const correct = items.filter((i) => i.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, wrong: total - correct, accuracy };
  }, [items]);
}

// 풀이 일시 계산 (세트 내 가장 이른 시간 기준)
function useAttemptDate(items: UnitSolveItem[]) {
  return useMemo(() => {
    if (!items || items.length === 0) return '';
    const minTs = items.reduce((min, it) => {
      const ts = new Date(it.createdAt).getTime();
      return Math.min(min, ts);
    }, Number.POSITIVE_INFINITY);
    const d = new Date(minTs);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [items]);
}

// 실제 페이지 내용을 렌더링하는 클라이언트 컴포넌트
const UnitResultContent = () => {
  const [items, setItems] = useState<UnitSolveItem[]>([]);
  const [error, setError] = useState<string>('');
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const [code, setCode] = useState<string>('');
  const [codeInput, setCodeInput] = useState<string>('');
  const [codeExists, setCodeExists] = useState<boolean | null>(null);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const summary = useSummary(items);
  const attemptDate = useAttemptDate(items);

  // URL 파라미터에서 code를 읽어옴 (?code=ABCDEF-01)
  useEffect(() => {
    const c = (searchParams.get('code') || '').toUpperCase();
    setCode(c);
    setCodeInput(c);
  }, [searchParams]);

  const query = useQuery({
    queryKey: ['unit-result', code],
    queryFn: () => fetchMyUnitSolves(code || undefined),
    enabled: Boolean(code),
  });

  useEffect(() => {
    if (query.isSuccess) {
      setItems(query.data.items);
      setCodeExists(query.data.codeExists);
    }
    if (query.isError) setError('결과를 불러오는 중 오류가 발생했습니다.');
  }, [query.isSuccess, query.isError, query.data]);

  // 단일/전체 토글 핸들러
  const toggleOne = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 코드 미입력 시 코드 입력 안내 UI
  if (!code) {
    const onSubmit = () => {
      const normalized = codeInput.trim();
      if (!normalized) {
        setError('코드를 입력해주세요.');
        return;
      }
      setError('');
      setCode(normalized);
      const params = new URLSearchParams(searchParams.toString());
      params.set('code', normalized);
      router.replace(`${pathname}?${params.toString()}`);
    };

    return (
      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="text-lg font-semibold">단원평가 코드 입력</div>
          <p className="mt-2 text-sm text-gray-600">
            단원평가 코드를 입력하면 해당 코드로 제출한 결과가 표시됩니다.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              placeholder="예: 단원평가 코드"
              className="flex-1 rounded border p-3 font-mono"
            />
            <button
              onClick={onSubmit}
              className="rounded bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
            >
              확인
            </button>
          </div>
          {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}
        </div>
      </div>
    );
  }

  if (query.isLoading) {
    return <div>불러오는 중...</div>;
  }

  // 코드가 있으나 결과가 비어 있는 경우: 코드 존재 여부에 따라 분기
  if (code && query.isSuccess && items.length === 0) {
    const retry = () => {
      const normalized = codeInput.trim().toUpperCase();
      if (!normalized) {
        setError('코드를 입력해주세요.');
        return;
      }
      setError('');
      setCode(normalized);
      const params = new URLSearchParams(searchParams.toString());
      params.set('code', normalized);
      router.replace(`${pathname}?${params.toString()}`);
    };

    // 코드가 존재하지 않음
    if (codeExists === false) {
      return (
        <div className="mx-auto w-full max-w-2xl p-6">
          <div className="rounded-xl border bg-white p-6">
            <div className="text-lg font-semibold">
              올바른 코드를 입력해주세요
            </div>
            <p className="mt-2 text-sm text-gray-600">
              입력한 코드에 대한 결과가 없습니다. 코드를 다시 확인해 주세요.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && retry()}
                placeholder="예: ABCDEF-01"
                className="flex-1 rounded border p-3 font-mono"
              />
              <button
                onClick={retry}
                className="rounded bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
              >
                확인
              </button>
            </div>
            {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}
          </div>
        </div>
      );
    }

    // 코드가 존재하지만, 현재 계정의 제출 내역이 없는 경우
    return (
      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="rounded-xl border bg-white p-6">
          <div className="text-lg font-semibold">제출 내역이 없습니다</div>
          <p className="mt-2 text-sm text-gray-600">
            코드가 존재하지만, 현재 계정으로 제출한 결과가 없습니다. 제출 후
            다시 확인해 주세요.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && retry()}
              placeholder="예: ABCDEF-01"
              className="flex-1 rounded border p-3 font-mono"
            />
            <button
              onClick={retry}
              className="rounded bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
            >
              확인
            </button>
          </div>
          {error && <div className="mt-2 text-sm text-rose-600">{error}</div>}
        </div>
      </div>
    );
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* 상단 요약 카드 */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <div className="text-4xl font-extrabold text-emerald-600 md:text-5xl">
            {summary.accuracy}점
          </div>
          <div className="mt-1 text-sm text-gray-600">
            풀이일시 {attemptDate}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="mt-2 text-sm text-gray-700">
            정답률 {summary.accuracy}%
          </div>
          <div className="mt-5 h-3 w-full rounded bg-gray-100">
            <div
              className="h-3 rounded bg-emerald-500"
              style={{ width: `${summary.accuracy}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-center rounded-xl border bg-white p-5">
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-xs text-gray-500">정답</div>
              <div className="text-2xl font-bold text-emerald-600 md:text-3xl">
                {summary.correct}
              </div>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <div className="text-xs text-gray-500">오답</div>
              <div className="text-2xl font-bold text-rose-600 md:text-3xl">
                {summary.wrong}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 문제별 상세 결과 리스트 */}
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="rounded-xl border bg-white py-12 text-center text-gray-500">
            아직 풀이한 단원평가가 없습니다.
          </div>
        )}
        {items.map((it, idx) => {
          const isOpen = openIds.has(it.id);
          return (
            <div
              key={it.id}
              className={`overflow-hidden rounded-xl border ${it.isCorrect ? 'border-emerald-200' : 'border-rose-200'}`}
            >
              {/* 헤더 */}
              <button
                className="flex w-full items-center justify-between bg-white p-4 text-left hover:bg-gray-50"
                onClick={() => toggleOne(it.id)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm text-white ${it.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-sm ${it.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                  >
                    {it.isCorrect ? '정답' : '오답'}
                  </span>
                  <span className="font-medium text-gray-800">
                    문제: {it.question}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {isOpen ? '접기 ▲' : '해설 ▼'}
                </span>
              </button>

              {/* 본문: 토글 영역 (고정 높이 + 내부 스크롤) */}
              <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="border-t bg-gray-50 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-600">해설</div>
                      <div className="mt-1 max-h-56 overflow-auto rounded border bg-white p-3 text-sm whitespace-pre-wrap">
                        {it.helpText || '해설이 없습니다.'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="rounded border bg-white p-3 text-sm">
                        <div className="text-gray-500">내 답안</div>
                        <div className="font-semibold">
                          {it.userInput || '-'}
                        </div>
                      </div>
                      <div className="rounded border bg-white p-3 text-sm">
                        <div className="text-gray-500">정답</div>
                        <div className="font-semibold">{it.answer}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Suspense 경계로 감싸기 위한 상위 컴포넌트
const UnitResultPage = () => {
  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <UnitResultContent />
    </Suspense>
  );
};

export default UnitResultPage;
