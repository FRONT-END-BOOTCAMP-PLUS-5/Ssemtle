import { NextRequest, NextResponse } from 'next/server';
import { CategoryStatsQuery } from '@/libs/zod/solves';
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
    };

    const validated = CategoryStatsQuery.parse(queryParams);

    // Build where clause for date filtering
    const where: Prisma.SolveWhereInput = {
      userId: session.user.id,
    };

    if (validated.from || validated.to) {
      where.createdAt = {};
      if (validated.from) {
        where.createdAt.gte = new Date(validated.from);
      }
      if (validated.to) {
        where.createdAt.lte = new Date(validated.to);
      }
    }

    // Get aggregated stats per unit using Prisma groupBy
    const unitStats = await prisma.solve.groupBy({
      by: ['unitId'],
      where,
      _count: {
        _all: true,
      },
      _sum: {
        isCorrect: true,
      },
    });

    // Get all units for category name mapping
    const units = await prisma.unit.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const unitMap = new Map(units.map((u) => [u.id, u.name]));

    // Transform and calculate accuracy
    const transformedStats = unitStats.map((stat) => {
      const total = stat._count._all;
      const correct = stat._sum.isCorrect || 0;
      const accuracy = total > 0 ? correct / total : 0;

      return {
        category: unitMap.get(stat.unitId) || `Unit ${stat.unitId}`,
        total,
        correct,
        accuracy,
      };
    });

    // Sort by category name for consistent ordering
    transformedStats.sort((a, b) => a.category.localeCompare(b.category, 'ko'));

    return NextResponse.json(transformedStats);
  } catch (error) {
    console.error('Error getting category stats:', error);

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
