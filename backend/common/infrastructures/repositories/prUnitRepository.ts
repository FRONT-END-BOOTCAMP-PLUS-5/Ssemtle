import { PrismaClient } from '@prisma/client';
import { Unit } from '../../domains/entities/Unit';
import { IUnitRepository } from '@/backend/common/domains/repositories/IUnitRepository';

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
      },
    });

    return {
      id: unit.id,
      name: unit.name,
      vidUrl: unit.vidUrl,
      createdAt: unit.createdAt,
    };
  }
}
