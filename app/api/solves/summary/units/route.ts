import { NextRequest, NextResponse } from 'next/server';
import { UnitsSummaryQuery } from '@/libs/zod/solves';
import { auth } from '@/auth';
import prisma from '@/libs/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      limitPerUnit: parseInt(searchParams.get('limitPerUnit') || '3'),
    };

    const validated = UnitsSummaryQuery.parse(queryParams);

    // Build base where clause for date filtering
    const dateWhere: Prisma.SolveWhereInput = {
      userId: session.user.id,
    };

    if (validated.from || validated.to) {
      dateWhere.createdAt = {};
      if (validated.from) {
        dateWhere.createdAt.gte = new Date(validated.from);
      }
      if (validated.to) {
        dateWhere.createdAt.lte = new Date(validated.to);
      }
    }

    // Get aggregated stats per unit using Prisma aggregation
    const unitStats = await prisma.solve.groupBy({
      by: ['unitId'],
      where: dateWhere,
      _count: {
        _all: true,
      },
      _sum: {
        isCorrect: true,
      },
    });

    // Get all units for name mapping
    const units = await prisma.unit.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const unitMap = new Map(units.map((u) => [u.id, u.name]));

    // Get recent samples for each unit
    const unitsWithSamples = await Promise.all(
      unitStats.map(async (stat) => {
        // Get recent samples for this unit
        const samples = await prisma.solve.findMany({
          where: {
            ...dateWhere,
            unitId: stat.unitId,
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: validated.limitPerUnit,
          select: {
            id: true,
            question: true,
            isCorrect: true,
            createdAt: true,
          },
        });

        const total = stat._count._all;
        const correct = stat._sum.isCorrect || 0;
        const accuracy = total > 0 ? correct / total : 0;

        return {
          unitId: stat.unitId,
          title: unitMap.get(stat.unitId) || `Unit ${stat.unitId}`,
          total,
          correct,
          accuracy,
          samples,
        };
      })
    );

    // Sort by unit name for consistent ordering
    unitsWithSamples.sort((a, b) => a.title.localeCompare(b.title, 'ko'));

    return NextResponse.json(unitsWithSamples);
  } catch (error) {
    console.error('Error getting unit summary:', error);

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
