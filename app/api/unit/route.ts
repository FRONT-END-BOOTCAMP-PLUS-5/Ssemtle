import { NextRequest, NextResponse } from 'next/server';
import { CreateUnitUseCase } from '@/backend/unit/UseCases/UnitCreateUseCase';
import { UnitSelectUseCase } from '@/backend/unit/UseCases/UnitSelectUseCase';
import { UnitUpdateUseCase } from '@/backend/unit/UseCases/UnitUpdateUseCase';
import { UnitDeleteUseCase } from '@/backend/unit/UseCases/UnitDeleteUseCase';
import { prUnitRepository } from '@/backend/common/infrastructures/repositories/prUnitRepository';
import { UnitDto } from '@/backend/unit/dtos/UnitDto';
import { Unit } from '@/backend/common/domains/entities/Unit';
import prisma from '@/libs/prisma';


const mapToDto = (unit: Unit): UnitDto => ({
  id: unit.id,
  name: unit.name,
  vidUrl: unit.vidUrl,
  createdAt: unit.createdAt,
});

// Unit 생성
export async function POST(request: NextRequest) {
  try {
    const body: UnitDto = await request.json();
    const unitRepository = new prUnitRepository(prisma);
    const createUnitUseCase = new CreateUnitUseCase(unitRepository);
    
    const unit = await createUnitUseCase.execute(body);
    const unitDto = mapToDto(unit);

    return NextResponse.json({
      message: '수학 단원이 성공적으로 생성되었습니다.',
      data: unitDto,
    }, { status: 201 });
  } catch (error) {
    console.error('Unit creation error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 400 });
  }
}

// Unit 목록 조회
export async function GET() {
  try {
    const unitRepository = new prUnitRepository(prisma);
    const unitSelectUseCase = new UnitSelectUseCase(unitRepository);
    
    const result = await unitSelectUseCase.getAllUnits();
    const units = result.units.map(mapToDto);

    return NextResponse.json({
      message: '단원 목록 조회가 완료되었습니다.',
      data: { units, total: result.total },
    });
  } catch (error) {
    console.error('Unit list error:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Unit 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body: UnitDto = await request.json();
    const unitRepository = new prUnitRepository(prisma);
    const updateUnitUseCase = new UnitUpdateUseCase(unitRepository);
    
    const { id, ...updateData } = body;
    const unit = await updateUnitUseCase.execute(id!, updateData);
    const unitDto = mapToDto(unit);

    return NextResponse.json({
      message: '수학 단원이 성공적으로 업데이트되었습니다.',
      data: unitDto,
    });
  } catch (error) {
    console.error('Unit update error:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// Unit 삭제
export async function DELETE(request: NextRequest) {
  try {
    const body: UnitDto = await request.json();
    const unitRepository = new prUnitRepository(prisma);
    const deleteUnitUseCase = new UnitDeleteUseCase(unitRepository);
    
    const unit = await deleteUnitUseCase.execute(body.id!);

    return NextResponse.json({
      message: `"${unit.name}" 단원이 성공적으로 삭제되었습니다.`,
      data: { id: unit.id, name: unit.name },
    });
  } catch (error) {
    console.error('Unit delete error:', error);
    const errorMessage = error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
