import { Suspense } from 'react';
import PracticePageContent from '@/app/_components/templates/PracticePageContent';
import { createMetadata } from '@/libs/metadata';

export const metadata = createMetadata({
  title: '문제 풀기',
  description:
    '수학 문제를 풀고 실력을 향상시키세요. AI가 분석한 개인 맞춤형 문제로 효과적인 학습이 가능합니다.',
  path: '/practice',
  keywords: ['문제 풀기', '수학 문제', '문제 풀이', '연습 문제', '학습하기'],
});

function PracticePageFallback() {
  return (
    <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<PracticePageFallback />}>
      <PracticePageContent />
    </Suspense>
  );
}
