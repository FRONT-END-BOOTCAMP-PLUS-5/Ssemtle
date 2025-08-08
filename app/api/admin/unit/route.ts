import { NextRequest, NextResponse } from 'next/server';
import { CreateUnitUseCase } from '@/backend/admin/unit/UseCases/UnitCreateUseCase';
import { UnitSelectUseCase } from '@/backend/admin/unit/UseCases/UnitSelectUseCase';
import { UnitUpdateUseCase } from '@/backend/admin/unit/UseCases/UnitUpdateUseCase';
import { UnitDeleteUseCase } from '@/backend/admin/unit/UseCases/UnitDeleteUseCase';
import { prUnitRepository } from '@/backend/common/infrastructures/repositories/prUnitRepository';
import prisma from '@/libs/prisma';

// Unit 생성
export async function POST(request: NextRequest) {
  try {
    const { name, vidUrl } = await request.json();

    const unitRepository = new prUnitRepository(prisma);
    const createUnitUseCase = new CreateUnitUseCase(unitRepository);

    const unit = await createUnitUseCase.execute({ name, vidUrl });

    return NextResponse.json(
      {
        message: '수학 단원이 성공적으로 생성되었습니다.',
        data: {
          id: unit.id,
          name: unit.name,
          vidUrl: unit.vidUrl,
          createdAt: unit.createdAt,
        },
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
export async function GET() {
  try {
    const unitRepository = new prUnitRepository(prisma);
    const unitSelectUseCase = new UnitSelectUseCase(unitRepository);

    const result = await unitSelectUseCase.getAllUnits();

    return NextResponse.json({
      message: '단원 목록 조회가 완료되었습니다.',
      data: {
        units: result.units.map((unit) => ({
          id: unit.id,
          name: unit.name,
          vidUrl: unit.vidUrl,
          createdAt: unit.createdAt,
        })),
        total: result.total,
      },
    });
  } catch (error) {
    console.error('Unit list error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Unit 업데이트
export async function PUT(request: NextRequest) {
  try {
    const { id, name, vidUrl } = await request.json();

    const unitRepository = new prUnitRepository(prisma);
    const updateUnitUseCase = new UnitUpdateUseCase(unitRepository);

    const unit = await updateUnitUseCase.execute(id, { name, vidUrl });

    return NextResponse.json({
      message: '수학 단원이 성공적으로 업데이트되었습니다.',
      data: {
        id: unit.id,
        name: unit.name,
        vidUrl: unit.vidUrl,
        createdAt: unit.createdAt,
      },
    });
  } catch (error) {
    console.error('Unit update error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// Unit 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    const unitRepository = new prUnitRepository(prisma);
    const deleteUnitUseCase = new UnitDeleteUseCase(unitRepository);

    const unit = await deleteUnitUseCase.execute(id);

    return NextResponse.json({
      message: `"${unit.name}" 단원이 성공적으로 삭제되었습니다.`,
      data: { id: unit.id, name: unit.name },
    });
  } catch (error) {
    console.error('Unit delete error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
