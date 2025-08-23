'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { HiOutlineArrowRight } from 'react-icons/hi2';

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
    <div className="flex w-full flex-col">
      {/* 상단 헤더: 타이틀, 부제목 */}
      <div className="w-full px-6 pt-8 sm:px-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">단원 평가</h1>
        </div>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          단원별 실력을 평가하고 학습 성과를 확인해보세요!
        </p>
      </div>

      {/* 본문: 좌우 카드 레이아웃 */}
      <div className="mt-10 flex w-full justify-center p-6 sm:p-10">
        <div className="grid w-[min(1100px,96%)] grid-cols-1 gap-6 md:grid-cols-2">
          {/* 카드 1: 새로운 단원평가 */}
          <section className="rounded-2xl bg-blue-50 p-6 sm:p-8">
            {/* 카드 헤더 */}
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-blue-700">
                  새로운 단원평가
                </h2>
                <p className="mt-1 text-lg text-blue-700/80">
                  단원 평가 코드를 입력하여 시작하세요
                </p>
              </div>
            </div>

            {/* 입력 영역 */}
            <div className="mt-6">
              <label htmlFor="unitCode" className="sr-only">
                단원 평가 코드
              </label>
              <input
                id="unitCode"
                type="text"
                value={unitCode}
                onChange={onChangeUnitCode}
                placeholder="단원 평가 코드를 입력해주세요"
                maxLength={9}
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-center text-base ring-blue-300 transition outline-none focus:ring-2"
              />
            </div>

            {/* 버튼 */}
            <div className="mt-4">
              <button
                onClick={onClickUnitExam}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white shadow-sm transition hover:bg-blue-700"
              >
                <span>단원평가 시작</span>
                <HiOutlineArrowRight className="h-5 w-5" />
              </button>
            </div>
          </section>

          {/* 카드 2: 평가 기록 */}
          <section className="rounded-2xl bg-emerald-50 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-emerald-700">
                  평가 기록
                </h2>
                <p className="mt-1 text-lg text-emerald-700/80">
                  이전에 응시한 단원평가 결과를 확인하세요
                </p>
              </div>
            </div>

            <div className="mt-22">
              <button
                onClick={onClickViewAttemptedList}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-sm transition hover:bg-emerald-700"
              >
                <span>응시한 단원평가 목록</span>
                <HiOutlineArrowRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UnitPage;
