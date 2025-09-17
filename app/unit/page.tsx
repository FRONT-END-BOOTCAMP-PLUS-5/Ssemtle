'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import { useMutation } from '@tanstack/react-query';

// 단원평가 시작 페이지 컴포넌트
// - 코드 입력값 유효성 검사 후, TanStack Query(POST 훅)로 검증/문제 조회 진행
const UnitPage = () => {
  const [unitCode, setUnitCode] = useState('');
  // 페이지 이동 중인지 여부(딤/비활성화/중복 클릭 방지)
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // 단원평가 코드 검증 뮤테이션 (시도기록 생성 없이 검증만 수행)
  type VerifyResponse = {
    success: boolean;
    valid?: boolean;
    error?: string;
    alreadyAttempted?: boolean;
    examData?: { id: number; teacherId: string; createdAt: string };
  };

  const verifyMutation = useMutation<VerifyResponse, Error, string>({
    mutationFn: async (code: string): Promise<VerifyResponse> => {
      const res = await fetch('/api/unit-exam/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err?.error || '코드 검증 중 오류가 발생했습니다.');
      }
      return (await res.json()) as VerifyResponse;
    },
  });

  // 페이지 떠날 때(언마운트) 로딩 토스트 정리 → 이동 완료 시 토스트 제거 효과
  useEffect(() => {
    return () => {
      try {
        toast.dismiss();
      } catch {}
    };
  }, []);

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
      if (isNavigating) return; // 중복 클릭 방지
      const raw = unitCode?.trim();
      const code = raw?.toUpperCase();
      // 입력값 검증: ABCDEF-01~60 형식(총 9글자)
      const codePattern = /^[A-Z]{6}-(0[1-9]|[1-5][0-9]|60)$/;
      if (!code || !codePattern.test(code)) {
        toast.warn('코드를 입력해주세요. 예) ABCDEF-05 (01~60)');
        return;
      }

      // 1) 서버 검증 먼저 수행 (React Query)
      setIsNavigating(true); // 검증 동안에도 중복 입력 방지/딤 처리
      const data = await verifyMutation.mutateAsync(code);
      if (!data?.success) {
        toast.error(data?.error || '코드 검증에 실패했습니다.');
        setIsNavigating(false);
        return;
      }
      if (data?.alreadyAttempted) {
        toast.warn('이미 응시한 내역입니다.');
        setIsNavigating(false);
        return;
      }
      if (!data?.valid) {
        toast.warn('유효하지 않은 코드입니다.');
        setIsNavigating(false);
        return;
      }

      // 2) 검증에 성공하면 로딩 토스트를 띄우고 이동
      toast.loading('페이지 이동 중입니다... 잠시만 기다려주세요.', {
        autoClose: 2500,
        closeOnClick: false,
        hideProgressBar: true,
      });
      router.push(`/unit-exam?examCode=${encodeURIComponent(code)}`);
    } catch (error) {
      console.error('단원평가 시작 처리 중 오류:', error);
      if ((error as Error)?.message === 'UNAUTHORIZED') {
        toast.warn('로그인이 필요합니다.');
        router.push('/signin');
      } else {
        toast.error(
          (error as Error)?.message ||
            '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        );
      }
      setIsNavigating(false);
    }
  };

  // 단원평가 결과 조회 버튼 클릭 핸들러
  // - 입력한 코드 유효성 검사 후 결과 페이지로 이동
  // 응시한 단원평가 목록 페이지 이동 핸들러
  // - 세션의 내부 id 확인 후, 세션에 포함된 외부 식별자(userId)를 studentId로 전달
  const onClickViewAttemptedList = () => {
    try {
      if (isNavigating) return; // 중복 클릭 방지
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
      setIsNavigating(true);
      toast.loading('페이지 이동 중입니다... 잠시만 기다려주세요.', {
        autoClose: 2500,
        closeOnClick: false,
        hideProgressBar: true,
      });
      router.push(
        `/workbook/unit-exam?studentId=${encodeURIComponent(externalUserId)}`
      );
    } catch (error) {
      toast.error(`오류가 발생했습니다. 잠시 후 다시 시도해주세요.${error}`);
      setIsNavigating(false);
    }
  };

  return (
    <div className="flex w-full flex-col min-[1181px]:pl-15">
      {/* 상단 헤더: 타이틀, 부제목 */}
      <div className="mt-10 flex w-full justify-center p-6 sm:p-10">
        <div className="flex flex-col items-center gap-3">
          <p className="mt-2 text-2xl font-bold sm:text-3xl">
            단원별 실력을 평가하고 학습 성과를 확인해보세요!
          </p>
        </div>
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
                  단원평가 응시하기
                </h2>
                <p className="mt-1 text-lg text-blue-700/80">
                  단원평가 코드를 입력하여 시작하세요
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
                disabled={isNavigating}
                className={`w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-center text-base ring-blue-300 transition outline-none focus:ring-2 ${isNavigating ? 'opacity-60' : ''}`}
              />
            </div>

            {/* 버튼 */}
            <div className="mt-4">
              <button
                onClick={onClickUnitExam}
                disabled={isNavigating}
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white shadow-sm transition ${
                  isNavigating
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:bg-blue-700'
                }`}
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
                <p className="mt-3 text-lg text-emerald-700/80">
                  응시했던 단원평가 결과를 확인하세요
                </p>
              </div>
            </div>

            <div className="mt-22">
              <button
                onClick={onClickViewAttemptedList}
                disabled={isNavigating}
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-sm transition ${
                  isNavigating
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:bg-emerald-700'
                }`}
              >
                <span>응시한 단원평가 목록</span>
                <HiOutlineArrowRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        </div>
      </div>
      {/* 페이지 이동 중 딤 오버레이 */}
      {isNavigating ? (
        <div
          className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[1px]"
          aria-hidden="true"
          aria-busy="true"
        />
      ) : null}
    </div>
  );
};

export default UnitPage;
