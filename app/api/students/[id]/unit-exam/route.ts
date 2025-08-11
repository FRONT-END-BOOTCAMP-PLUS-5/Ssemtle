// app/api/students/[id]/unit-exam/route.ts
import { NextResponse } from 'next/server';
import { PrUnitExamAnalysisRepository } from '@/backend/common/infrastructures/repositories/PrUnitExamAnalysisRepository';
import prisma from '@/libs/prisma';
import { GetStudentUnitExamAnalysisUseCase } from '@/backend/analysis/usecases/GetStudentUnitExamAnalysisUsecase';

const useCase = new GetStudentUnitExamAnalysisUseCase(
  new PrUnitExamAnalysisRepository()
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: username } = await params; // URL의 'donggyu'
    if (!username || username.trim() === '') {
      return NextResponse.json(
        { error: 'username is required' },
        { status: 400 }
      );
    }

    // 1) username → uuid 매핑
    const user = await prisma.user.findUnique({
      where: { userId: username }, // user.userId = 'donggyu'
      select: { id: true }, // 내부 UUID
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2) 쿼리 파라미터(from/to)
    const url = new URL(req.url);
    const from = url.searchParams.get('from') ?? undefined;
    const to = url.searchParams.get('to') ?? undefined;

    // 3) 내부는 uuid로 집계
    const result = await useCase.execute({
      userId: user.id,
      from,
      to,
    });
    console.log('✅ params.id:', user.id, '✅ username:', username);
    console.log('✅ query.from:', from, '✅ query.to:', to);

    // 4) 응답에 보여줄 studentId는 username으로 교체
    return NextResponse.json(
      { ...result, studentId: username },
      { status: 200 }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal Server Error';
    console.error('[GET /api/students/[id]/unit-exam] error:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
