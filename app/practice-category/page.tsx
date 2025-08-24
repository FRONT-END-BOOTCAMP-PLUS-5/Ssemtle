'use client';
import { useMemo, useState, useEffect } from 'react';
import CategoryCard from './components/categoryCard';
import ProgressBar from './components/ProgressBar';
import SearchInput from './components/SearchInput';
import { useGets } from '@/hooks/useGets';

type UnitsResponse = { units: { id: number; name: string }[] };

// 유닛별 카드 보조 정보(배경색, 설명)
const UNIT_META: Record<string, { accentClass: string; description: string }> =
  {
    // 상단 라인
    이차방정식: {
      accentClass: 'bg-gradient-to-br from-rose-50 to-pink-50',
      description: '이차방정식을 풀어 해를 구해요.',
    },
    인수분해: {
      accentClass: 'bg-gradient-to-br from-sky-50 to-indigo-50',
      description: '식을 인수로 분해하는 방법을 배워요.',
    },
    '다항식의 덧셈과 곱셈': {
      accentClass: 'bg-gradient-to-br from-emerald-50 to-green-50',
      description: '다항식의 연산을 마스터해요.',
    },

    // 중단 라인
    지수법칙: {
      accentClass: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      description: '거듭제곱의 규칙을 이해해요.',
    },
    일차방정식: {
      accentClass: 'bg-gradient-to-br from-violet-50 to-fuchsia-50',
      description: '방정식을 풀어 미지수를 찾아요.',
    },
    '일차식의 곱셈과 나눗셈': {
      accentClass: 'bg-gradient-to-br from-orange-50 to-amber-50',
      description: '문자식의 곱셈과 나눗셈을 배워요.',
    },

    // 하단 라인
    '일차식의 덧셈과 뺄셈': {
      accentClass: 'bg-gradient-to-br from-teal-50 to-cyan-50',
      description: '문자를 사용한 식의 계산을 연습해요.',
    },
    '정수와 유리수의 사칙계산': {
      accentClass: 'bg-gradient-to-br from-sky-50 to-blue-50',
      description: '음수와 분수의 계산을 마스터해요.',
    },
    '정수와유리수의 사칙계산': {
      accentClass: 'bg-gradient-to-br from-sky-50 to-blue-50',
      description: '음수와 분수의 계산을 마스터해요.',
    },
    소인수분해: {
      accentClass: 'bg-gradient-to-br from-pink-50 to-rose-50',
      description: '수를 소인수로 분해하는 방법을 배워요.',
    },

    // 기존 항목도 유지 (일부 화면에서 사용될 수 있음)
    '수와 연산': {
      accentClass: 'bg-gradient-to-br from-rose-50 to-amber-50',
      description: '기본적인 수의 개념과 사칙연산을 배워요.',
    },
  };

const PracticeCategoryPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
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
    <div className="flex w-full flex-col p-8">
      {/* 상단 히어로: 문제풀기 카드 + 진행률 */}
      <section className="mb-8 rounded-3xl border border-gray-100 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-rose-50 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-6 max-[680px]:flex-col max-[680px]:items-start">
          <div>
            <div className="text-3xl font-semibold">문제풀기</div>
            <div className="mt-2 text-gray-700">
              {attendance ? (
                <>출석까지 {attendance.remainingCount}문제 남았어요!</>
              ) : attendanceError ? (
                <span className="text-red-500">{attendanceError}</span>
              ) : (
                <span className="text-gray-500">
                  출석 정보를 불러오는 중...
                </span>
              )}
            </div>
          </div>
          <div className="text-2xl font-semibold text-indigo-700">
            {attendance ? (
              <>
                {attendance.solvedCount}/{attendance.targetCount} 문제
              </>
            ) : (
              <span className="text-gray-500">0/0 문제</span>
            )}
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar progress={attendance ? attendance.progressPercent : 0} />
        </div>
      </section>

      {/* 학습 카테고리 헤더 */}
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-5 max-[680px]:flex-col max-[680px]:items-start">
          <h2 className="text-2xl font-semibold">학습 카테고리</h2>
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSubmit}
          />
        </div>
        <p className="text-sm text-gray-500">
          카테고리를 선택해서 문제를 풀어보세요!
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
    </div>
  );
};

export default PracticeCategoryPage;
