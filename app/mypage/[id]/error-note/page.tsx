import { Suspense } from 'react';
import MyPageErrorNoteWrapper from './MyPageErrorNoteWrapper';

function Fallback() {
  return (
    <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500" />
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback />}>
      <MyPageErrorNoteWrapper />
    </Suspense>
  );
}
