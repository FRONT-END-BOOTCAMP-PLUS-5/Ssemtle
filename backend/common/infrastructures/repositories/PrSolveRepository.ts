// infrastructure/repositories/PrSolveRepository.ts
import { Solve } from '@/backend/common/domains/entities/Solve';
import prisma from '@/libs/prisma';
import {
  SolveAggregationFilter,
  SolveByUnitRow,
  SolveRepository,
} from '@/backend/common/domains/repositories/SolveRepository';
import { Prisma } from '@prisma/client';

export class PrSolveRepository implements SolveRepository {
  async aggregateByUnit(
    filter: SolveAggregationFilter
  ): Promise<SolveByUnitRow[]> {
    const { userId, from, to } = filter;

    const whereBase: Prisma.SolveWhereInput = { userId };
    if (from || to) {
      whereBase.createdAt = {};
      if (from) whereBase.createdAt.gte = from;
      if (to) whereBase.createdAt.lte = to;
    }

    // 1) 전체 풀이수 by unitId
    const totals = await prisma.solve.groupBy({
      by: ['unitId'],
      where: whereBase,
      _count: { _all: true },
    });

    // 2) 정답수 by unitId
    const corrects = await prisma.solve.groupBy({
      by: ['unitId'],
      where: { ...whereBase, isCorrect: true },
      _count: { _all: true },
    });

    const correctMap = new Map<number, number>();
    for (const c of corrects) correctMap.set(c.unitId as number, c._count._all);

    const rows: SolveByUnitRow[] = totals.map((t) => ({
      unitId: t.unitId as number,
      total: t._count._all,
      correct: correctMap.get(t.unitId as number) ?? 0,
    }));

    // unitId 오름차순 정렬
    rows.sort((a, b) => a.unitId - b.unitId);
    return rows;
  }

  async create(solve: Omit<Solve, 'id' | 'createdAt'>): Promise<Solve> {
    const { unit, user, ...data } = solve; // ❗ unit, user 제외

    // @typescript-eslint/no-unused-vars 때문에 추가합니다
    void unit;
    void user;

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
