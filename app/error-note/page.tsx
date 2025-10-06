import { Suspense } from 'react';
import ErrorNoteInterface from '@/app/_components/error-note/ErrorNoteInterface';
import { createMetadata } from '@/libs/metadata';

export const metadata = createMetadata({
  title: '오답노트',
  description:
    '틀린 문제를 다시 풀어보고 복습하세요. AI가 분석한 오답 패턴으로 약점을 보완할 수 있습니다.',
  path: '/error-note',
  keywords: ['오답노트', '틀린 문제', '복습', '오답 관리', '약점 보완'],
});

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
