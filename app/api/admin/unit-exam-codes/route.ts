import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/libs/prisma';
import { Prisma } from '@prisma/client';

// GET /api/admin/unit-exam-codes
// 현재 로그인한 교사의 단원평가 코드 목록과 카테고리(단원명) 집계를 반환
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 하나의 쿼리로 안전하게 집계 (코드 → 단원명 목록)
    // 1) unit_exam에서 교사의 코드/생성일 목록 조회
    const exams = await prisma.unitExam.findMany({
      where: { teacherId: session.user.id },
      select: { code: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    // 2) 각 코드별로 unit_questions에서 unit_id 수집 (대소문자/공백 보정)
    type QRow = { unit_id: number; unit_code: string };
    const unitExams = [] as Array<{
      code: string;
      createdAt: Date;
      categories: string[];
      problemCount: number;
    }>;
    for (const e of exams) {
      const code = e.code;
      const qRows: QRow[] = await prisma.$queryRaw(
        Prisma.sql`SELECT unit_id, unit_code FROM unit_questions WHERE UPPER(TRIM(unit_code)) = ${code}`
      );

      const unitIds = Array.from(
        new Set(
          qRows.map((r) => Number(r.unit_id)).filter((n) => !Number.isNaN(n))
        )
      );

      let names: Array<{ id: number; name: string }> = [];
      if (unitIds.length > 0) {
        names = await prisma.unit.findMany({
          where: { id: { in: unitIds } },
          select: { id: true, name: true },
        });
      }

      const categories = names.map((n) => n.name).filter(Boolean);
      const problemCount = qRows.length;
      unitExams.push({
        code,
        createdAt: e.createdAt,
        categories,
        problemCount,
      });
    }

    return NextResponse.json({
      success: true,
      data: { unitExams, total: unitExams.length },
    });
  } catch (error) {
    console.error('[GET /api/admin/unit-exam-codes] error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
