import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/libs/prisma';

// DELETE /api/admin/unit-exam-codes/[code]
// - 단원평가 코드와 해당 코드로 생성된 문제를 삭제
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { code } = await ctx.params;
    const unitCode = code?.toString().trim().toUpperCase();
    const codePattern = /^[A-Z]{6}(?:-(0[1-9]|[1-5][0-9]|60))?$/;
    if (!unitCode || !codePattern.test(unitCode)) {
      return NextResponse.json(
        { success: false, error: '유효한 코드가 아닙니다.' },
        { status: 400 }
      );
    }

    // 소유권 확인: 해당 교사의 코드인지 검증 (접미사 포함/미포함 모두 허용)
    let exam = await prisma.unitExam.findUnique({
      where: { code: unitCode },
      select: { id: true, code: true, teacherId: true },
    });
    if (!exam && unitCode.includes('-')) {
      const base = unitCode.slice(0, 6);
      exam = await prisma.unitExam.findUnique({
        where: { code: base },
        select: { id: true, code: true, teacherId: true },
      });
    }
    if (!exam || exam.teacherId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 응시 시도 내역이 존재하면 삭제 불가
    const attemptsCount = await prisma.unitExamAttempt.count({
      where: { unitExamId: exam.id },
    });
    if (attemptsCount > 0) {
      return NextResponse.json(
        { success: false, error: '응시 내역이 있어 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 이미 응시(UnitSolve)가 존재하면 삭제 불가
    const baseForCheck = unitCode.slice(0, 6);
    const solvesCount = await prisma.unitSolve.count({
      where: { question: { unitCode: { in: [exam.code, baseForCheck] } } },
    });
    if (solvesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            '이미 응시한 내역이 있어 삭제할 수 없습니다. 응시 기록이 존재합니다.',
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.unitQuestion.deleteMany({
        where: { unitCode: { in: [exam.code, baseForCheck] } },
      }),
      prisma.unitExam.delete({ where: { code: exam.code } }),
    ]);

    return NextResponse.json({ success: true, code: exam.code });
  } catch (error) {
    console.error('[DELETE /api/admin/unit-exam-codes/[code]] error:', error);
    return NextResponse.json(
      { success: false, error: '삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET /api/admin/unit-exam-codes/[code]
// - 단원평가 코드의 문제/정답 목록 조회 (관리자/해당 교사만)
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { code } = await ctx.params;
    const unitCode = code?.toString().trim().toUpperCase();
    const codePattern = /^[A-Z]{6}(?:-(0[1-9]|[1-5][0-9]|60))?$/;
    if (!unitCode || !codePattern.test(unitCode)) {
      return NextResponse.json(
        { success: false, error: '유효한 코드가 아닙니다.' },
        { status: 400 }
      );
    }

    // 소유권 검증
    const exam = await prisma.unitExam.findUnique({
      where: { code: unitCode },
    });
    if (!exam || exam.teacherId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '조회 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 전체 코드 우선 조회, 없으면 6자리 기본 코드로 조회
    let rows = await prisma.unitQuestion.findMany({
      where: { unitCode: unitCode },
      select: { id: true, question: true, answer: true, helpText: true },
      orderBy: { id: 'asc' },
    });
    if (!rows || rows.length === 0) {
      const base = unitCode.slice(0, 6);
      rows = await prisma.unitQuestion.findMany({
        where: { unitCode: base },
        select: { id: true, question: true, answer: true, helpText: true },
        orderBy: { id: 'asc' },
      });
    }

    return NextResponse.json({ success: true, data: { problems: rows } });
  } catch (e) {
    console.error('[GET /api/admin/unit-exam-codes/[code]] error:', e);
    return NextResponse.json(
      { success: false, error: '문제 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
