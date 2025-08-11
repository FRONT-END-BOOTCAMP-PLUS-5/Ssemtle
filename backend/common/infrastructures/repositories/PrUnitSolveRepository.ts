// ABOUTME: Prisma를 사용한 UnitSolve Repository 구현체
import { PrismaClient } from '@prisma/client';
import {
  CreateUnitSolveData,
  IUnitSolveRepository,
} from '../../domains/repositories/IUnitSolveRepository';

export class PrUnitSolveRepository implements IUnitSolveRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createMany(data: CreateUnitSolveData[]): Promise<number> {
    try {
      if (data.length === 0) return 0;
      const result = await this.prisma.unitSolve.createMany({ data });
      return result.count;
    } catch (error) {
      console.error('UnitSolve 일괄 생성 오류:', error);
      throw new Error('단원평가 답안 저장에 실패했습니다.');
    }
  }
}
