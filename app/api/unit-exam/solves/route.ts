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
          questionId: number;
          question: string;
          answer: string;
          helpText?: string;
          userInput: string;
          isCorrect: boolean;
          createdAt: Date | string | number;
          isUnanswered?: boolean;
          unitCode: string;
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
      // 사용자가 전달한 code가 전체코드가 아닐 수 있어, 시도 기록을 통해 실제 단원 코드로 보정
      let unitCodeForQuestions = code;
      let questions = await prisma.unitQuestion.findMany({
        where: { unitCode: unitCodeForQuestions },
        orderBy: { id: 'asc' },
        select: { id: true, question: true, answer: true, helpText: true },
      });

      if (questions.length === 0 && base) {
        const attempt = await prisma.unitExamAttempt.findFirst({
          where: {
            studentId: targetUserId,
            unitCode: { startsWith: base },
          },
          orderBy: { id: 'desc' },
          select: { unitCode: true },
        });
        if (attempt?.unitCode) {
          unitCodeForQuestions = attempt.unitCode;
          questions = await prisma.unitQuestion.findMany({
            where: { unitCode: unitCodeForQuestions },
            orderBy: { id: 'asc' },
            select: { id: true, question: true, answer: true, helpText: true },
          });
        }
      }

      const solveByQid = new Map<number, UsecaseSolve>(
        (result.solves as unknown as UsecaseSolve[]).map((s) => [
          s.questionId,
          s,
        ])
      );

      // 응시 시각(문자열) 조회
      const attemptExact = await prisma.unitExamAttempt.findFirst({
        where: { studentId: targetUserId, unitCode: unitCodeForQuestions },
        orderBy: { id: 'desc' },
        select: { createdAt: true },
      });
      const attemptTimeForCode = attemptExact?.createdAt
        ? new Date(attemptExact.createdAt)
        : undefined;

      const formatAttemptTime = (d: Date) => {
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        const ss = pad(d.getSeconds());
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
      };

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
            unitCode: unitCodeForQuestions,
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
          createdAt: attemptTimeForCode
            ? formatAttemptTime(attemptTimeForCode)
            : new Date(),
          isUnanswered: true,
          unitCode: unitCodeForQuestions,
        };
      });
    }

    // code 없이 조회하는 경우: 응시 기록이 있는 모든 코드에 대해
    // - solves가 존재하는 코드는 그대로 유지
    // - solves가 없는 코드는 미응시 항목으로 구성하여 추가
    if (!code) {
      const attempts = await prisma.unitExamAttempt.findMany({
        where: { studentId: targetUserId },
        orderBy: { id: 'desc' },
        select: { unitCode: true, createdAt: true },
      });

      const attemptCodes = Array.from(
        new Set(attempts.map((a) => a.unitCode).filter(Boolean))
      );

      const presentCodes = new Set<string>(
        Array.isArray(result.solves)
          ? (result.solves as Array<{ unitCode?: string }>)
              .map((s) => (s.unitCode || '').toString())
              .filter((c) => c)
          : []
      );

      const missingCodes = attemptCodes.filter((c) => !presentCodes.has(c));

      const fallbackSolves: Array<{
        id: number;
        questionId: number;
        question: string;
        answer: string;
        helpText?: string;
        userInput: string;
        isCorrect: boolean;
        createdAt: Date | string;
        isUnanswered: boolean;
        unitCode: string;
      }> = [];

      // 코드별 응시 시각 문자열 구성
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
          d.getHours()
        )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

      const codeToTime = new Map<string, string>();
      for (const a of attempts) {
        if (a.unitCode)
          codeToTime.set(
            a.unitCode,
            fmt(new Date(a.createdAt as unknown as Date))
          );
      }

      for (const unitCode of missingCodes) {
        const qs = await prisma.unitQuestion.findMany({
          where: { unitCode },
          orderBy: { id: 'asc' },
          select: { id: true, question: true, answer: true, helpText: true },
        });
        for (const q of qs) {
          fallbackSolves.push({
            id: q.id,
            questionId: q.id,
            question: q.question,
            answer: q.answer,
            helpText: q.helpText ?? undefined,
            userInput: '',
            isCorrect: false,
            createdAt: codeToTime.get(unitCode) ?? new Date(),
            isUnanswered: true,
            unitCode,
          });
        }
      }

      const existingSolves: Array<{
        id: number;
        questionId: number;
        question: string;
        answer: string;
        helpText?: string;
        userInput: string;
        isCorrect: boolean;
        createdAt: Date | string | number;
        unitCode?: string;
        isUnanswered?: boolean;
      }> = Array.isArray(result.solves)
        ? (result.solves as unknown as Array<{
            id: number;
            questionId: number;
            question: string;
            answer: string;
            helpText?: string;
            userInput: string;
            isCorrect: boolean;
            createdAt: Date | string | number;
            unitCode?: string;
            isUnanswered?: boolean;
          }>)
        : [];

      return NextResponse.json({
        success: true,
        solves: [...existingSolves, ...fallbackSolves],
        codeExists,
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
