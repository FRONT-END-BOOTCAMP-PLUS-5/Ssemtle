'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

// 단원평가 시작 페이지 컴포넌트
// - 코드 입력값 유효성 검사 후, TanStack Query(POST 훅)로 검증/문제 조회 진행
const UnitPage = () => {
  const [unitCode, setUnitCode] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  // 입력창 변경 핸들러: 사용자가 단원평가 코드를 입력할 때 상태 업데이트
  const onChangeUnitCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 입력값을 즉시 대문자/숫자/하이픈만 허용하고 길이 9로 제한 (예: ABCDEF-05)
    const next = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .slice(0, 9);
    setUnitCode(next);
  };

  // 단원평가 시작 클릭 시 실행
  // 1) 코드 유효성 검사
  // 2) 유효하면 /unit-exam?examCode=... 로 이동 (검증/문제 로딩은 대상 페이지에서 수행)
  const onClickUnitExam = async () => {
    try {
      const raw = unitCode?.trim();
      const code = raw?.toUpperCase();
      // 입력값 검증: ABCDEF-01~60 형식(총 9글자)
      const codePattern = /^[A-Z]{6}-(0[1-9]|[1-5][0-9]|60)$/;
      if (!code || !codePattern.test(code)) {
        toast.warn('코드를 입력해주세요. 예) ABCDEF-05 (01~60)');
        return;
      }

      // 유효한 코드면 unit-exam 페이지로 이동 (검증/문제 로딩은 대상 페이지에서 처리)
      router.push(`/unit-exam?examCode=${encodeURIComponent(code)}`);
    } catch (error) {
      console.error('단원평가 시작 처리 중 오류:', error);
      toast.error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 단원평가 결과 조회 버튼 클릭 핸들러
  // - 입력한 코드 유효성 검사 후 결과 페이지로 이동
  // 응시한 단원평가 목록 페이지 이동 핸들러
  // - 세션의 내부 id 확인 후, 세션에 포함된 외부 식별자(userId)를 studentId로 전달
  const onClickViewAttemptedList = () => {
    try {
      if (!session?.user?.id) {
        toast.warn('로그인이 필요합니다.');
        router.push('/signin');
        return;
      }
      const externalUserId = session.user.userId;
      if (!externalUserId) {
        toast.error('사용자 정보를 불러오지 못했습니다. 다시 로그인해주세요.');
        return;
      }
      router.push(
        `/workbook/unit-exam?studentId=${encodeURIComponent(externalUserId)}`
      );
    } catch (error) {
      console.error('응시한 단원평가 목록 이동 중 오류:', error);
      toast.error('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="border-black-100 flex w-screen flex-col">
      <span className="flex w-full p-8 text-2xl font-bold">단원 평가</span>
      <div className="flex h-full w-full flex-1 justify-center pt-10">
        <div className="flex w-[min(800px,92%)] flex-col gap-6">
          {/* 섹션 1: 코드 입력 + 단원평가 시작 */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[var(--color-sidebar-button)] p-8">
            <div className="mb-4">
              <input
                type="text"
                value={unitCode}
                onChange={onChangeUnitCode}
                placeholder="단원 평가 코드를 입력해주세요."
                maxLength={9}
                className="h-15 w-100 rounded-2xl border-1 border-[var(--color-sidebar-icon)] text-center max-[431px]:w-70"
              />
            </div>
            <div className="flex gap-4">
              <button
                className="h-15 w-50 rounded-2xl border-1 border-[var(--color-sidebar-icon)] shadow-md transition hover:translate-y-[-3px] hover:shadow-xl"
                onClick={onClickUnitExam}
              >
                단원평가 시작
              </button>
            </div>
          </div>

          {/* 섹션 2: 응시한 단원평가 목록 버튼 */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[var(--color-sidebar-button)] p-8">
            <button
              className="h-15 w-70 rounded-2xl border-1 border-[var(--color-sidebar-icon)] shadow-md transition hover:translate-y-[-3px] hover:shadow-xl"
              onClick={onClickViewAttemptedList}
            >
              응시한 단원평가 목록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitPage;
