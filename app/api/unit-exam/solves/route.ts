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
    const raw = searchParams.get('code');
    const code = raw ? raw.toString().trim().toUpperCase() : undefined;
    const base = code?.slice(0, 6);

    // Get studentId from query params (human-readable userId) or use session user id
    const studentIdParam = searchParams.get('studentId');
    let targetUserId = session.user.id;

    if (studentIdParam) {
      // Convert human-readable userId to UUID
      const studentUser = await prisma.user.findUnique({
        where: { userId: studentIdParam.toString().trim() },
        select: { id: true },
      });

      if (!studentUser) {
        return NextResponse.json(
          {
            success: false,
            error: `학생 ID '${studentIdParam}'를 찾을 수 없습니다.`,
          },
          { status: 404 }
        );
      }

      targetUserId = studentUser.id;
    }

    const result = await usecase.execute(targetUserId, code);

    const [codeExistsExact, codeExistsBase] = await Promise.all([
      code
        ? prisma.unitExam.count({ where: { code } }).then((n) => n > 0)
        : Promise.resolve(false),
      base
        ? prisma.unitExam.count({ where: { code: base } }).then((n) => n > 0)
        : Promise.resolve(false),
      code
        ? prisma.unitQuestion.count({ where: { unitCode: code } })
        : Promise.resolve(0),
      base
        ? prisma.unitQuestion.count({ where: { unitCode: base } })
        : Promise.resolve(0),
      code
        ? prisma.unitSolve.count({
            where: { userId: targetUserId, question: { unitCode: code } },
          })
        : Promise.resolve(0),
      base
        ? prisma.unitSolve.count({
            where: { userId: targetUserId, question: { unitCode: base } },
          })
        : Promise.resolve(0),
    ]);

    // debug logs removed

    const codeExists = Boolean(codeExistsExact || codeExistsBase);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      solves: result.solves,
      codeExists,
    });
  } catch (error) {
    console.error('풀이 조회 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
