'use client';

import { useMemo, ReactNode, useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useGets } from '@/hooks/useGets';
import { usePosts } from '@/hooks/usePosts';

interface Unit {
  id: number;
  name: string;
}

interface UnitsResponse {
  units: Unit[];
}

interface UnitExamSolve {
  id: number;
  question: string;
  answer: string;
  userInput: string;
  isCorrect: boolean;
  createdAt: string;
  questionId: number;
  unitCode: string;
}

interface UnitExamSolvesResponse {
  success: boolean;
  solves: UnitExamSolve[];
  codeExists: boolean;
}

interface UnitExamQuestion {
  id: number;
  question: string;
  helpText: string;
}

interface UnitExamQuestionsResponse {
  success: boolean;
  questions: UnitExamQuestion[];
}

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

interface UnitExamDataProviderProps {
  children: (data: {
    examResults: ExamResult[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    fetchNextPage: () => void;
    isError: boolean;
    unitsData: UnitsResponse | undefined;
  }) => ReactNode;
  selectedUnits: (number | string)[];
  dateSort: 'newest' | 'oldest';
  userId?: string;
}

export default function UnitExamDataProvider({
  children,
  selectedUnits,
  dateSort,
  userId,
}: UnitExamDataProviderProps) {
  const { data: session } = useSession();

  // State to track all questions for each exam code
  const [examQuestions, setExamQuestions] = useState<
    Record<string, UnitExamQuestion[]>
  >({});
  const [questionsLoading, setQuestionsLoading] = useState(false);
  // Ref to track which codes we've already fetched to avoid infinite loops
  const fetchedCodesRef = useRef<Set<string>>(new Set());

  // Hook for fetching questions
  const { mutateAsync: fetchQuestions } = usePosts<
    { code: string },
    UnitExamQuestionsResponse
  >({
    onSuccess: () => {
      // Success handling is done in the individual calls
    },
    onError: (error) => {
      console.error('Error fetching questions:', error);
    },
  });

  // Fetch unit-exam solves
  const queryParams = userId ? `?studentId=${encodeURIComponent(userId)}` : '';
  const {
    data: solvesData,
    isLoading: solvesLoading,
    isError: solvesError,
  } = useGets<UnitExamSolvesResponse>(
    ['unit-exam-solves', userId || session?.user?.id],
    `/unit-exam/solves${queryParams}`,
    !!session?.user?.id
  );

  // Fetch units data for filtering
  const { data: unitsData } = useGets<UnitsResponse>(['units'], '/unit', true);

  // Effect to fetch all questions for each exam code when solves data changes
  useEffect(() => {
    const fetchAllQuestions = async () => {
      if (!solvesData?.solves || solvesData.solves.length === 0) {
        setExamQuestions({});
        fetchedCodesRef.current.clear();
        return;
      }

      // Get unique exam codes from solves
      const examCodes = Array.from(
        new Set(solvesData.solves.map((solve) => solve.unitCode))
      );

      // Filter out codes we already have fetched
      const newCodes = examCodes.filter(
        (code) => !fetchedCodesRef.current.has(code)
      );

      if (newCodes.length === 0) return;

      setQuestionsLoading(true);
      try {
        // Fetch questions for all new codes in parallel
        const questionsPromises = newCodes.map(async (code) => {
          try {
            const data = await fetchQuestions({
              path: '/unit-exam/questions',
              postData: { code },
            });
            const questions = data.success ? data.questions : [];
            fetchedCodesRef.current.add(code); // Mark as fetched
            return { code, questions };
          } catch (error) {
            console.error(`Error fetching questions for code ${code}:`, error);
            fetchedCodesRef.current.add(code); // Mark as attempted even if failed
            return { code, questions: [] };
          }
        });

        const results = await Promise.all(questionsPromises);

        // Update state with new questions
        const newQuestions: Record<string, UnitExamQuestion[]> = {};
        results.forEach(({ code, questions }) => {
          newQuestions[code] = questions;
        });

        setExamQuestions((prev) => ({ ...prev, ...newQuestions }));
      } catch (error) {
        console.error('Error fetching exam questions:', error);
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchAllQuestions();
  }, [solvesData, fetchQuestions]);

  // Process exam results: group by exam code and merge with all questions
  const examResults = useMemo(() => {
    if (!solvesData?.solves || solvesData.solves.length === 0) return [];

    // Group attempted solves by exam code
    const groupedByCode = solvesData.solves.reduce(
      (acc, solve) => {
        const code = solve.unitCode;
        if (!acc[code]) {
          acc[code] = [];
        }
        acc[code].push(solve);
        return acc;
      },
      {} as Record<string, UnitExamSolve[]>
    );

    // Convert to exam results with complete question set
    const results: ExamResult[] = Object.entries(groupedByCode).map(
      ([code, attemptedSolves]) => {
        const allQuestions = examQuestions[code] || [];

        // If we don't have all questions yet, use attempted questions only (fallback)
        if (allQuestions.length === 0) {
          const correctAnswers = attemptedSolves.filter(
            (solve) => solve.isCorrect
          ).length;
          const attemptedQuestions = attemptedSolves.length;
          const accuracy =
            attemptedQuestions > 0
              ? (correctAnswers / attemptedQuestions) * 100
              : 0;

          // Get unit info from solves
          const unitId =
            unitsData?.units?.find((u) =>
              attemptedSolves.some((s) => s.question.includes(u.name))
            )?.id || 1;

          const transformedSolves = attemptedSolves.map((solve) => ({
            id: solve.id,
            question: solve.question,
            answer: solve.answer,
            userInput: solve.userInput,
            isCorrect: solve.isCorrect,
            createdAt: solve.createdAt,
            unitId: unitId,
            category: '단원평가',
            isAttempted: true,
          }));

          return {
            category: `단원평가 ${code}`,
            unitId: unitId,
            solves: transformedSolves,
            examCode: code,
            totalQuestions: attemptedQuestions,
            attemptedQuestions: attemptedQuestions,
            correctAnswers,
            accuracy: Math.round(accuracy),
          };
        }

        // Create a map of attempted questions by question ID
        const attemptedMap = new Map<number, UnitExamSolve>();
        attemptedSolves.forEach((solve) => {
          attemptedMap.set(solve.questionId, solve);
        });

        // Get unit info from solves (for compatibility)
        const unitId =
          unitsData?.units?.find((u) =>
            attemptedSolves.some((s) => s.question.includes(u.name))
          )?.id || 1;

        // Merge all questions with attempted data
        const allTransformedSolves: TransformedSolve[] = allQuestions.map(
          (question) => {
            const attemptedSolve = attemptedMap.get(question.id);

            if (attemptedSolve) {
              // Question was attempted
              return {
                id: attemptedSolve.id,
                question: attemptedSolve.question,
                answer: attemptedSolve.answer,
                userInput: attemptedSolve.userInput,
                isCorrect: attemptedSolve.isCorrect,
                createdAt: attemptedSolve.createdAt,
                unitId: unitId,
                category: '단원평가',
                isAttempted: true,
              };
            } else {
              // Question was not attempted
              return {
                id: question.id,
                question: question.question,
                answer: '', // We don't have the answer for unattempted questions
                userInput: null,
                isCorrect: false,
                createdAt: new Date().toISOString(), // Use current date for unattempted
                unitId: unitId,
                category: '단원평가',
                isAttempted: false,
              };
            }
          }
        );

        const correctAnswers = allTransformedSolves.filter(
          (solve) => solve.isCorrect && solve.isAttempted
        ).length;
        const totalQuestions = allTransformedSolves.length;
        const attemptedQuestions = allTransformedSolves.filter(
          (solve) => solve.isAttempted
        ).length;
        const accuracy =
          totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        return {
          category: `단원평가 ${code}`,
          unitId: unitId,
          solves: allTransformedSolves,
          examCode: code,
          totalQuestions,
          attemptedQuestions,
          correctAnswers,
          accuracy: Math.round(accuracy),
        };
      }
    );

    // Apply filtering
    let filtered = results;
    if (selectedUnits.length > 0) {
      filtered = results.filter((result) =>
        selectedUnits.includes(result.unitId)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.solves[0]?.createdAt || 0);
      const dateB = new Date(b.solves[0]?.createdAt || 0);

      if (dateSort === 'newest') {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });

    return sorted;
  }, [solvesData, selectedUnits, dateSort, unitsData, examQuestions]);

  return (
    <>
      {children({
        examResults,
        isLoading: solvesLoading || questionsLoading,
        isFetchingNextPage: false, // No infinite scroll for now
        hasNextPage: false,
        fetchNextPage: () => {},
        isError: solvesError,
        unitsData,
      })}
    </>
  );
}
