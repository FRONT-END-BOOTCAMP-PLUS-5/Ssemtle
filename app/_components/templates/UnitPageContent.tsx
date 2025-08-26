'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePosts } from '@/hooks/usePosts';
import AnswerSection from '@/app/_components/molecules/AnswerSection';
import NumberPad from '@/app/_components/molecules/NumberPad';
import ExamCountdown from '@/app/unit-exam/_components/ExamCountdown';
import { toast } from 'react-toastify';
import { confirmToast } from '@/utils/toast/confirmToast';

interface Problem {
  id: string;
  question: string;
  answer: string;
  helpText: string;
}

interface ExamQuestion {
  id: number;
  question: string;
  helpText: string;
}

interface FetchQuestionsRequest {
  code: string;
}

interface FetchQuestionsResponse {
  success: boolean;
  questions: ExamQuestion[];
}

interface SubmitExamRequest {
  code: string;
  answers: Array<{
    questionId: number;
    userInput: string;
  }>;
}

interface VerifyExamRequest {
  code: string;
}

interface VerifyExamResponse {
  success: boolean;
  valid?: boolean;
  examData?: {
    id: number;
    teacherId: string;
    createdAt: Date;
  };
  error?: string;
  alreadyAttempted?: boolean;
}

interface SubmitExamResponse {
  success: boolean;
  saved: number;
  error?: string;
}

// Unit exam specific interfaces will be handled inline

