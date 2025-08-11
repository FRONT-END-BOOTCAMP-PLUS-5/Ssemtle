import { NextRequest, NextResponse } from 'next/server';
import { ListSolvesQuery } from '@/libs/zod/solves';
import { auth } from '@/auth';
import { ZodError } from 'zod';
import { ListSolvesUseCase } from '@/backend/solves/usecases/SolvesUseCases';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { ListSolvesRequestDto } from '@/backend/solves/dtos/SolveDto';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      only: searchParams.get('only') || 'all',
      limit: parseInt(searchParams.get('limit') || '20'),
      cursor: searchParams.get('cursor') || undefined,
    };

    const validated = ListSolvesQuery.parse(queryParams);

    // Create request DTO
    const request: ListSolvesRequestDto = {
      userId: session.user.id,
      from: validated.from,
      to: validated.to,
      only: validated.only as 'all' | 'wrong',
      limit: validated.limit,
      cursor: validated.cursor,
    };

    // Execute use case
    const repository = new PrSolveRepository();
    const useCase = new ListSolvesUseCase(repository);
    const result = await useCase.execute(request);

    return NextResponse.json({
      items: result.items,
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    console.error('Error listing solves:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'Invalid cursor') {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
