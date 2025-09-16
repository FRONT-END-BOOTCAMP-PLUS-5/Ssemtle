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
  CalendarFilters,
  DaySolvesResult,
} from '@/backend/common/domains/repositories/SolveRepository';
import { Prisma } from '@/app/generated/prisma/client';

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
    const maxDayCompletionItems = 30; // Safety limit for day completion
    const originalLimit = params.limit;
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

    // Adaptive day completion logic
    let completedDay = false;
    let dayCompletionAdded = 0;
    const initialCount = items.length;

    // Only attempt day completion if we have items and haven't hit the safety limit
    if (items.length > 0 && items.length < maxDayCompletionItems) {
      const lastItem = items[items.length - 1];
      const lastItemDate = new Date(lastItem.createdAt);
      const lastItemDateString = lastItemDate.toDateString();

      // Check if we can complete the day by loading more items from the same day
      const dayCompletionWhere = { ...where };

      // Modify cursor condition to get remaining items from the same day
      if (params.filters.cursor) {
        // Update the cursor condition to continue from where we left off
        const cursor = params.filters.cursor;
        const cursorDate = new Date(cursor.t);

        dayCompletionWhere.OR = [
          {
            createdAt: { [cursorOperator]: cursorDate },
          },
          {
            createdAt: cursorDate,
            id: { [cursorOperator]: cursor.id },
          },
        ];
      }

      // Add date filter to only get items from the last day
      // Use specific date range for the last day instead of extending existing filters
      dayCompletionWhere.createdAt = {
        gte: new Date(lastItemDateString),
        lt: new Date(
          new Date(lastItemDateString).getTime() + 24 * 60 * 60 * 1000
        ), // Next day
      };

      // Load additional items for day completion
      const additionalItems = await prisma.solve.findMany({
        where: dayCompletionWhere,
        orderBy,
        take: maxDayCompletionItems - items.length, // Only load up to safety limit
        include: {
          unit: {
            select: {
              name: true,
            },
          },
        },
      });

      // Filter out items we already have (by ID)
      const existingIds = new Set(items.map((item) => item.id));
      const newItems = additionalItems.filter(
        (item) => !existingIds.has(item.id)
      );

      if (newItems.length > 0) {
        items.push(...newItems);
        dayCompletionAdded = newItems.length;
        completedDay = true;

        // Re-apply reverse if needed after adding items
        if (
          (sortDirection === 'newest' && direction === 'prev') ||
          (sortDirection === 'oldest' && direction === 'prev')
        ) {
          items = items.reverse();
        }
      }
    }

    return {
      items: items as (Solve & { unit: { name: string } })[],
      hasMore: initialCount === originalLimit, // Use original count for hasMore logic
      completedDay,
      batchInfo: {
        requestedLimit: originalLimit,
        actualCount: items.length,
        dayCompletionAdded,
      },
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

  async findByDateRangeForCalendar(
    filters: CalendarFilters
  ): Promise<DaySolvesResult[]> {
    const where: Prisma.SolveWhereInput = {
      userId: filters.userId,
      createdAt: {
        gte: filters.from,
        lte: filters.to,
      },
    };

    if (filters.isCorrect !== undefined) {
      where.isCorrect = filters.isCorrect;
    }

    // Get all solves in the date range
    const solves = await prisma.solve.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        unit: {
          select: {
            name: true,
          },
        },
      },
    });

    // Group by date (YYYY-MM-DD format)
    const groupedByDate = new Map<
      string,
      (Solve & { unit: { name: string } })[]
    >();

    for (const solve of solves) {
      const dateKey = solve.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }

      groupedByDate
        .get(dateKey)!
        .push(solve as Solve & { unit: { name: string } });
    }

    // Convert to DaySolvesResult format
    const result: DaySolvesResult[] = [];

    for (const [date, daySolves] of groupedByDate) {
      const correct = daySolves.filter((solve) => solve.isCorrect).length;
      const total = daySolves.length;

      result.push({
        date,
        total,
        correct,
        solves: daySolves,
      });
    }

    // Sort by date (newest first)
    result.sort((a, b) => b.date.localeCompare(a.date));

    return result;
  }
}
