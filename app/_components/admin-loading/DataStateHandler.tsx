interface DataStateHandlerProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  children: React.ReactNode;
}

export default function DataStateHandler({
  isLoading,
  isError,
  error,
  isEmpty,
  loadingMessage = '데이터를 불러오는 중...',
  errorMessage = '데이터를 불러오는데 실패했습니다',
  emptyMessage = '데이터가 없습니다',
  children,
}: DataStateHandlerProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-lg font-semibold text-gray-600">
          {loadingMessage}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="mb-4 text-lg font-semibold text-red-600">
          {errorMessage}
        </div>
        <div className="mb-4 text-sm text-gray-600">
          {error?.message || '서버 오류가 발생했습니다.'}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <div className="text-lg font-semibold text-gray-600">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
