'use client';

import { useState } from 'react';

type ApiResponse = {
  question_nums: number;
  is_correct_nums: number;
  items: Array<{
    question?: string;
    answer?: string;
    helpText?: string;
    userInput: string;
    isCorrect: boolean;
    created_at: string;
    unit_name: string;
    vid_url: string;
    source: 'solve' | 'unitSolve';
  }>;
};

export default function TestErrorNotesPage() {
  // 현재 날짜 기본값(YYYY-MM-DD)
  const today = new Date();
  const defaultDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .slice(0, 10);
  const [date, setDate] = useState<string>(defaultDate);
  const [loading, setLoading] = useState(false);

  const [resCommon, setResCommon] = useState<ApiResponse | null>(null);
  const [resUnit, setResUnit] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callCommon = async () => {
    try {
      setLoading(true);
      setError(null);
      setResCommon(null);
      const r = await fetch(
        `/api/mypage/error-notes/common-question?date=${date}`
      );
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        const errMsg =
          typeof j === 'object' && j !== null && 'error' in j
            ? String((j as { error?: unknown }).error)
            : '요청 실패';
        throw new Error(errMsg);
      }
      const data: ApiResponse = await r.json();
      console.log('[ErrorNotes][Page] COMMON result', data);
      setResCommon(data);
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: unknown }).message)
          : '오류가 발생했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const callUnit = async () => {
    try {
      setLoading(true);
      setError(null);
      setResUnit(null);
      const r = await fetch(
        `/api/mypage/error-notes/unit-evaluation-question?date=${date}`
      );
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        const errMsg =
          typeof j === 'object' && j !== null && 'error' in j
            ? String((j as { error?: unknown }).error)
            : '요청 실패';
        throw new Error(errMsg);
      }
      const data: ApiResponse = await r.json();
      console.log('[ErrorNotes][Page] UNIT result', data);
      setResUnit(data);
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e
          ? String((e as { message?: unknown }).message)
          : '오류가 발생했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">오답 노트 테스트</h1>
      <div className="flex items-center gap-2">
        <label className="text-sm">날짜</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={callCommon}
          className="border rounded px-3 py-1 bg-blue-600 text-white"
        >
          일반(solves)만 조회
        </button>
        <button
          onClick={callUnit}
          className="border rounded px-3 py-1 bg-green-600 text-white"
        >
          단원평가(unit_solves)만 조회
        </button>
      </div>
      {loading && <div>로딩 중...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {resCommon && (
        <div className="space-y-2">
          <div className="text-sm font-bold mt-6">일반(solves) 결과</div>
          <div className="text-sm">전체 문제 수: {resCommon.question_nums}</div>
          <div className="text-sm">
            맞은 문제 수: {resCommon.is_correct_nums}
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {resCommon.items.map((it, idx) => (
              <li key={idx}>
                <div className="text-xs text-gray-600">
                  [{it.source}] {it.unit_name}
                </div>
                {it.question && (
                  <div className="text-sm">문제: {it.question}</div>
                )}
                <div className="text-xs">
                  푼 날짜: {new Date(it.created_at).toLocaleString()}
                </div>
                {it.helpText && (
                  <div className="text-xs">해설: {it.helpText}</div>
                )}
                <div className="text-xs">내 답: {it.userInput}</div>
                <div className="text-xs">정답: {it.answer}</div>
                <a
                  href={it.vid_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline text-xs"
                >
                  단원 영상 보기
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resUnit && (
        <div className="space-y-2">
          <div className="text-sm font-bold mt-6">
            단원평가(unit_solves) 결과
          </div>
          <div className="text-sm">전체 문제 수: {resUnit.question_nums}</div>
          <div className="text-sm">맞은 문제 수: {resUnit.is_correct_nums}</div>
          <ul className="list-disc pl-5 space-y-1">
            {resUnit.items.map((it, idx) => (
              <li key={idx}>
                <div className="text-xs text-gray-600">
                  [{it.source}] {it.unit_name}
                </div>
                {it.question && (
                  <div className="text-sm">문제: {it.question}</div>
                )}
                <div className="text-xs">
                  푼 날짜: {new Date(it.created_at).toLocaleString()}
                </div>
                {it.helpText && (
                  <div className="text-xs">해설: {it.helpText}</div>
                )}
                <div className="text-xs">내 답: {it.userInput}</div>
                <div className="text-xs">정답: {it.answer}</div>
                <a
                  href={it.vid_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline text-xs"
                >
                  단원 영상 보기
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
