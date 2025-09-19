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
    ]);

    // debug logs removed

    const codeExists = Boolean(codeExistsExact || codeExistsBase);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // 코드가 있는 경우: 전체 문제 목록과 사용자의 제출 내역을 병합하여 미응시를 포함시킴
    let merged:
      | Array<{
          id: number;
          question: string;
          answer: string;
          helpText?: string;
          userInput: string;
          isCorrect: boolean;
          createdAt: Date | string | number;
          isUnanswered?: boolean;
        }>
      | undefined;

    if (code) {
      type UsecaseSolve = {
        id: number;
        questionId: number;
        question: string;
        answer: string;
        helpText?: string;
        userInput: string;
        isCorrect: boolean;
        createdAt: Date;
        unitCode: string;
      };
      const questions = await prisma.unitQuestion.findMany({
        where: { unitCode: code },
        orderBy: { id: 'asc' },
        select: { id: true, question: true, answer: true, helpText: true },
      });

      const solveByQid = new Map<number, UsecaseSolve>(
        (result.solves as unknown as UsecaseSolve[]).map((s) => [
          s.questionId,
          s,
        ])
      );

      merged = questions.map((q) => {
        const s = solveByQid.get(q.id);
        if (s) {
          return {
            id: s.id,
            questionId: q.id,
            question: q.question,
            answer: q.answer,
            helpText: q.helpText ?? undefined,
            userInput: s.userInput,
            isCorrect: s.isCorrect,
            createdAt: s.createdAt,
          };
        }
        return {
          id: q.id, // 미응시는 문제 ID를 그대로 사용하여 음수 ID 사용 제거
          questionId: q.id,
          question: q.question,
          answer: q.answer,
          helpText: q.helpText ?? undefined,
          userInput: '',
          isCorrect: false, // 통계상 오답 처리
          createdAt: new Date(),
          isUnanswered: true,
        };
      });
    }

    return NextResponse.json({
      success: true,
      solves: merged ?? result.solves,
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
