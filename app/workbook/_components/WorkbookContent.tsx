'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // ✅ 추가
import TestCard from '@/app/_components/cards/TestCard';
import WorkbookInfiniteScroll from './WorkbookInfiniteScroll';
import { SolveListItemDto } from '@/backend/solves/dtos/SolveDto';

interface WorkbookContentProps {
  isLoading: boolean;
  isError: boolean;
  filteredAndGroupedSolves: {
    category: string;
    unitId: number;
    solves: SolveListItemDto[];
  }[];
  dateSort: 'newest' | 'oldest';
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  children?: ReactNode; // For filter components
}

/** KST YYYY-MM-DD */
function toKstYmd(dLike: string | number | Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(dLike));
}

export default function WorkbookContent({
  isLoading,
  isError,
  filteredAndGroupedSolves,
  dateSort,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  children,
}: WorkbookContentProps) {
  const router = useRouter();

  return (
    <>
      {children}

      <div
        key={`${dateSort}-${JSON.stringify(filteredAndGroupedSolves.length)}`}
        className="space-y-6 tablet:grid tablet:grid-cols-2 tablet:gap-6 tablet:space-y-0"
      >
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        )}

        {isError && (
          <div className="flex justify-center py-12">
            <div className="text-sm text-red-600">
              데이터를 불러오는데 실패했습니다
            </div>
          </div>
        )}

        {!isLoading && !isError && filteredAndGroupedSolves.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="text-sm text-gray-600">
              문제 풀이 기록이 없습니다
            </div>
          </div>
        )}

        {/* Only render when we have data and not loading to prevent mixed data */}
        {!isLoading && !isError && filteredAndGroupedSolves.length > 0 && (
          <>
            {filteredAndGroupedSolves.map((group) => {
              // 기존 그룹 키 로직 유지
              const firstSolve = group.solves[0];
              const dateForKey = new Date(firstSolve.createdAt).toDateString();
              const stableKey = `${group.unitId}-${group.category}-${dateForKey}-${dateSort}`;

              // ✅ error-note로 넘길 쿼리들 (카테고리 + 해당 날짜)
              const dateKst = toKstYmd(firstSolve.createdAt);
              const toUrl =
                `/error-note?date=${dateKst}` +
                `&category=${encodeURIComponent(group.category)}` +
                `&unitId=${group.unitId}` + // ✅ 추가
                `&show=all`;

              return (
                <div
                  key={stableKey}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(toUrl)} // ✅ 라우팅
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') router.push(toUrl);
                  }}
                  className="outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  <TestCard solves={group.solves} category={group.category} />
                </div>
              );
            })}

            <WorkbookInfiniteScroll
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              dataLength={filteredAndGroupedSolves.length}
            />
          </>
        )}
      </div>
    </>
  );
}
