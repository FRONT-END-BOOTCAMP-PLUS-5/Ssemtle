'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import PracticeInterface from '@/app/_components/organisms/PracticeInterface';
import { useGets } from '@/hooks/useGets';
import { SolveResponseDto } from '@/backend/solves/dtos/SolveDto';

interface Problem {
  id: string;
  question: string;
  answer: string;
  helpText: string;
}

interface Unit {
  id: number;
  name: string;
}

interface UnitsResponse {
  units: Unit[];
}

interface UnitVideoResponse {
  data: {
    id: number;
    vidUrl: string;
  };
}

export default function PracticePageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const unitIdParam = searchParams.get('unitId');
  const unitId = unitIdParam ? parseInt(unitIdParam) : null;
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [problemsLoading, setProblemsLoading] = useState(false);

  // Problem queue management
  const [problemQueue, setProblemQueue] = useState<SolveResponseDto[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  // Fetch all units to find the specific unit by ID
  const { data: unitsData, isLoading: unitsLoading } = useGets<UnitsResponse>(
    ['units'],
    '/unit',
    true
  );

  // Find the current unit based on URL parameter
  const currentUnit = unitsData?.units?.find((unit) => unit.id === unitId);

  // Fetch video URL for the current unit
  const { data: videoData } = useGets<UnitVideoResponse>(
    ['unitVideo', currentUnit?.id],
    `/unitvidurl/${currentUnit?.id}`,
    !!currentUnit?.id
  );

  // Helper function to convert SolveResponseDto to Problem interface
  const convertToProblem = useCallback(
    (solveDto: SolveResponseDto, index: number): Problem => {
      return {
        id: `${Date.now()}-${index}`,
        question: solveDto.question,
        answer: solveDto.answer,
        helpText: solveDto.helpText || '도움말이 없습니다.',
      };
    },
    []
  );

  // Helper function to show problem at specific index from queue
  const showProblemAtIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < problemQueue.length) {
        const problem = convertToProblem(problemQueue[index], index);
        setCurrentProblem(problem);
        setCurrentProblemIndex(index);
      }
    },
    [problemQueue, convertToProblem]
  );

  const fetchNewProblemBatch = useCallback(async () => {
    if (!currentUnit) return;

    setProblemsLoading(true);
    try {
      const response = await fetch(
        `/api/solves?unit=${encodeURIComponent(currentUnit.name)}`
      );

      if (!response.ok) {
        throw new Error('Failed to generate problem');
      }

      const data: SolveResponseDto[] = await response.json();

      if (data && data.length > 0) {
        // Store the full array and start from index 0
        setProblemQueue(data);
        setCurrentProblemIndex(0);

        // Show the first problem
        const firstProblem = convertToProblem(data[0], 0);
        setCurrentProblem(firstProblem);
      } else {
        throw new Error('No problems generated');
      }
    } catch (error) {
      console.error('Error generating problem:', error);
      setCurrentProblem(null);
      setProblemQueue([]);
      setCurrentProblemIndex(0);
    } finally {
      setProblemsLoading(false);
    }
  }, [currentUnit, convertToProblem]);

  const handleSubmitAnswer = async (
    userInput: string,
    problem: Problem
  ): Promise<{ isCorrect: boolean }> => {
    if (!session?.user?.id || !currentUnit) {
      throw new Error('Missing user or unit information');
    }

    try {
      const response = await fetch('/api/solves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: problem.question,
          answer: problem.answer,
          helpText: problem.helpText,
          userInput: userInput,
          unitId: currentUnit.id,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const result = await response.json();
      return { isCorrect: result.isCorrect };
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  };

  // Smart next problem handler
  const handleNext = useCallback(() => {
    const nextIndex = currentProblemIndex + 1;

    if (nextIndex < problemQueue.length) {
      // Use next problem from current queue
      showProblemAtIndex(nextIndex);
    } else {
      // Queue exhausted, fetch new batch
      fetchNewProblemBatch();
    }
  }, [
    currentProblemIndex,
    problemQueue.length,
    showProblemAtIndex,
    fetchNewProblemBatch,
  ]);

  // Generate initial problem when component mounts
  useEffect(() => {
    if (
      currentUnit &&
      !currentProblem &&
      !problemsLoading &&
      problemQueue.length === 0
    ) {
      fetchNewProblemBatch();
    }
  }, [
    currentUnit,
    currentProblem,
    problemsLoading,
    problemQueue.length,
    fetchNewProblemBatch,
  ]);

  // Check authentication and loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="mb-4 text-gray-600">로그인이 필요합니다</p>
          <button
            onClick={() => router.push('/signin')}
            className="rounded-lg bg-violet-500 px-4 py-2 text-white transition-colors hover:bg-violet-600"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (unitsLoading) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Handle missing or invalid unit parameter
  if (!unitId || isNaN(unitId) || (!unitsLoading && !currentUnit)) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            {!unitId || isNaN(unitId)
              ? '단원을 선택해주세요'
              : '유효하지 않은 단원입니다'}
          </p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-violet-500 px-4 py-2 text-white transition-colors hover:bg-violet-600"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <div className="container mx-auto px-4 tablet:px-24 tablet:py-6">
        {/* Practice Interface */}
        <PracticeInterface
          userName={session.user.name || ''}
          unitName={currentUnit?.name || ''}
          currentProblem={currentProblem}
          videoUrl={videoData?.data?.vidUrl}
          loading={problemsLoading}
          onSubmitAnswer={handleSubmitAnswer}
          onGenerateNext={handleNext}
        />
      </div>
    </div>
  );
}
