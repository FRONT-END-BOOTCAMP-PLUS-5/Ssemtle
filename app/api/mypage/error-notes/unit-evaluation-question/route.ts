export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import prisma from '@/libs/prisma';
import { PrUnitSolveRepository } from '@/backend/common/infrastructures/repositories/PrUnitSolveRepository';
import { GetUnitEvalErrorNotesUsecase } from '@/backend/mypage-error-notes/usecases/GetUnitEvalErrorNotesUsecase';

const QuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/g, '날짜 형식은 YYYY-MM-DD 이어야 합니다.')
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || undefined;
    const { date: validatedDate } = QuerySchema.parse({ date });

    console.log('[UnitEvalErrorNotes][API] session user id', session.user.id);
    console.log('[UnitEvalErrorNotes][API] date', validatedDate ?? '(전체)');

    const unitSolveRepo = new PrUnitSolveRepository(prisma);
    const usecase = new GetUnitEvalErrorNotesUsecase(unitSolveRepo);
    const result = await usecase.execute({
      userId: session.user.id,
      date: validatedDate,
    });

    console.log('[UnitEvalErrorNotes][API] result', JSON.stringify(result));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[UnitEvalErrorNotes][API] 오류', error);
    if (error instanceof Error && error.message.includes('날짜')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: '오답 노트(단원평가) 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
