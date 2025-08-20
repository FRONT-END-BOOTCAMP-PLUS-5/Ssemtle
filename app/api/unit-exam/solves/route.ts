// ABOUTME: 현재 로그인한 사용자가 푼 단원평가 문제 조회 API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/libs/prisma';
import { PrUnitSolveRepository } from '@/backend/common/infrastructures/repositories/PrUnitSolveRepository';
import { GetUserUnitSolvesUseCase } from '@/backend/unit/Usecases/UnitExamUsecase';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const unitSolveRepository = new PrUnitSolveRepository(prisma);
    const usecase = new GetUserUnitSolvesUseCase(unitSolveRepository);
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || undefined;
    const result = await usecase.execute(session.user.id, code);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, solves: result.solves });
  } catch (error) {
    console.error('풀이 조회 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
