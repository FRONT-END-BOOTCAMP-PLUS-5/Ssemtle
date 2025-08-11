// ABOUTME: 단원평가 일괄 제출 API. 학생 답안을 받아 정오 처리 후 UnitSolve에 저장
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/libs/prisma';
import { auth } from '@/auth';
import { PrUnitQuestionRepository } from '@/backend/common/infrastructures/repositories/PrUnitQuestionRepository';
import { PrUnitSolveRepository } from '@/backend/common/infrastructures/repositories/PrUnitSolveRepository';
import { SubmitAnswersUseCase } from '@/backend/unit/UseCases/UnitExamUsecase';

type SubmitAnswer = {
  questionId: number;
  userInput: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const code = body?.code?.toString().trim().toUpperCase();
    const answers: SubmitAnswer[] = Array.isArray(body?.answers)
      ? body.answers
      : [];

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { success: false, error: '유효한 코드가 아닙니다.' },
        { status: 400 }
      );
    }
    if (answers.length === 0) {
      return NextResponse.json(
        { success: false, error: '제출할 답안이 없습니다.' },
        { status: 400 }
      );
    }

    const unitQuestionRepository = new PrUnitQuestionRepository(prisma);
    const unitSolveRepository = new PrUnitSolveRepository(prisma);
    const usecase = new SubmitAnswersUseCase(
      unitQuestionRepository,
      unitSolveRepository
    );
    const result = await usecase.execute({
      code,
      studentId: session.user.id,
      answers,
    });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, saved: result.saved });
  } catch (error) {
    console.error('일괄 제출 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