export default function UnitExamPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const examCodeParam = searchParams.get('examCode');
  const examCode = examCodeParam?.trim().toUpperCase() || null;
  const redirectURL = `/unit-result?studentId=${session?.user.userId}&code=${examCode}`;

  // Parse exam code to extract timer minutes
  const parseExamCode = (code: string | null) => {
    if (!code) return { baseCode: null, timeMinutes: null };

    const match = code.match(/^([A-Z]{6})-?(\d+)$/);
    if (match) {
      return {
        baseCode: match[1],
        timeMinutes: parseInt(match[2], 10),
      };
    }

    return { baseCode: null, timeMinutes: null };
  };

  const { baseCode, timeMinutes } = parseExamCode(examCode);
  // Unit exam specific state
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Map<number, string>>(
    new Map()
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  // toast utilities
  const warnToast = (body: string, handleClose?: () => void) =>
    toast.warn(body, { onClose: handleClose });

  const errorToast = (message: string) => {
    toast.error(message, {
      position: 'top-center',
      autoClose: 5000,
    });
  };

  // Setup usePosts hooks
  const verifyExamMutation = usePosts<VerifyExamRequest, VerifyExamResponse>({
    onSuccess: (data) => {
      setVerificationAttempted(true);

      if (data.success && data.valid) {
        setIsVerified(true);
        // Chain to questions after successful verification
        fetchExamQuestions();
      } else if (data.alreadyAttempted) {
        warnToast('이미 응시한 시험입니다.');
        router.push('/');
      } else {
        warnToast('유효하지 않은 코드입니다.');
        router.push('/');
      }
    },
    onError: () => {
      setVerificationAttempted(true);
      warnToast('코드 검증 중 오류가 발생했습니다.');
      router.push('/');
    },
  });

  const fetchQuestionsMutation = usePosts<
    FetchQuestionsRequest,
    FetchQuestionsResponse
  >({
    onSuccess: (data) => {
      if (data.success && data.questions && data.questions.length > 0) {
        setExamQuestions(data.questions);
        setCurrentQuestionIndex(0);

        // Show the first question
        const firstProblem = convertExamQuestionToProblem(data.questions[0]);
        setCurrentProblem(firstProblem);
      } else {
        const errorMsg = !data.success
          ? '유효하지 않은 코드입니다.'
          : '이 시험에는 문제가 없습니다.';
        errorToast(errorMsg);
        setCurrentProblem(null);
        setExamQuestions([]);
        setCurrentQuestionIndex(0);
        router.push('/');
      }
    },
    onError: async (error) => {
      console.error('Error fetching exam questions:', error);

      // Handle case where attempt was already created (backend race condition)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('이미 응시한') ||
        errorMessage.includes('already attempted')
      ) {
        warnToast('이미 응시한 시험입니다. 결과 페이지로 이동합니다.');
        router.push('/');
        return;
      }

      // Handle other errors
      errorToast('문제를 불러오는 중 오류가 발생했습니다.');
      setCurrentProblem(null);
      setExamQuestions([]);
      setCurrentQuestionIndex(0);
      router.push('/');
      return;
    },
  });

  const submitExamMutation = usePosts<SubmitExamRequest, SubmitExamResponse>({
    onSuccess: () => {
      router.push(redirectURL); // Redirect to home or results page
    },
    onError: (error) => {
      errorToast(
        `시험 제출 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
      router.push('/');
    },
  });

  // Helper function to convert exam question to Problem interface
  const convertExamQuestionToProblem = useCallback(
    (examQuestion: {
      id: number;
      question: string;
      helpText: string;
    }): Problem => {
      return {
        id: examQuestion.id.toString(),
        question: examQuestion.question,
        answer: '', // Answer not provided in exam questions
        helpText: examQuestion.helpText,
      };
    },
    []
  );

  // Helper function to show question at specific index
  const showQuestionAtIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < examQuestions.length) {
        const problem = convertExamQuestionToProblem(examQuestions[index]);
        setCurrentProblem(problem);
        setCurrentQuestionIndex(index);
      }
    },
    [examQuestions, convertExamQuestionToProblem]
  );

  const verifyExamCode = useCallback(() => {
    if (!examCode || !baseCode) return;

    verifyExamMutation.mutate({
      postData: { code: examCode },
      path: '/unit-exam/verify',
    });
  }, [examCode, baseCode, verifyExamMutation]);

  const fetchExamQuestions = useCallback(() => {
    if (!examCode || !baseCode) return;

    fetchQuestionsMutation.mutate({
      postData: { code: examCode },
      path: '/unit-exam/questions',
    });
  }, [examCode, baseCode, fetchQuestionsMutation]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < examQuestions.length) {
      showQuestionAtIndex(nextIndex);
    }
  }, [currentQuestionIndex, examQuestions.length, showQuestionAtIndex]);

  const handlePrevious = useCallback(() => {
    const prevIndex = currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      showQuestionAtIndex(prevIndex);
    }
  }, [currentQuestionIndex, showQuestionAtIndex]);

  // Submit all exam answers
  const handleSubmitExam = useCallback(
    async (forceSubmit = false) => {
      if (!examCode || !session?.user?.id) {
        warnToast('로그인 정보가 없습니다.');
        return;
      }

      const answers = Array.from(userAnswers.entries()).map(
        ([questionId, userInput]) => ({
          questionId,
          userInput,
        })
      );

      if (forceSubmit && answers.length === 0) {
        router.push(redirectURL);
        return;
      }

      if (!forceSubmit && answers.length === 0) {
        warnToast('제출할 답안이 없습니다.');
        return;
      }

      // Confirm submission
      if (
        !forceSubmit &&
        !(await confirmToast(
          '답안을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.'
        ))
      ) {
        return;
      }

      submitExamMutation.mutate({
        postData: {
          code: examCode,
          answers: answers,
        },
        path: '/unit-exam/submit',
      });
    },
    [
      examCode,
      session?.user?.id,
      userAnswers,
      submitExamMutation,
      router,
      redirectURL,
    ]
  );

  // Handle time expiry with auto-submit
  const handleTimeUp = useCallback(() => {
    // Show warning and auto-submit
    warnToast('시험 시간이 만료되었습니다. 자동으로 답안을 제출합니다.');

    handleSubmitExam(true); // Pass true to force submit behavior
  }, [handleSubmitExam]);

  // Verify exam code first, then fetch questions
  useEffect(() => {
    if (
      examCode &&
      !verificationAttempted &&
      !verifyExamMutation.isPending &&
      !fetchQuestionsMutation.isPending
    ) {
      verifyExamCode();
    }
  }, [
    examCode,
    verificationAttempted,
    verifyExamMutation.isPending,
    fetchQuestionsMutation.isPending,
    verifyExamCode,
  ]);

  // Reset verification states when exam code changes
  useEffect(() => {
    setVerificationAttempted(false);
    setIsVerified(false);
  }, [examCode]);

  // Check authentication and loading state
  if (status === 'loading') {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
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

  // Show loading state for verification and questions
  if (verifyExamMutation.isPending) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
          <p className="text-gray-600">시험 코드를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (fetchQuestionsMutation.isPending) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
          <p className="text-gray-600">문제를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Handle missing or invalid exam code
  if (!examCode || !baseCode) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            {!examCode
              ? '단원평가 코드를 입력해주세요'
              : '유효하지 않은 단원평가 코드입니다 (ABCDEF-60 형식)'}
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

  // Only show exam interface if verification is complete and successful
  if (!isVerified) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
          <p className="text-gray-600">시험을 준비하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <div className="mx-auto py-6 tablet:px-64">
        {/* Unit Exam Interface */}
        <div className="mx-auto flex w-full flex-col space-y-6">
          {/* Left Column - Problem and Input */}
          <div className="flex w-full flex-col space-y-6">
            {/* Problem Display with Exam Progress */}
            <div className="mx-auto w-full">
              <div className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
                {/* Problem Title with Progress */}
                <div className="text-center">
                  <div className="flex justify-between text-2xl font-bold text-gray-800">
                    <div className="pl-2">단원평가</div>
                    {timeMinutes && (
                      <ExamCountdown
                        timeMinutes={timeMinutes}
                        onTimeUp={handleTimeUp}
                      />
                    )}
                  </div>
                  <div className="mt-2 flex flex-col items-center space-y-2">
                    {examQuestions.length > 0 && (
                      <p className="text-sm text-gray-600">
                        문제 {currentQuestionIndex + 1} / {examQuestions.length}
                      </p>
                    )}
                  </div>
                </div>

                {/* Equation Card */}
                {currentProblem && (
                  <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-violet-100 p-6 shadow-sm">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800">
                        {currentProblem.question}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Section with Exam Navigation */}
            <div className="mx-auto w-full">
              <div className="space-y-4 rounded-3xl bg-white p-6 shadow-lg">
                <AnswerSection
                  value={
                    currentProblem
                      ? userAnswers.get(parseInt(currentProblem.id)) || ''
                      : ''
                  }
                  onChange={(value) => {
                    if (currentProblem) {
                      const questionId = parseInt(currentProblem.id);
                      setUserAnswers((prev) =>
                        new Map(prev).set(questionId, value)
                      );
                    }
                  }}
                  onSubmit={undefined} // No immediate submit in exam mode
                  onNext={handleNext}
                  submitState="initial"
                  wasAnswerCorrect={undefined}
                  loading={false}
                  disabled={fetchQuestionsMutation.isPending}
                />

                {/* Exam Navigation */}
                <div className="flex justify-between space-x-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    이전 문제
                  </button>

                  <div className="flex space-x-2">
                    {currentQuestionIndex < examQuestions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        disabled={submitExamMutation.isPending}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        다음 문제
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubmitExam()}
                        disabled={submitExamMutation.isPending}
                        className="rounded-lg bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {submitExamMutation.isPending
                          ? '제출 중...'
                          : '시험 제출'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Number Pad */}
            <NumberPad
              onNumberClick={(number) => {
                if (currentProblem) {
                  const questionId = parseInt(currentProblem.id);
                  const currentValue = userAnswers.get(questionId) || '';
                  setUserAnswers((prev) =>
                    new Map(prev).set(questionId, currentValue + number)
                  );
                }
              }}
              onOperatorClick={(operator) => {
                if (currentProblem) {
                  const questionId = parseInt(currentProblem.id);
                  const currentValue = userAnswers.get(questionId) || '';
                  setUserAnswers((prev) =>
                    new Map(prev).set(questionId, currentValue + operator)
                  );
                }
              }}
              onClear={() => {
                if (currentProblem) {
                  const questionId = parseInt(currentProblem.id);
                  setUserAnswers((prev) => new Map(prev).set(questionId, ''));
                }
              }}
              disabled={fetchQuestionsMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
