'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FilterDropdown from '@/app/_components/filters/FilterDropdown';
import WorkbookAuthGuard from '@/app/workbook/_components/WorkbookAuthGuard';
import WorkbookHeader from '@/app/workbook/_components/WorkbookHeader';
import WorkbookDataProvider from '@/app/workbook/_components/WorkbookDataProvider';
import WorkbookContent from '@/app/workbook/_components/WorkbookContent';

export default function ProblemSolvingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathName = usePathname();

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
    const newUrl = queryString ? `?${queryString}` : pathName;

    router.replace(newUrl, { scroll: false });
  }, [selectedUnits, dateSort, router, pathName]);

  const handleUnitSelectionChange = (selectedIds: (number | string)[]) => {
    setSelectedUnits(selectedIds);
  };

  const handleDateSortChange = (selectedIds: (number | string)[]) => {
    if (selectedIds.length > 0) {
      setDateSort(selectedIds[0] as 'newest' | 'oldest');
    }
  };

  const createUnitOptions = (
    unitsData: { units?: { id: number; name: string }[] } | undefined
  ) => {
    if (!unitsData?.units) return [];
    return unitsData.units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      checked: selectedUnits.includes(unit.id),
    }));
  };

  const dateOptions = [
    { id: 'newest', name: '최신순', checked: dateSort === 'newest' },
    { id: 'oldest', name: '오래된순', checked: dateSort === 'oldest' },
  ];

  return (
    <WorkbookAuthGuard>
      <div className="mx-auto">
        <div className="px-4 py-6 desktop:px-48">
          <WorkbookHeader
            title="문제집"
            description="기존에 푼 연습문제를 확인해 보세요!"
          />

          <WorkbookDataProvider
            selectedUnits={selectedUnits}
            dateSort={dateSort}
            endpoint="/solves/list"
          >
            {({
              isLoading,
              isError,
              filteredAndGroupedSolves,
              hasNextPage,
              isFetchingNextPage,
              fetchNextPage,
              unitsData,
            }) => (
              <WorkbookContent
                isLoading={isLoading}
                isError={isError}
                filteredAndGroupedSolves={filteredAndGroupedSolves}
                dateSort={dateSort}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
              >
                <div className="mb-6 flex justify-center gap-6 tablet:justify-end-safe">
                  <FilterDropdown
                    title="종류별 정렬"
                    options={createUnitOptions(unitsData)}
                    onSelectionChange={handleUnitSelectionChange}
                  />
                  <FilterDropdown
                    title="날짜순 정렬"
                    options={dateOptions}
                    onSelectionChange={handleDateSortChange}
                    mode="radio"
                  />
                </div>
              </WorkbookContent>
            )}
          </WorkbookDataProvider>
        </div>
      </div>
    </WorkbookAuthGuard>
  );
}
