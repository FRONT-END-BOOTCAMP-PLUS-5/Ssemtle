import { NextRequest, NextResponse } from 'next/server';
import { CalendarSolvesQuery } from '@/libs/zod/solves';
import { ZodError } from 'zod';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { CalendarSolvesRequestDto } from '@/backend/solves/dtos/SolveDto';
import { GetCalendarSolvesUseCase } from '@/backend/solves/usecases/SolvesUsecases';
import { PrUserRepository } from '@/backend/common/infrastructures/repositories/PrUserRepository';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      month: searchParams.get('month') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      only: searchParams.get('only') || 'all',
    };

    const validated = CalendarSolvesQuery.parse(queryParams);

    const userRepo = new PrUserRepository();
    const user = await userRepo.findByUserId(id); // user.userId == 슬러그
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create request DTO
    const request: CalendarSolvesRequestDto = {
      userId: user.id,
      month: validated.month,
      from: validated.from,
      to: validated.to,
      only: validated.only as 'all' | 'wrong',
    };

    // Execute use case
    const repository = new PrSolveRepository();
    const useCase = new GetCalendarSolvesUseCase(repository);
    const result = await useCase.execute(request);
    console.log('[calendar:user]', { slug: id, internalId: user.id, result });
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
