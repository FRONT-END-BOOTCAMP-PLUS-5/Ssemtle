import { NextRequest, NextResponse } from 'next/server';
import { CalendarSolvesQuery } from '@/libs/zod/solves';
import { ZodError } from 'zod';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { CalendarSolvesRequestDto } from '@/backend/solves/dtos/SolveDto';
import { GetCalendarSolvesUseCase } from '@/backend/solves/usecases/SolvesUsecases';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ✅ [id] 슬러그 사용
) {
  try {
    // 1) 슬러그에서 userId 추출
    const { id } = await ctx.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // 2) 쿼리 파라미터 파싱
    const { searchParams } = new URL(req.url);
    const queryParams = {
      month: searchParams.get('month') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      only: searchParams.get('only') || 'all',
    };

    const validated = CalendarSolvesQuery.parse(queryParams);

    // 3) DTO 구성 (userId = 슬러그 id)
    const request: CalendarSolvesRequestDto = {
      userId: id,
      month: validated.month,
      from: validated.from,
      to: validated.to,
      only: validated.only as 'all' | 'wrong',
    };

    // 4) 유스케이스 실행
    const repository = new PrSolveRepository();
    const useCase = new GetCalendarSolvesUseCase(repository);
    const result = await useCase.execute(request);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching calendar solves:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
