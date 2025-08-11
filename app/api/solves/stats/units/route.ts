import { NextRequest, NextResponse } from 'next/server';
import { CategoryStatsQuery } from '@/libs/zod/solves';
import { auth } from '@/auth';
import { ZodError } from 'zod';
import { GetCategoryStatsUseCase } from '@/backend/solves/usecases/SolvesUseCases';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { CategoryStatsRequestDto } from '@/backend/solves/dtos/SolveDto';

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
    };

    const validated = CategoryStatsQuery.parse(queryParams);

    // Create request DTO
    const request: CategoryStatsRequestDto = {
      userId: session.user.id,
      from: validated.from,
      to: validated.to,
    };

    // Execute use case
    const repository = new PrSolveRepository();
    const useCase = new GetCategoryStatsUseCase(repository);
    const result = await useCase.execute(request);

    // Transform to match existing API response format
    const transformedResult = result.map((stat) => ({
      category: stat.title,
      total: stat.total,
      correct: stat.correct,
      accuracy: stat.accuracy,
    }));

    return NextResponse.json(transformedResult);
  } catch (error) {
    console.error('Error getting category stats:', error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
