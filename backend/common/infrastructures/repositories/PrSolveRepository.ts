// infrastructure/repositories/PrSolveRepository.ts
import { Solve } from '@/backend/common/domains/entities/Solve';
import prisma from '@/libs/prisma';
import {
  SolveAggregationFilter,
  SolveByUnitRow,
  ISolveRepository,
  PaginatedResult,
  PaginationParams,
  UnitStatsResult,
  SolveSample,
} from '@/backend/common/domains/repositories/SolveRepository';
import { Prisma } from '@prisma/client';

export class PrSolveRepository implements ISolveRepository {
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

  async findAll(): Promise<Solve[]> {
    return await prisma.solve.findMany();
  }

  async findById(id: number): Promise<Solve | null> {
    return await prisma.solve.findUnique({
      where: { id },
    });
  }

  async findByIdAndUserId(id: number, userId: string): Promise<Solve | null> {
    return await prisma.solve.findFirst({
      where: { id, userId },
    });
  }

  async update(id: number, solve: Partial<Solve>): Promise<Solve> {
    const { unit, user, ...data } = solve; // ❗ unit, user 제외
    void unit;
    void user;

    return await prisma.solve.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.solve.delete({
      where: { id },
    });
  }

  async findPaginated(
    params: PaginationParams
  ): Promise<PaginatedResult<Solve & { unit: { name: string } }>> {
    const where: Prisma.SolveWhereInput = {
      userId: params.userId,
    };

    // Date range filtering
    if (params.filters.createdAt) {
      where.createdAt = {};
      if (params.filters.createdAt.gte) {
        where.createdAt.gte = params.filters.createdAt.gte;
      }
      if (params.filters.createdAt.lte) {
        where.createdAt.lte = params.filters.createdAt.lte;
      }
    }

    // Filter for correctness
    if (params.filters.isCorrect !== undefined) {
      where.isCorrect = params.filters.isCorrect;
    }

    // Determine sort order based on sortDirection and direction
    const sortDirection = params.sortDirection || 'newest';
    const direction = params.direction || 'next';

    // For bidirectional pagination:
    // - newest + next: DESC (default behavior)
    // - newest + prev: ASC (reverse to get newer items)
    // - oldest + next: ASC (reverse to get older items)
    // - oldest + prev: DESC (reverse to get newer items)

    let orderBy: Prisma.SolveOrderByWithRelationInput[];
    let cursorOperator: 'lt' | 'gt';

    if (sortDirection === 'newest') {
      if (direction === 'next') {
        orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
        cursorOperator = 'lt';
      } else {
        orderBy = [{ createdAt: 'asc' }, { id: 'asc' }];
        cursorOperator = 'gt';
      }
    } else {
      if (direction === 'next') {
        orderBy = [{ createdAt: 'asc' }, { id: 'asc' }];
        cursorOperator = 'gt';
      } else {
        orderBy = [{ createdAt: 'desc' }, { id: 'desc' }];
        cursorOperator = 'lt';
      }
    }

    // Cursor pagination
    if (params.filters.cursor) {
      const cursor = params.filters.cursor;
      const cursorDate = new Date(cursor.t);

      where.OR = [
        {
          createdAt: { [cursorOperator]: cursorDate },
        },
        {
          createdAt: cursorDate,
          id: { [cursorOperator]: cursor.id },
        },
      ];
    }

    let items = await prisma.solve.findMany({
      where,
      orderBy,
      take: params.limit,
      include: {
        unit: {
          select: {
            name: true,
          },
        },
      },
    });

    // For reverse queries, we need to reverse the result to maintain proper order
    if (
      (sortDirection === 'newest' && direction === 'prev') ||
      (sortDirection === 'oldest' && direction === 'prev')
    ) {
      items = items.reverse();
    }

    return {
      items: items as (Solve & { unit: { name: string } })[],
      hasMore: items.length === params.limit,
    };
  }

  async countByUnitAndCorrectness(
    userId: string,
    dateFilter?: { gte?: Date; lte?: Date }
  ): Promise<UnitStatsResult[]> {
    const baseWhere: Prisma.SolveWhereInput = {
      userId,
    };

    if (dateFilter) {
      baseWhere.createdAt = {};
      if (dateFilter.gte) {
        baseWhere.createdAt.gte = dateFilter.gte;
      }
      if (dateFilter.lte) {
        baseWhere.createdAt.lte = dateFilter.lte;
      }
    }

    // Get total counts by unit
    const [unitTotals, unitCorrectTotals] = await Promise.all([
      prisma.solve.groupBy({
        by: ['unitId'],
        where: baseWhere,
        _count: { _all: true },
      }),
      prisma.solve.groupBy({
        by: ['unitId'],
        where: { ...baseWhere, isCorrect: true },
        _count: { _all: true },
      }),
    ]);

    // Get all units for name mapping
    const units = await prisma.unit.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const unitMap = new Map(units.map((u) => [u.id, u.name]));
    const correctMap = new Map(
      unitCorrectTotals.map((u) => [u.unitId, u._count._all])
    );

    return unitTotals.map((stat) => ({
      unitId: stat.unitId,
      unitName: unitMap.get(stat.unitId) || `Unit ${stat.unitId}`,
      total: stat._count._all,
      correct: correctMap.get(stat.unitId) ?? 0,
    }));
  }

  async findRecentSamplesByUnit(
    unitId: number,
    userId: string,
    limit: number,
    dateFilter?: { gte?: Date; lte?: Date }
  ): Promise<SolveSample[]> {
    const where: Prisma.SolveWhereInput = {
      userId,
      unitId,
    };

    if (dateFilter) {
      where.createdAt = {};
      if (dateFilter.gte) {
        where.createdAt.gte = dateFilter.gte;
      }
      if (dateFilter.lte) {
        where.createdAt.lte = dateFilter.lte;
      }
    }

    const samples = await prisma.solve.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      select: {
        id: true,
        question: true,
        isCorrect: true,
        createdAt: true,
      },
    });

    return samples;
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
