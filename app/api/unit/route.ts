export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import {
  CreateUnitUseCase,
  ListUnitsUseCase,
} from '@/backend/unit/usecases/UnitUseCase';
import { PrUnitRepository } from '@/backend/common/infrastructures/repositories/PrUnitRepository';
import { CreateUnitRequestDto } from '@/backend/unit/dtos/UnitDto';
import prisma from '@/libs/prisma';

export async function GET() {
  try {
    const unitRepository = new PrUnitRepository(prisma);
    const listUnitsUseCase = new ListUnitsUseCase(unitRepository);
    const units = await listUnitsUseCase.execute();

    return NextResponse.json({ units }, { status: 200 });
  } catch (error) {
    console.error('Unit list fetch error:', error);
    return NextResponse.json(
      { error: '단원 목록을 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUnitRequestDto = await request.json();

    const unitRepository = new PrUnitRepository(prisma);
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
