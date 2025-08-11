import { NextRequest, NextResponse } from 'next/server';
import { UpdateSolveBody } from '@/libs/zod/solves';
import { auth } from '@/auth';
import { ZodError } from 'zod';
import { UpdateSolveUseCase } from '@/backend/solves/usecases/SolvesUseCases';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { UpdateSolveRequestDto } from '@/backend/solves/dtos/SolveDto';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate ID parameter
    const routeParams = await params;
    const id = parseInt(routeParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID', message: 'ID must be a valid number' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON', message: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    const validated = UpdateSolveBody.parse(body);

    // Create request DTO
    const request: UpdateSolveRequestDto = {
      id,
      userId: session.user.id,
      userInput: validated.userInput,
    };

    // Execute use case
    const repository = new PrSolveRepository();
    const useCase = new UpdateSolveUseCase(repository);
    const result = await useCase.execute(request);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating solve:', error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          message: error.issues.map((e) => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    // Handle specific business logic errors
    if (error instanceof Error) {
      if (error.message === 'Solve not found') {
        return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
      }
    }

    // Handle unhandled errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
