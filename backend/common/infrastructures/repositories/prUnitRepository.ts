import { PrismaClient } from '@prisma/client';
import { Unit } from '../../domains/entities/Unit';
import { IUnitRepository } from '../../domains/repositories/IUnitRepository';

export class prUnitRepository implements IUnitRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private mapToUnit(unit: Unit): Unit {
    return {
      id: unit.id,
      name: unit.name,
      vidUrl: unit.vidUrl,
      createdAt: unit.createdAt,
    };
  }

  // 단원 생성
  async create(unitData: { name: string; vidUrl: string }): Promise<Unit> {
    const unit = await this.prisma.unit.create({
      data: {
        name: unitData.name,
        vidUrl: unitData.vidUrl,
      },
    });

    return this.mapToUnit(unit);
  }

  // 단원 목록 조회
  async findAll(): Promise<Unit[]> {
    const units = await this.prisma.unit.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return units.map((unit) => this.mapToUnit(unit));
  }

  // 단원 업데이트
  async update(
    id: number,
    unitData: { name?: string; vidUrl?: string }
  ): Promise<Unit> {
    const unit = await this.prisma.unit.update({
      where: { id },
      data: unitData,
    });

    return this.mapToUnit(unit);
  }

  async findById(id: number): Promise<Unit | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
    });

    return unit ? this.mapToUnit(unit) : null;
  }

  // 단원 삭제
  async delete(id: number): Promise<Unit> {
    const unit = await this.prisma.unit.delete({
      where: { id },
    });

    return this.mapToUnit(unit);
  }
}
