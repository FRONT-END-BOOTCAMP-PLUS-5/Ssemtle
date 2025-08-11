// ABOUTME: Use Cases for Solves domain containing business logic
// ABOUTME: Handles list pagination, unit summaries, and category statistics

import { ISolveRepository } from '../../common/domains/repositories/SolveRepository';
import { decodeCursor, encodeCursor } from '../../../libs/cursor';
import {
  ListSolvesRequestDto,
  ListSolvesResponseDto,
  SolveListItemDto,
  UnitsSummaryRequestDto,
  UnitsSummaryResponseDto,
  UnitSummaryDto,
  CategoryStatsRequestDto,
  CategoryStatsResponseDto,
  CategoryStatDto,
} from '../dtos/SolveDto';

export class ListSolvesUseCase {
  constructor(private repository: ISolveRepository) {}

  async execute(request: ListSolvesRequestDto): Promise<ListSolvesResponseDto> {
    const filters: {
      userId: string;
      createdAt?: { gte?: Date; lte?: Date };
      isCorrect?: boolean;
      cursor?: { t: string; id: number };
    } = {
      userId: request.userId,
    };

    // Date range filtering
    if (request.from || request.to) {
      filters.createdAt = {};
      if (request.from) {
        filters.createdAt.gte = new Date(request.from);
      }
      if (request.to) {
        filters.createdAt.lte = new Date(request.to);
      }
    }

    // Filter for wrong answers only
    if (request.only === 'wrong') {
      filters.isCorrect = false;
    }

    // Cursor pagination
    if (request.cursor) {
      try {
        const cursor = decodeCursor(request.cursor);
        filters.cursor = cursor;
      } catch {
        throw new Error('Invalid cursor');
      }
    }

    // Query with one extra item to determine if there's a next page
    const result = await this.repository.findPaginated({
      userId: request.userId,
      limit: request.limit + 1,
      filters,
    });

    const hasMore = result.items.length > request.limit;
    if (hasMore) {
      result.items.pop(); // Remove the extra item
    }

    // Generate next cursor
    let nextCursor = undefined;
    if (hasMore && result.items.length > 0) {
      const lastItem = result.items[result.items.length - 1];
      nextCursor = encodeCursor({
        t: lastItem.createdAt.toISOString(),
        id: lastItem.id,
      });
    }

    // Transform data to include category from unit name
    const items: SolveListItemDto[] = result.items.map((item) => ({
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

    return {
      items,
      nextCursor,
    };
  }
}

export class GetUnitsSummaryUseCase {
  constructor(private repository: ISolveRepository) {}

  async execute(
    request: UnitsSummaryRequestDto
  ): Promise<UnitsSummaryResponseDto> {
    const dateFilter: { gte?: Date; lte?: Date } = {};

    if (request.from || request.to) {
      if (request.from) {
        dateFilter.gte = new Date(request.from);
      }
      if (request.to) {
        dateFilter.lte = new Date(request.to);
      }
    }

    // Get aggregated stats per unit
    const unitStats = await this.repository.countByUnitAndCorrectness(
      request.userId,
      Object.keys(dateFilter).length > 0 ? dateFilter : undefined
    );

    // Get recent samples for each unit
    const unitsWithSamples: UnitSummaryDto[] = await Promise.all(
      unitStats.map(async (stat) => {
        const samples = await this.repository.findRecentSamplesByUnit(
          stat.unitId,
          request.userId,
          request.limitPerUnit,
          Object.keys(dateFilter).length > 0 ? dateFilter : undefined
        );

        const accuracy = stat.total > 0 ? stat.correct / stat.total : 0;

        return {
          unitId: stat.unitId,
          title: stat.unitName,
          total: stat.total,
          correct: stat.correct,
          accuracy,
          samples,
        };
      })
    );

    // Sort by unit name for consistent ordering
    unitsWithSamples.sort((a, b) => a.title.localeCompare(b.title, 'ko'));

    return unitsWithSamples;
  }
}

export class GetCategoryStatsUseCase {
  constructor(private repository: ISolveRepository) {}

  async execute(
    request: CategoryStatsRequestDto
  ): Promise<CategoryStatsResponseDto> {
    const dateFilter: { gte?: Date; lte?: Date } = {};

    if (request.from || request.to) {
      if (request.from) {
        dateFilter.gte = new Date(request.from);
      }
      if (request.to) {
        dateFilter.lte = new Date(request.to);
      }
    }

    // Get aggregated stats per unit
    const unitStats = await this.repository.countByUnitAndCorrectness(
      request.userId,
      Object.keys(dateFilter).length > 0 ? dateFilter : undefined
    );

    // Transform to category stats
    const categoryStats: CategoryStatDto[] = unitStats.map((stat) => ({
      unitId: stat.unitId,
      title: stat.unitName,
      total: stat.total,
      correct: stat.correct,
      accuracy: stat.total > 0 ? stat.correct / stat.total : 0,
    }));

    // Sort by Korean locale
    categoryStats.sort((a, b) => a.title.localeCompare(b.title, 'ko'));

    return categoryStats;
  }
}
