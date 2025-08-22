'use client';

import { useMemo, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useInfiniteGets } from '@/hooks/useInfiniteGets';
import { useGets } from '@/hooks/useGets';
import { SolveListItemDto } from '@/backend/solves/dtos/SolveDto';

interface Unit {
  id: number;
  name: string;
}

interface UnitsResponse {
  units: Unit[];
}

interface WorkbookDataProviderProps {
  children: (data: {
    solvesData: SolveListItemDto[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isError: boolean;
    filteredAndGroupedSolves: {
      category: string;
      unitId: number;
      solves: SolveListItemDto[];
    }[];
    unitsData: UnitsResponse | undefined;
  }) => ReactNode;
  selectedUnits: (number | string)[];
  dateSort: 'newest' | 'oldest';
  endpoint: string;
}

export default function WorkbookDataProvider({
  children,
  selectedUnits,
  dateSort,
  endpoint,
}: WorkbookDataProviderProps) {
  const { data: session } = useSession();

  const {
    data: solvesData,
    isLoading: solvesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError: solvesError,
  } = useInfiniteGets<SolveListItemDto>(
    [
      'solves',
      'list',
      {
        userId: session?.user?.id,
        units: selectedUnits.join(','),
        sort: dateSort,
      },
    ],
    endpoint,
    !!session?.user?.id,
    {
      userId: session?.user?.id || '',
      limit: '20',
      sortDirection: dateSort,
    },
    undefined,
    {
      // Prevent stale data from showing during transitions
      placeholderData: undefined,
      // Keep cache time short for different sort variants
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: unitsData } = useGets<UnitsResponse>(['units'], '/unit', true);

  // Deduplicate items to prevent duplicate key errors
  const deduplicatedSolves = useMemo(() => {
    if (!solvesData || solvesData.length === 0) return [];

    const seen = new Set<number>();
    const dedup: SolveListItemDto[] = [];

    for (const item of solvesData) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        dedup.push(item);
      }
    }

    return dedup;
  }, [solvesData]);

  const filteredAndGroupedSolves = useMemo(() => {
    if (deduplicatedSolves.length === 0) return [];

    // Apply filtering first (this is the only client-side operation we should do)
    let filtered = deduplicatedSolves;
    if (selectedUnits.length > 0) {
      filtered = deduplicatedSolves.filter((solve: SolveListItemDto) =>
        selectedUnits.includes(solve.unitId)
      );
    }

    // Group by unit + category + date
    const grouped = filtered.reduce(
      (
        acc: Map<
          string,
          { category: string; unitId: number; solves: SolveListItemDto[] }
        >,
        solve
      ) => {
        const date = new Date(solve.createdAt).toDateString();
        const key = `${solve.unitId}-${solve.category}-${date}`;

        if (!acc.has(key)) {
          acc.set(key, {
            category: solve.category,
            unitId: solve.unitId,
            solves: [],
          });
        }
        acc.get(key)!.solves.push(solve);
        return acc;
      },
      new Map()
    );

    // Convert to array and sort groups by date
    const groupedArray = Array.from(grouped.values());
    return groupedArray;
  }, [deduplicatedSolves, selectedUnits]);

  return (
    <>
      {children({
        solvesData: deduplicatedSolves,
        isLoading: solvesLoading,
        isFetchingNextPage,
        hasNextPage: hasNextPage ?? false,
        fetchNextPage,
        isError: solvesError,
        filteredAndGroupedSolves,
        unitsData,
      })}
    </>
  );
}
