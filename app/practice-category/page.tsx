'use client';
import { useMemo, useState, useEffect } from 'react';
import CategoryCard from './components/categoryCard';
import ProgressBar from './components/ProgressBar';
import SearchInput from './components/SearchInput';

type CategoryItem = { name: string; unitId: number };
type CategoryGroup = { title: string; items: CategoryItem[] };

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: '수와 연산',
    items: [
      { name: '소인수분해', unitId: 1 },
      { name: '정수와유리수의 사칙계산', unitId: 2 },
    ],
  },
  {
    title: '문자와 식',
    items: [
      { name: '일차식의 덧셈과 뺄셈', unitId: 3 },
      { name: '일차식의 곱셈과 나눗셈', unitId: 4 },
      { name: '일차방정식', unitId: 5 },
      { name: '지수법칙', unitId: 6 },
      { name: '다항식의 덧셈과 곱셈', unitId: 7 },
      { name: '인수분해', unitId: 8 },
      { name: '이차방정식', unitId: 9 },
    ],
  },
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

  const filteredItems = useMemo(() => {
    const q = submittedQuery.trim();
    if (!q) return [] as CategoryItem[];
    return CATEGORY_GROUPS.flatMap((g) => g.items).filter((item) =>
      item.name.includes(q)
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
        <div className="flex gap-5 text-2xl max-[680px]:flex-col">
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
            <div className="flex flex-wrap gap-15 p-10">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <CategoryCard
                    key={`search-${item.unitId}`}
                    name={item.name}
                    unitId={item.unitId}
                  />
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
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col">
                <div className="text-lg">{group.title}</div>
                <div className="flex flex-wrap gap-15 p-10">
                  {group.items.map((item) => (
                    <CategoryCard
                      key={item.unitId}
                      name={item.name}
                      unitId={item.unitId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeCategoryPage;
