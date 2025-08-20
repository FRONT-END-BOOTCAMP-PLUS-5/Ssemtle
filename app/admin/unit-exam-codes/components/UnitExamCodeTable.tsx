'use client';

interface UnitExamCodeDto {
  id: string; // UI용 row id (index 기반)
  code: string; // 실제 삭제 등 키로 사용
  category: string;
  problemCount: number;
  timerMinutes?: number | null;
  createdAt: string;
}

interface UnitExamCodeTableProps {
  items: UnitExamCodeDto[];
  onDelete: (code: string) => void;
  onOpenProblems?: (code: string) => void;
}

export default function UnitExamCodeTable({
  items,
  onDelete,
  onOpenProblems,
}: UnitExamCodeTableProps) {
  // 항목이 없을 경우 표준 빈 상태 표시
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        등록된 코드가 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-6 border-b-2 border-neutral-200/70 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <span className="truncate text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs lg:text-xs">
                {item.code}
              </span>
            </div>
            <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <span className="truncate text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs lg:text-xs">
                {item.problemCount}
              </span>
            </div>
            <div className="flex items-start px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <span className="text-[8px] font-bold break-words whitespace-pre-wrap text-neutral-700 sm:text-[10px] md:text-xs lg:text-xs">
                {item.category}
              </span>
            </div>
            <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <span className="truncate text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs lg:text-xs">
                {item.timerMinutes ? `${item.timerMinutes}분` : '-'}
              </span>
            </div>
            <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <button
                className="rounded-md border border-neutral-300 px-2 py-1 text-[10px] font-semibold text-neutral-700 hover:bg-neutral-50 md:text-xs"
                onClick={() => onOpenProblems?.(item.code)}
                aria-label="시험지 보기"
              >
                시험지 보기
              </button>
            </div>
            <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <div className="flex w-full items-center justify-between gap-2">
                <span className="truncate text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs lg:text-xs">
                  {item.createdAt}
                </span>
                <button
                  onClick={() => onDelete(item.code)}
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-100"
                  title="삭제"
                  aria-label="삭제"
                >
                  <svg
                    className="h-4 w-4 text-rose-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="md:hidden">
        {items.map((item) => (
          <div key={item.id} className="border-b border-gray-200 p-4">
            <div className="mb-3">
              <div className="text-sm font-bold text-neutral-700">
                {item.code}
              </div>
              <div className="mt-1 text-xs text-neutral-700">
                문항 수: {item.problemCount}
              </div>
              <div className="text-xs break-words whitespace-pre-wrap text-neutral-500">
                {item.category}
              </div>
              <div className="mt-2">
                <button
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                  onClick={() => onOpenProblems?.(item.code)}
                  aria-label="시험지 보기"
                >
                  시험지 보기
                </button>
              </div>
              <div className="text-xs text-neutral-500">{item.createdAt}</div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => onDelete(item.code)}
                className="flex h-6 w-6 items-center justify-center text-rose-500 hover:text-rose-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
