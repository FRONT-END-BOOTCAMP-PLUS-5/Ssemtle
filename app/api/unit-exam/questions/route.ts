// ABOUTME: 단원평가 코드로 해당 문제 목록을 조회하는 API (정답은 내려주지 않음)
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/libs/prisma';
import { PrUnitQuestionRepository } from '@/backend/common/infrastructures/repositories/PrUnitQuestionRepository';
import { GetQuestionsUseCase } from '@/backend/unit/Usecases/UnitExamUsecase';

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
    if (!code || code.length !== 6) {
      return NextResponse.json(
        { success: false, error: '유효한 코드가 아닙니다.' },
        { status: 400 }
      );
    }

    const unitQuestionRepository = new PrUnitQuestionRepository(prisma);
    const usecase = new GetQuestionsUseCase(unitQuestionRepository);
    const result = await usecase.execute({ code });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, questions: result.questions });
  } catch (error) {
    console.error('문제 조회 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
