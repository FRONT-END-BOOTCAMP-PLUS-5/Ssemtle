// app/mypage/error-note/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500" />
        <p className="text-gray-600">오답노트를 불러오는 중...</p>
      </div>
    </div>
  );
}
