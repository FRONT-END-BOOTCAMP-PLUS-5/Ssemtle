'use client';
import { useMemo, useState, useEffect } from 'react';
import CategoryCard from './components/categoryCard';
import ProgressBar from './components/ProgressBar';
import SearchInput from './components/SearchInput';

const CATEGORY_GROUPS = [
  {
    title: '수와 연산',
    items: ['소인수 분해', '정수와 유리수', '무리수의 사칙계산'],
  },
  { title: '문자와 식', items: ['일차방정식', '지수법칙'] },
];

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

  const filteredNames = useMemo(() => {
    const q = submittedQuery.trim();
    if (!q) return [] as string[];
    return CATEGORY_GROUPS.flatMap((g) => g.items).filter((name) =>
      name.includes(q)
    );
  }, [submittedQuery]);

  const handleSubmit = () => setSubmittedQuery(searchInput);

  return (
    <div className="flex w-full flex-col p-8">
      {/* 문제풀기 section */}
      <div className="mb-5 flex flex-col">
        <div className="mb-1 text-3xl">문제풀기</div>
      </div>
      {/* 학습 진도 그래프 section */}
      <div className="mb-5 flex flex-col">
        <div className="flex justify-between max-[680px]:flex-col">
          {attendance ? (
            <>
              <div className="text-xl">
                출석까지 {attendance.remainingCount}문제 남았어요!
              </div>
              <div className="text-xl">
                {attendance.solvedCount}/{attendance.targetCount} 문제
              </div>
            </>
          ) : attendanceError ? (
            <div className="text-sm text-red-500">{attendanceError}</div>
          ) : (
            <div className="text-sm text-gray-500">
              출석 정보를 불러오는 중...
            </div>
          )}
        </div>
        <div className="mt-2">
          <ProgressBar progress={attendance ? attendance.progressPercent : 0} />
        </div>
      </div>
      {/* 학습 카테고리 section */}
      <div className="mt-10 flex h-full w-full flex-col gap-10">
        <div className="flex justify-between text-2xl max-[680px]:flex-col">
          <div>학습 카테고리</div>
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSubmit}
          />
        </div>
        {/* 세부 카테고리 */}
        {submittedQuery ? (
          <div className="mt-2">
            <div className="text-lg">검색 결과</div>
            <div className="flex flex-wrap justify-between gap-15 p-10">
              {filteredNames.length > 0 ? (
                filteredNames.map((name) => (
                  <CategoryCard key={`search-${name}`} name={name} />
                ))
              ) : (
                <div className="text-sm text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <div className="text-lg">수와 연산</div>
              <div className="flex flex-wrap justify-between gap-15 p-10">
                <CategoryCard name="소인수 분해" />
                <CategoryCard name="정수와 유리수" />
                <CategoryCard name="무리수의 사칙계산" />
              </div>
            </div>
            <div>
              <div className="text-lg">문자와 식</div>
              <div className="flex flex-wrap justify-between gap-15 p-10">
                <CategoryCard name="일차방정식" />
                <CategoryCard name="지수법칙" />
                <CategoryCard name="지수법칙" />
                <CategoryCard name="지수법칙" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeCategoryPage;
