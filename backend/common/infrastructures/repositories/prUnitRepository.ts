import { PrismaClient } from '@prisma/client';
import { Unit } from '../../domains/entities/Unit';
import { IUnitRepository } from '../../domains/repositories/IUnitRepository';

export class prUnitRepository implements IUnitRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(unitData: {
    name: string;
    vidUrl: string;
    userId: string;
  }): Promise<Unit> {
    const unit = await this.prisma.unit.create({
      data: {
        name: unitData.name,
        vidUrl: unitData.vidUrl,
        userId: unitData.userId,
      },
    });

    return {
      id: unit.id,
      name: unit.name,
      vidUrl: unit.vidUrl,
      createdAt: unit.createdAt,
      userId: unit.userId,
    };
  }

  async findAll(): Promise<Unit[]> {
    const units = await this.prisma.unit.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      vidUrl: unit.vidUrl,
      createdAt: unit.createdAt,
      userId: unit.userId,
    }));
  }
}
