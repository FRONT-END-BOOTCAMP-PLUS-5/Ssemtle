'use client';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showFirstLast = true,
  maxVisiblePages = 4,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: number[] = [];

    const groupSize = maxVisiblePages;
    const currentGroup = Math.ceil(currentPage / groupSize);
    const startPage = (currentGroup - 1) * groupSize + 1;
    const endPage = Math.min(totalPages, startPage + groupSize - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* 처음 페이지 버튼 */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'cursor-pointer border border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50'
          }`}
          aria-label="처음 페이지"
        >
          처음
        </button>
      )}

      {/* 이전 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`rounded-lg p-2 transition-colors ${
          currentPage === 1
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'cursor-pointer border border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50'
        }`}
        aria-label="이전 페이지"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {/* 페이지 번호들 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            currentPage === page
              ? 'cursor-pointer bg-violet-600 text-white'
              : 'cursor-pointer border border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* 다음 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`rounded-lg p-2 transition-colors ${
          currentPage === totalPages
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'cursor-pointer border border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50'
        }`}
        aria-label="다음 페이지"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>

      {/* 마지막 페이지 버튼 */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'cursor-pointer border border-gray-300 bg-white text-gray-700 hover:border-violet-400 hover:bg-violet-50'
          }`}
          aria-label="마지막 페이지"
        >
          마지막
        </button>
      )}
    </div>
  );
}
