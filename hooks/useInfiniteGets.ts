import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRef, useEffect } from 'react';

interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}

interface InfiniteResponse<T> {
  items: T[];
  nextCursor?: string;
}

export const useInfiniteGets = <TData>(
  queryKey: QueryKey,
  path: string,
  enabled = true,
  params?: Record<string, string>,
  headers?: Record<string, string>,
  options?: Omit<
    UseInfiniteQueryOptions<
      InfiniteResponse<TData>,
      AxiosError<ApiErrorResponse>,
      InfiniteResponse<TData>,
      QueryKey,
      string | undefined
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) => {
  const paramsRef = useRef(params);

  // Sync paramsRef with the latest params whenever params changes
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const queryFn = async ({ pageParam }: { pageParam?: string }) => {
    const queryParams = {
      ...paramsRef.current,
      ...(pageParam && { cursor: pageParam }),
    };

    const response = await axios.get<InfiniteResponse<TData>>(
      `${process.env.NEXT_PUBLIC_BASE_URL}${path}`,
      {
        params: queryParams,
        headers,
        withCredentials: true,
      }
    );
    return response.data;
  };

  const query = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    enabled,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: InfiniteResponse<TData>) =>
      lastPage.nextCursor ?? undefined,
    ...options,
  });

  const refetchWithParams = (newParams: Record<string, string>) => {
    paramsRef.current = newParams;
    return query.refetch();
  };

  // Extract pages data - useInfiniteQuery returns { data: { pages: [...] } }
  // TypeScript has trouble inferring the correct type, so we assert the expected structure
  const queryData = query.data as
    | { pages: InfiniteResponse<TData>[] }
    | undefined;
  const pages = queryData?.pages ?? [];
  const flatData = pages.flatMap((page) => page.items);

  return {
    data: flatData,
    pages: pages,
    error: query.error,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    isError: query.isError,
    isSuccess: query.isSuccess,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    refetchWithParams,
  };
};
