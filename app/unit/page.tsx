'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

// 단원평가 시작 페이지 컴포넌트
// - 코드 입력값 유효성 검사 후, TanStack Query(POST 훅)로 검증/문제 조회 진행
const UnitPage = () => {
  const [unitCode, setUnitCode] = useState('');

  // 입력창 변경 핸들러: 사용자가 단원평가 코드를 입력할 때 상태 업데이트
  const onChangeUnitCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 입력값을 즉시 대문자 6글자 영문으로 정규화
    const next = e.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 6);
    setUnitCode(next);
  };

  // 응답 타입 정의
  type VerifyResponse = {
    success: boolean;
    valid?: boolean;
    alreadyAttempted?: boolean;
    error?: string;
    examData?: unknown;
  };

  type QuestionsResponse = {
    success: boolean;
    questions?: { id: number; question: string }[];
    error?: string;
  };

  // TanStack Query - POST 뮤테이션 (상대 경로 fetch 사용)
  const verifyMutation = useMutation<VerifyResponse, unknown, string>({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/unit-exam/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as VerifyResponse;
      return data;
    },
  });

  const questionsMutation = useMutation<QuestionsResponse, unknown, string>({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/unit-exam/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as QuestionsResponse;
      return data;
    },
  });

  // 단원평가 시작 클릭 시 실행
  // 1) 코드 유효성 검사
  // 2) /api/unit-exam/verify 검증 (존재/응시여부 확인)
  // 3) /api/unit-exam/questions 문제 조회 후 alert로 표시(모달은 추후 렌더링 예정)
  // 단원평가 시작 버튼 클릭 핸들러
  // - 입력값 유효성 검사, 코드 검증 API, 문제 조회 API 순으로 호출
  const onClickUnitExam = async () => {
    try {
      const raw = unitCode?.trim();
      const code = raw?.toUpperCase();

      // 입력값 검증: 공백 또는 6글자 대문자 아님
      if (!code || !/^[A-Z]{6}$/.test(code)) {
        alert('코드를 입력해주세요. 코드는 영어 대문자 6글자입니다.');
        return;
      }

      // 1,2: 검증 API 호출
      const verifyRes = await verifyMutation.mutateAsync(code);

      // 실패 처리 분기
      if (!(verifyRes?.success && verifyRes?.valid)) {
        if (verifyRes?.alreadyAttempted) {
          alert('이미 응시한 시험은 다시 응시할 수 없습니다.');
          return;
        }
        alert('존재하지 않는 코드');
        return;
      }

      // 3: 문제 조회
      const questionsRes = await questionsMutation.mutateAsync(code);

      if (
        !questionsRes?.success ||
        !questionsRes?.questions ||
        questionsRes.questions.length === 0
      ) {
        alert('문제를 불러오지 못했습니다.');
        return;
      }

      // 임시: 모달 대신 alert로 문제 내용 표시 (문항 간 구분선 추가)
      const message = questionsRes.questions
        .map((q, idx) => `${idx + 1}. ${q.question}`)
        .join('\n\n');
      alert(message);
    } catch (error) {
      console.error('단원평가 시작 처리 중 오류:', error);
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="border-black-100 flex w-screen flex-col">
      <span className="flex w-full p-8 text-2xl font-bold">단원 평가</span>
      <div className="flex h-full w-full flex-1 justify-center pt-10">
        <div className="flex h-100 w-200 flex-col items-center justify-center rounded-2xl border-2 border-[var(--color-sidebar-button)] max-[431px]:w-[80%] max-[431px]:origin-top">
          <div>
            <button
              className="h-15 w-50 rounded-2xl border-1 border-[var(--color-sidebar-icon)] shadow-md transition hover:translate-y-[-3px] hover:shadow-xl"
              onClick={onClickUnitExam}
            >
              단원평가 시작
            </button>
          </div>
          <div>
            <input
              type="text"
              value={unitCode}
              onChange={onChangeUnitCode}
              placeholder="단원 평가 코드를 입력해주세요."
              maxLength={6}
              className="mt-15 h-15 w-100 rounded-2xl border-1 border-[var(--color-sidebar-icon)] text-center max-[431px]:w-70"
            ></input>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitPage;
