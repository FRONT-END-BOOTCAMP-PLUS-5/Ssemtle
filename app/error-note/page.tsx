import { Suspense } from 'react';
import ErrorNoteInterface from './_components/ErrorNoteInterface';

export default function ErrorNotePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
            <p className="text-gray-600">오답노트를 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <ErrorNoteInterface />
    </Suspense>
  );
}
