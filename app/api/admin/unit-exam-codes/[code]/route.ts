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
    if (!unitCode || unitCode.length !== 6) {
      return NextResponse.json(
        { success: false, error: '유효한 코드가 아닙니다.' },
        { status: 400 }
      );
    }

    // 소유권 확인: 해당 교사의 코드인지 검증
    const exam = await prisma.unitExam.findUnique({
      where: { code: unitCode },
      select: { teacherId: true },
    });
    if (!exam || exam.teacherId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.unitQuestion.deleteMany({ where: { unitCode: unitCode } }),
      prisma.unitExam.delete({ where: { code: unitCode } }),
    ]);

    return NextResponse.json({ success: true, code: unitCode });
  } catch (error) {
    console.error('[DELETE /api/admin/unit-exam-codes/[code]] error:', error);
    return NextResponse.json(
      { success: false, error: '삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
