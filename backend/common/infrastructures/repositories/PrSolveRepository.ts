// infrastructure/repositories/PrSolveRepository.ts
import { Solve } from '@/backend/common/domains/entities/Solve';
import prisma from '@/libs/prisma';
import { SolveRepository } from '@/backend/common/domains/repositories/SolveRepository';

export class PrSolveRepository implements SolveRepository {
  async create(solve: Omit<Solve, 'id' | 'createdAt'>): Promise<Solve> {
    const saved = await prisma.solve.create({
      data: {
        ...solve,
      },
    });
    return saved;
  }
}
