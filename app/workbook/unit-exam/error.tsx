'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoRefresh, IoChevronBack } from 'react-icons/io5';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Unit exam page error:', error);
  }, [error]);

  return (
    <div className="mx-auto bg-gray-100">
      <div className="container mx-auto max-w-screen-sm px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-200"
          >
            <IoChevronBack className="h-6 w-6 text-gray-700" />
          </button>

          <h1 className="text-lg font-bold text-gray-800">문제풀기</h1>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <div className="h-6 w-6 rounded-full bg-purple-300"></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              문제가 발생했습니다
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              데이터를 불러오는 중 오류가 발생했습니다.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <IoRefresh className="h-4 w-4" />
              다시 시도
            </button>

            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              홈으로 가기
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 w-full rounded-lg border border-red-200 bg-red-50 p-4">
              <summary className="cursor-pointer font-medium text-red-700">
                개발자 정보
              </summary>
              <pre className="mt-2 text-sm whitespace-pre-wrap text-red-600">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
