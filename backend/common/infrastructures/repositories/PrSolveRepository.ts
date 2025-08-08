// infrastructure/repositories/PrSolveRepository.ts
import { Solve } from '@/backend/common/domains/entities/Solve';
import prisma from '@/libs/prisma';
import { SolveRepository } from '@/backend/common/domains/repositories/SolveRepository';

export class PrSolveRepository implements SolveRepository {
  async create(solve: Omit<Solve, 'id' | 'createdAt'>): Promise<Solve> {
    const { unit, user, ...data } = solve; // ❗ unit, user 제외

    const saved = await prisma.solve.create({
      data, // ✅ 타입 오류 없이 안전하게 사용
    });

    return saved;
  }

  async findHelpTextById(
    solveId: number
  ): Promise<{ helpText: string } | null> {
    const res = await prisma.solve.findUnique({
      where: { id: solveId },
      select: { helpText: true },
    });
    return res; // { helpText } | null
  }
}
