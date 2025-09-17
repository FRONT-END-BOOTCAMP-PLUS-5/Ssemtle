'use client';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CategoryCard from './components/categoryCard';
import ProgressBar from './components/ProgressBar';
import SearchInput from './components/SearchInput';
import { useGets } from '@/hooks/useGets';
import { UNIT_META } from './components/unitMeta';

type UnitsResponse = { units: { id: number; name: string }[] };

const PracticeCategoryPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  // 네비게이션 진행 여부 (로딩 딤/비활성화 제어)
  const [isNavigating, setIsNavigating] = useState(false);
  const [attendance, setAttendance] = useState<{
    remainingCount: number;
    solvedCount: number;
    targetCount: number;
    progressPercent: number;
  } | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // 오늘 출석 데이터 로드
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/attendances/today', {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error('출석 정보를 불러오지 못했습니다.');
        }
        const data = await res.json();
        if (isMounted) {
          setAttendance({
            remainingCount: data.remainingCount,
            solvedCount: data.solvedCount,
            targetCount: data.targetCount,
            progressPercent: data.progressPercent,
          });
        }
      } catch (e) {
        console.error(e);
        if (isMounted)
          setAttendanceError('출석 정보를 불러오는 중 오류가 발생했습니다.');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // 페이지 떠날 때(언마운트) 남아있는 로딩 토스트 정리
  useEffect(() => {
    return () => {
      try {
        toast.dismiss();
      } catch {}
    };
  }, []);

  // 유닛 목록 로드 (DB)
  const {
    data: unitsData,
    isLoading: unitsLoading,
    isError: unitsError,
  } = useGets<UnitsResponse>(['units'], '/unit', true);

  // 검색 결과 필터링
  const filteredItems = useMemo(() => {
    const query = submittedQuery.trim();
    const items = unitsData?.units ?? [];
    if (!query) return items;
    return items.filter((item) => item.name.includes(query));
  }, [submittedQuery, unitsData]);

  const handleSubmit = () => setSubmittedQuery(searchInput);

  return (
    <div className="relative flex w-full flex-col p-12 min-[1181px]:pl-30">
      {/* 상단 히어로: 문제풀기 카드 + 진행률 */}
      <section className="mb-8 rounded-3xl border border-gray-100 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-rose-50 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-6 max-[680px]:flex-col max-[680px]:items-start">
          <div>
            <div className="mt-2 text-2xl text-gray-700">
              {/* 출석 완료 시 완료 문구로 변경 */}
              {attendance ? (
                attendance.remainingCount <= 0 ? (
                  <>출석이 완료되었습니다!</>
                ) : (
                  <>출석까지 {attendance.remainingCount}문제 남았어요!</>
                )
              ) : attendanceError ? (
                <span className="text-red-500">{attendanceError}</span>
              ) : (
                <span className="text-gray-500">
                  출석 정보를 불러오는 중...
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar progress={attendance ? attendance.progressPercent : 0} />
        </div>
      </section>

      {/* 학습 카테고리 헤더 */}
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-5 max-[680px]:flex-col max-[680px]:items-start">
          <h2 className="text-2xl font-semibold">학습 단원</h2>
          <div className="relative min-[681px]:top-5">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          학습단원을 선택해서 문제를 풀어보세요!
        </p>
      </section>

      {/* 카테고리 그리드 */}
      <section className="mt-6">
        {unitsLoading ? (
          <div className="text-sm text-gray-500">목록을 불러오는 중...</div>
        ) : unitsError ? (
          <div className="text-sm text-red-500">
            목록을 불러오지 못했습니다.
          </div>
        ) : (
          <>
            {submittedQuery ? (
              <div className="mb-3 text-lg">검색 결과</div>
            ) : null}
            <div className="grid grid-cols-3 gap-6 max-[1200px]:grid-cols-2 max-[640px]:grid-cols-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <CategoryCard
                    key={item.id}
                    title={item.name}
                    unitId={item.id}
                    unitName={item.name}
                    accentClass={
                      UNIT_META[item.name]?.accentClass ?? 'bg-white'
                    }
                    description={UNIT_META[item.name]?.description}
                    onNavigateStart={() => setIsNavigating(true)}
                    onNavigateError={() => setIsNavigating(false)}
                    isDisabled={isNavigating}
                  />
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* 네비게이션 중 화면 오버레이 */}
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

export default PracticeCategoryPage;
