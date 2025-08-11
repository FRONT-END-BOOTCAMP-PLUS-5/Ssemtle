import { NextRequest, NextResponse } from 'next/server';
import { UnitsSummaryQuery } from '@/libs/zod/solves';
import { auth } from '@/auth';
import { ZodError } from 'zod';
import { GetUnitsSummaryUseCase } from '@/backend/solves/usecases/SolvesUsecases';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { UnitsSummaryRequestDto } from '@/backend/solves/dtos/SolveDto';

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
      limitPerUnit: parseInt(searchParams.get('limitPerUnit') || '3'),
    };

    const validated = UnitsSummaryQuery.parse(queryParams);

    // Create request DTO
    const request: UnitsSummaryRequestDto = {
      userId: session.user.id,
      from: validated.from,
      to: validated.to,
      limitPerUnit: validated.limitPerUnit,
    };

    // Execute use case
    const repository = new PrSolveRepository();
    const useCase = new GetUnitsSummaryUseCase(repository);
    const result = await useCase.execute(request);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting unit summary:', error);

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
