import { NextRequest, NextResponse } from 'next/server';
import { ListSolvesQuery } from '@/libs/zod/solves';
import { decodeCursor, encodeCursor } from '@/libs/cursor';
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
      only: searchParams.get('only') || 'all',
      limit: parseInt(searchParams.get('limit') || '20'),
      cursor: searchParams.get('cursor') || undefined,
    };

    const validated = ListSolvesQuery.parse(queryParams);

    // Build where clause
    const where: Prisma.SolveWhereInput = {
      userId: session.user.id,
    };

    // Date range filtering
    if (validated.from || validated.to) {
      where.createdAt = {};
      if (validated.from) {
        where.createdAt.gte = new Date(validated.from);
      }
      if (validated.to) {
        where.createdAt.lte = new Date(validated.to);
      }
    }

    // Filter for wrong answers only
    if (validated.only === 'wrong') {
      where.isCorrect = false;
    }

    // Cursor pagination
    if (validated.cursor) {
      try {
        const cursor = decodeCursor(validated.cursor);
        where.OR = [
          {
            createdAt: { lt: new Date(cursor.t) },
          },
          {
            createdAt: new Date(cursor.t),
            id: { lt: cursor.id },
          },
        ];
      } catch {
        return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
      }
    }

    // Query with one extra item to determine if there's a next page
    const items = await prisma.solve.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: validated.limit + 1,
      include: {
        unit: {
          select: {
            name: true,
          },
        },
      },
    });

    // Check if there are more items
    const hasMore = items.length > validated.limit;
    if (hasMore) {
      items.pop(); // Remove the extra item
    }

    // Generate next cursor
    let nextCursor = undefined;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = encodeCursor({
        t: lastItem.createdAt.toISOString(),
        id: lastItem.id,
      });
    }

    // Transform data to include category from unit name
    const transformedItems = items.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      helpText: item.helpText,
      userInput: item.userInput,
      isCorrect: item.isCorrect,
      createdAt: item.createdAt,
      unitId: item.unitId,
      userId: item.userId,
      category: item.unit.name,
    }));

    return NextResponse.json({
      items: transformedItems,
      nextCursor,
    });
  } catch (error) {
    console.error('Error listing solves:', error);

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
