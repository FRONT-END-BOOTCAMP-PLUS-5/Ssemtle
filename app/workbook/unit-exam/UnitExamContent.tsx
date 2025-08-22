'use client';

import { ReactNode } from 'react';
import ExamResultCard from './ExamResultCard';
import WorkbookInfiniteScroll from '@/app/workbook/_components/WorkbookInfiniteScroll';

interface TransformedSolve {
  id: number;
  question: string;
  answer: string;
  userInput: string | null;
  isCorrect: boolean;
  createdAt: string;
  unitId: number;
  category: string;
  isAttempted: boolean;
}

interface ExamResult {
  category: string;
  unitId: number;
  solves: TransformedSolve[];
  examCode: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

interface UnitExamContentProps {
  isLoading: boolean;
  isError: boolean;
  examResults: ExamResult[];
  dateSort: 'newest' | 'oldest';
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  children?: ReactNode; // For filter components
}

export default function UnitExamContent({
  isLoading,
  isError,
  examResults,
  dateSort,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  children,
}: UnitExamContentProps) {
  return (
    <>
      {children}

      <div
        key={`${dateSort}-${JSON.stringify(examResults.length)}`}
        className="space-y-6 tablet:grid tablet:grid-cols-2 tablet:gap-6 tablet:space-y-0"
      >
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        )}

        {isError && (
          <div className="flex justify-center py-12">
            <div className="text-sm text-red-600">
              데이터를 불러오는데 실패했습니다
            </div>
          </div>
        )}

        {!isLoading && !isError && examResults.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="text-sm text-gray-600">
              단원평가 결과가 없습니다
            </div>
          </div>
        )}

        {/* Only render when we have data and not loading to prevent mixed data */}
        {!isLoading && !isError && examResults.length > 0 && (
          <>
            {examResults.map((examResult) => {
              // Create stable key using exam code and date sort
              const stableKey = `${examResult.examCode}-${dateSort}`;

              return (
                <div key={stableKey}>
                  <ExamResultCard examResult={examResult} />
                </div>
              );
            })}

            <WorkbookInfiniteScroll
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              dataLength={examResults.length}
            />
          </>
        )}
      </div>
    </>
  );
}
