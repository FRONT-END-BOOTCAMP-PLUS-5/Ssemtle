// app/api/students/[id]/unit/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';

import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { PrUnitRepository } from '@/backend/common/infrastructures/repositories/PrUnitRepository';
import { GetStudentUnitPerformanceUseCase } from '@/backend/analysis/usecases/GetStudentUnitPerformanceUsecase';

const useCase = new GetStudentUnitPerformanceUseCase(
  new PrSolveRepository(),
  new PrUnitRepository(prisma) // ✅ prisma 주입
);

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: username } = await context.params;

  if (!username || username.trim() === '') {
    return NextResponse.json(
      { error: 'username is required' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { userId: username },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get('from') ?? undefined;
  const to = url.searchParams.get('to') ?? undefined;

  try {
    const result = await useCase.execute({ userId: user.id, from, to });
    return NextResponse.json(result, { status: 200 });
  } catch (e: unknown) {
    console.error('[GET /api/students/[id]/unit] error:', e);
    const message = e instanceof Error ? e.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
