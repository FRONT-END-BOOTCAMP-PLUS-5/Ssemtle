import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';

interface PostProps<TResponse> {
  onSuccess: (data: TResponse) => void;
  onError: (err: unknown) => void;
}

interface MutateProps<TRequest> {
  postData?: TRequest;
  path: string;
}

const usePosts = <TRequest, TResponse>({
  onSuccess,
  onError,
}: PostProps<TResponse>) => {
  const { isError, isPending, isPaused, isSuccess, mutate, mutateAsync } =
    useMutation<TResponse, unknown, MutateProps<TRequest>>({
      mutationFn: async ({
        postData,
        path,
      }: {
        postData?: unknown;
        path: string;
      }) => {
        const response: AxiosResponse<TResponse> = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}${path}`,
          postData,
          { withCredentials: true }
        );
        return response.data;
      },
      onSuccess: onSuccess,
      onError: onError,
    });

  return { isError, isPending, isPaused, isSuccess, mutate, mutateAsync };
};

export { usePosts };
