import { useState } from 'react';
import { useGets } from './useGets';

interface PaginatedResponse<T> {
  data: {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface UsePaginatedQueryProps {
  queryKey: string;
  apiPath: string;
  itemsPerPage?: number;
  additionalParams?: Record<string, string>;
}

export function usePaginatedQuery<T>({
  queryKey,
  apiPath,
  itemsPerPage = 10,
  additionalParams = {},
}: UsePaginatedQueryProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useGets<
    PaginatedResponse<T>
  >(
    [queryKey, currentPage],
    apiPath,
    true,
    {
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
      ...additionalParams,
    },
    undefined,
    {
      placeholderData: (previousData) => previousData,
      staleTime: 5 * 60 * 1000,
    }
  );

  const items = data?.data?.items || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const totalItems = data?.data?.pagination?.total || 0;

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  return {
    items,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    isError,
    error,
    refetch,
    goToPage,
  };
}
