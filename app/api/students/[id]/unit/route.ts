// app/api/students/[id]/unit/route.ts
import { NextResponse } from 'next/server';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { GetStudentUnitPerformanceUseCase } from '@/backend/analysis/usecases/GetStudentUnitPerformanceUseCase';
import prisma from '@/libs/prisma';

const useCase = new GetStudentUnitPerformanceUseCase(new PrSolveRepository());

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: username } = await params;
  if (!username || username.trim() === '') {
    return NextResponse.json(
      { error: 'username is required' },
      { status: 400 }
    );
  }

  // 1) username → uuid 변환
  const user = await prisma.user.findUnique({
    where: { userId: username },
    select: { id: true }, // UUID
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const url = new URL(_req.url);
  const from = url.searchParams.get('from') ?? undefined;
  const to = url.searchParams.get('to') ?? undefined;

  // 2) UUID로 UseCase 실행
  try {
    const result = await useCase.execute({ userId: user.id, from, to });
    return NextResponse.json(result, { status: 200 });
  } catch (e: unknown) {
    console.error('[GET /api/students/[id]/unit] error:', e);
    const message = e instanceof Error ? e.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
