import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';

interface PutProps<TResponse> {
  onSuccess: (data: TResponse) => void;
  onError: (err: unknown) => void;
}

interface MutateProps<TRequest> {
  putData?: TRequest;
  path: string;
}

const usePuts = <TRequest, TResponse>({
  onSuccess,
  onError,
}: PutProps<TResponse>) => {
  const { isError, isPending, isPaused, isSuccess, mutate, mutateAsync } =
    useMutation<TResponse, unknown, MutateProps<TRequest>>({
      mutationFn: async ({
        putData,
        path,
      }: {
        putData?: unknown;
        path: string;
      }) => {
        const response: AxiosResponse<TResponse> = await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_URL}${path}`,
          putData,
          { withCredentials: true }
        );
        return response.data;
      },
      onSuccess: onSuccess,
      onError: onError,
    });

  return { isError, isPending, isPaused, isSuccess, mutate, mutateAsync };
};

export { usePuts };
