'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import FilterDropdown from '@/app/_components/filters/FilterDropdown';
import WorkbookAuthGuard from '@/app/workbook/_components/WorkbookAuthGuard';
import WorkbookHeader from '@/app/workbook/_components/WorkbookHeader';
import UnitExamDataProvider from './UnitExamDataProvider';
import UnitExamContent from './UnitExamContent';

export default function UnitExamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathName = usePathname();

  // Get userId from query parameters (optional)
  const userId = searchParams.get('studentId') || undefined;

  // Initialize state from URL parameters
  const [selectedUnits, setSelectedUnits] = useState<(number | string)[]>(
    () => {
      const unitsParam = searchParams.get('units');
      return unitsParam
        ? unitsParam.split(',').map((id) => parseInt(id) || id)
        : [];
    }
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedUnits.length > 0) {
      params.set('units', selectedUnits.join(','));
    } else {
      params.delete('units');
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : pathName;

    router.replace(newUrl, { scroll: false });
  }, [selectedUnits, router, pathName, searchParams]);

  const handleUnitSelectionChange = (selectedIds: (number | string)[]) => {
    setSelectedUnits(selectedIds);
  };

  return (
    <WorkbookAuthGuard>
      <div className="mx-auto">
        <div className="px-4 py-6 desktop:px-48">
          <WorkbookHeader
            title="단원평가"
            description="기존에 푼 단원평가를 확인해 보세요!"
          />

          <UnitExamDataProvider
            selectedUnits={selectedUnits}
            dateSort={'newest'}
            userId={userId}
          >
            {({
              examResults,
              isLoading,
              isFetchingNextPage,
              hasNextPage,
              fetchNextPage,
              isError,
              unitsData,
            }) => {
              const unitOptions =
                unitsData?.units?.map((unit) => ({
                  id: unit.id,
                  name: unit.name,
                  checked: selectedUnits.includes(unit.id),
                })) || [];

              return (
                <UnitExamContent
                  isLoading={isLoading}
                  isError={isError}
                  examResults={examResults}
                  dateSort={'newest'}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  fetchNextPage={fetchNextPage}
                >
                  <div className="mb-6 flex justify-center gap-6 tablet:justify-end-safe">
                    <FilterDropdown
                      title="종류별 정렬"
                      options={unitOptions}
                      onSelectionChange={handleUnitSelectionChange}
                    />
                  </div>
                </UnitExamContent>
              );
            }}
          </UnitExamDataProvider>
        </div>
      </div>
    </WorkbookAuthGuard>
  );
}
