import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRef } from 'react';

interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}

export const useGets = <TData>(
  queryKey: QueryKey,
  path: string,
  enabled = true,
  params?: Record<string, string>,
  headers?: Record<string, string>,
  options?: Omit<
    UseQueryOptions<TData, AxiosError<ApiErrorResponse>, TData, QueryKey>,
    'queryKey' | 'queryFn'
  >
) => {
  const paramsRef = useRef(params);

  const queryFn = async () => {
    const response = await axios.get<TData>(
      `${process.env.NEXT_PUBLIC_BASE_URL}${path}`,
      {
        params: paramsRef.current,
        headers,
        withCredentials: true,
      }
    );
    return response.data;
  };

  const query = useQuery<TData, AxiosError<ApiErrorResponse>, TData, QueryKey>({
    queryKey: queryKey,
    queryFn: queryFn,
    enabled,
    ...options,
  });

  const refetchWithParams = (newParams: Record<string, string>) => {
    paramsRef.current = newParams;
    return query.refetch();
  };

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    refetchWithParams,
  };
};
