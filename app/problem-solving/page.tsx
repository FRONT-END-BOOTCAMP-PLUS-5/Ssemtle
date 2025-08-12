'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoChevronBack } from 'react-icons/io5';
import FilterDropdown from '@/app/_components/FilterDropdown';
import TestCard from '@/app/_components/cards/TestCard';
import { useGets } from '@/hooks/useGets';
import { useInfiniteGets } from '@/hooks/useInfiniteGets';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { SolveListItemDto } from '@/backend/solves/dtos/SolveDto';

interface Unit {
  id: number;
  name: string;
}

interface UnitsResponse {
  units: Unit[];
}

export default function ProblemSolvingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const [selectedUnits, setSelectedUnits] = useState<(number | string)[]>(
    () => {
      const unitsParam = searchParams.get('units');
      return unitsParam
        ? unitsParam.split(',').map((id) => parseInt(id) || id)
        : [];
    }
  );

  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>(() => {
    const sortParam = searchParams.get('sort');
    return sortParam === 'oldest' || sortParam === 'newest'
      ? sortParam
      : 'newest';
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedUnits.length > 0) {
      params.set('units', selectedUnits.join(','));
    }

    if (dateSort !== 'newest') {
      params.set('sort', dateSort);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/problem-solving';

    router.replace(newUrl, { scroll: false });
  }, [selectedUnits, dateSort, router]);

  const {
    data: solvesData,
    isLoading: solvesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError: solvesError,
  } = useInfiniteGets<SolveListItemDto>(
    ['solves', 'list', session?.user?.id, selectedUnits.join(','), dateSort],
    '/solves/list',
    !!session?.user?.id,
    {
      userId: session?.user?.id || '',
      limit: '20',
    }
  );

  const { data: unitsData } = useGets<UnitsResponse>(['units'], '/unit', true);

  const unitOptions = useMemo(() => {
    if (!unitsData?.units) return [];
    return unitsData.units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      checked: selectedUnits.includes(unit.id),
    }));
  }, [unitsData?.units, selectedUnits]);

  const dateOptions = [
    { id: 'newest', name: '최신순', checked: dateSort === 'newest' },
    { id: 'oldest', name: '오래된순', checked: dateSort === 'oldest' },
  ];

  const filteredAndGroupedSolves = useMemo(() => {
    if (!solvesData || solvesData.length === 0) return [];

    let filtered: SolveListItemDto[] = solvesData;

    if (selectedUnits.length > 0) {
      filtered = filtered.filter((solve: SolveListItemDto) =>
        selectedUnits.includes(solve.unitId)
      );
    }

    filtered.sort((a: SolveListItemDto, b: SolveListItemDto) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const grouped = filtered.reduce(
      (
        acc: Record<
          string,
          { category: string; unitId: number; solves: SolveListItemDto[] }
        >,
        solve: SolveListItemDto
      ) => {
        const key = `${solve.unitId}-${solve.category}`;
        if (!acc[key]) {
          acc[key] = {
            category: solve.category,
            unitId: solve.unitId,
            solves: [],
          };
        }
        acc[key].solves.push(solve);
        return acc;
      },
      {}
    );

    return Object.values(grouped);
  }, [solvesData, selectedUnits, dateSort]);

  const handleUnitSelectionChange = (selectedIds: (number | string)[]) => {
    setSelectedUnits(selectedIds);
  };

  const handleDateSortChange = (selectedIds: (number | string)[]) => {
    if (selectedIds.length > 0) {
      setDateSort(selectedIds[0] as 'newest' | 'oldest');
    }
  };

  // Intersection observer for infinite scrolling
  const { targetRef, isIntersecting } = useIntersectionObserver({
    enabled: hasNextPage && !isFetchingNextPage,
  });

  // Trigger next page load when scroll trigger is visible
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex h-96 items-center justify-center">
          <div className="text-gray-600">로그인이 필요합니다</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto max-w-screen-sm px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-200"
          >
            <IoChevronBack className="h-6 w-6 text-gray-700" />
          </button>

          <h1 className="text-lg font-bold text-gray-800">문제풀기</h1>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <div className="h-6 w-6 rounded-full bg-purple-300"></div>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <FilterDropdown
            title="종류별 정렬"
            options={unitOptions}
            onSelectionChange={handleUnitSelectionChange}
          />
          <FilterDropdown
            title="날짜순 정렬"
            options={dateOptions}
            onSelectionChange={handleDateSortChange}
            mode="radio"
          />
        </div>

        <div className="space-y-6">
          {solvesLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          )}

          {solvesError && (
            <div className="flex justify-center py-12">
              <div className="text-sm text-red-600">
                데이터를 불러오는데 실패했습니다
              </div>
            </div>
          )}

          {!solvesLoading &&
            !solvesError &&
            filteredAndGroupedSolves.length === 0 && (
              <div className="flex justify-center py-12">
                <div className="text-sm text-gray-600">
                  문제 풀이 기록이 없습니다
                </div>
              </div>
            )}

          {filteredAndGroupedSolves.map((group, index) => (
            <div
              key={`${group.unitId}-${group.category}-${index}`}
              className="flex justify-center"
            >
              <TestCard solves={group.solves} category={group.category} />
            </div>
          ))}

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Intersection observer target for infinite scrolling */}
          {hasNextPage && !isFetchingNextPage && (
            <div ref={targetRef} className="h-4 w-full" />
          )}

          {/* End of results indicator */}
          {!hasNextPage && filteredAndGroupedSolves.length > 0 && (
            <div className="flex justify-center py-6">
              <div className="text-sm text-gray-500">
                모든 문제 풀이 기록을 불러왔습니다
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
