import { Suspense } from 'react';
import UnitExamPageContent from '@/app/_components/templates/UnitPageContent';

export default function UnitExamPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
            <p className="text-gray-600">단원평가를 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <UnitExamPageContent />
    </Suspense>
  );
}
