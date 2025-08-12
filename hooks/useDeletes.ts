import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';

interface DeleteProps<TResponse> {
  onSuccess: (data: TResponse) => void;
  onError: (err: unknown) => void;
}

interface MutateProps<TRequest> {
  deleteData?: TRequest;
  path: string;
}

const useDeletes = <TRequest, TResponse>({
  onSuccess,
  onError,
}: DeleteProps<TResponse>) => {
  const { isError, isPending, isPaused, isSuccess, mutate, mutateAsync } =
    useMutation<TResponse, unknown, MutateProps<TRequest>>({
      mutationFn: async ({
        deleteData,
        path,
      }: {
        deleteData?: unknown;
        path: string;
      }) => {
        const response: AxiosResponse<TResponse> = await axios.delete(
          `${process.env.NEXT_PUBLIC_BASE_URL}${path}`,
          {
            data: deleteData,
            withCredentials: true,
          }
        );
        return response.data;
      },
      onSuccess: onSuccess,
      onError: onError,
    });

  return { isError, isPending, isPaused, isSuccess, mutate, mutateAsync };
};

export { useDeletes };
