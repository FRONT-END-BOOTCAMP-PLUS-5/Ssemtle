export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { CreateUnitUseCase } from '@/backend/unit/UseCases/UnitCreateUseCase';
import { UnitSelectUseCase } from '@/backend/unit/UseCases/UnitSelectUseCase';
import { prUnitRepository } from '@/backend/common/infrastructures/repositories/prUnitRepository';
import { CreateUnitRequestDto } from '@/backend/unit/dtos/UnitDto';
import prisma from '@/libs/prisma';

// Unit 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateUnitRequestDto = await request.json();

    const unitRepository = new prUnitRepository(prisma);
    const createUnitUseCase = new CreateUnitUseCase(unitRepository);

    const unit = await createUnitUseCase.execute(body);

    return NextResponse.json(
      {
        message: '수학 단원이 성공적으로 생성되었습니다.',
        unit: unit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unit creation error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}

// Unit 목록 조회
export async function GET(request: NextRequest) {
  try {
    const unitRepository = new prUnitRepository(prisma);
    const unitSelectUseCase = new UnitSelectUseCase(unitRepository);

    const result = await unitSelectUseCase.getAllUnits();

    return NextResponse.json({
      message: '단원 목록 조회가 완료되었습니다.',
      data: result,
    });
  } catch (error) {
    console.error('Unit list error:', error);

    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
