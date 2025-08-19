import { Suspense } from 'react';
import PracticePageContent from '@/app/_components/templates/PracticePageContent';

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
