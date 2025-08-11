import { PrismaClient } from '@prisma/client';
import { Unit } from '../../domains/entities/Unit';
import { IAdminUnitRepository } from '../../domains/repositories/IAdminUnitRepository';

export class prAdminUnitRepository implements IAdminUnitRepository {
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
    const unitToDelete = await this.prisma.unit.findUnique({
      where: { id },
    });

    if (!unitToDelete) {
      throw new Error('삭제할 단원을 찾을 수 없습니다.');
    }

    // Unit 삭제 (Cascade Delete가 관련 데이터 자동 삭제)
    await this.prisma.unit.delete({
      where: { id },
    });

    return this.mapToUnit(unitToDelete);
  }

  // 특정 단원의 vidUrl만 조회
  async findVidUrlById(
    id: number
  ): Promise<{ id: number; vidUrl: string } | null> {
    try {
      const unit = await this.prisma.unit.findUnique({
        where: { id },
        select: {
          id: true,
          vidUrl: true,
        },
      });

      return unit;
    } catch (error) {
      console.error('Unit vidUrl 조회 실패', { id, error });
      throw new Error('단원 영상 URL을 조회하는 중 오류가 발생했습니다.');
    }
  }
}
