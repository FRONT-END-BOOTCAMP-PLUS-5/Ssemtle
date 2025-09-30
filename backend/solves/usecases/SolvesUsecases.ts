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
  UpdateSolveRequestDto,
  UpdateSolveResponseDto,
  CalendarSolvesRequestDto,
  CalendarSolvesResponseDto,
  DaySolvesDto,
} from '../dtos/SolveDto';
import { verifyAnswer } from '@/backend/utils/answer-verification';

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
      direction: request.direction,
      sortDirection: request.sortDirection,
    });

    const hasMore = result.items.length > request.limit;
    if (hasMore) {
      result.items.pop(); // Remove the extra item
    }

    // Generate cursors based on direction and sort
    let nextCursor = undefined;
    let prevCursor = undefined;

    if (result.items.length > 0) {
      const firstItem = result.items[0];
      const lastItem = result.items[result.items.length - 1];

      const direction = request.direction || 'next';

      // Generate cursors based on pagination direction and sort
      if (direction === 'next') {
        // Moving forward (next page)
        if (hasMore) {
          nextCursor = encodeCursor({
            t: lastItem.createdAt.toISOString(),
            id: lastItem.id,
          });
        }
        // Always generate prev cursor when going next (except for very first page)
        if (request.cursor || result.items.length > 0) {
          prevCursor = encodeCursor({
            t: firstItem.createdAt.toISOString(),
            id: firstItem.id,
          });
        }
      } else {
        // Moving backward (prev page)
        if (hasMore) {
          prevCursor = encodeCursor({
            t: firstItem.createdAt.toISOString(),
            id: firstItem.id,
          });
        }
        // Always generate next cursor when going prev
        nextCursor = encodeCursor({
          t: lastItem.createdAt.toISOString(),
          id: lastItem.id,
        });
      }
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
      prevCursor,
      completedDay: result.completedDay,
      batchInfo: result.batchInfo,
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

export class UpdateSolveUseCase {
  constructor(private repository: ISolveRepository) {}

  async execute(
    request: UpdateSolveRequestDto
  ): Promise<UpdateSolveResponseDto> {
    // Find the solve by ID and ensure it belongs to the user
    const existingSolve = await this.repository.findByIdAndUserId(
      request.id,
      request.userId
    );

    if (!existingSolve) {
      throw new Error('Solve not found');
    }

    // 정답 검증 유틸 사용
    const isCorrect = verifyAnswer(request.userInput, existingSolve.answer);

    // Prepare update data
    const updateData: { userInput: string; isCorrect?: boolean } = {
      userInput: request.userInput,
    };

    // Only update isCorrect if the answer becomes correct
    if (isCorrect) {
      updateData.isCorrect = true;
    }

    // Update the solve
    await this.repository.update(request.id, updateData);

    return {
      id: request.id,
      isCorrect: isCorrect || existingSolve.isCorrect,
    };
  }

  // compareAnswers, parseNumber는 유틸로 대체됨
}

export class GetCalendarSolvesUseCase {
  constructor(private repository: ISolveRepository) {}

  async execute(
    request: CalendarSolvesRequestDto
  ): Promise<CalendarSolvesResponseDto> {
    // Determine date range
    let from: Date;
    let to: Date;

    if (request.month) {
      // Parse month format YYYY-MM
      const [year, month] = request.month.split('-').map(Number);
      from = new Date(year, month - 1, 1); // month is 0-indexed
      to = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month
    } else if (request.from && request.to) {
      from = new Date(request.from);
      to = new Date(request.to);
    } else {
      throw new Error('Either month or from/to dates must be provided');
    }

    // Get calendar data from repository
    const dayResults = await this.repository.findByDateRangeForCalendar({
      userId: request.userId,
      from,
      to,
      isCorrect: request.only === 'wrong' ? false : undefined,
    });

    // Transform repository results to DTOs
    const days: DaySolvesDto[] = dayResults.map((dayResult) => {
      const accuracy =
        dayResult.total > 0 ? dayResult.correct / dayResult.total : 0;

      return {
        date: dayResult.date,
        total: dayResult.total,
        correct: dayResult.correct,
        accuracy,
        solves: dayResult.solves.map((solve) => ({
          id: solve.id,
          question: solve.question,
          answer: solve.answer,
          helpText: solve.helpText,
          userInput: solve.userInput,
          isCorrect: solve.isCorrect,
          createdAt: solve.createdAt,
          unitId: solve.unitId,
          userId: solve.userId,
          category: solve.unit.name,
        })),
      };
    });

    // Calculate month totals
    const monthTotal = days.reduce((sum, day) => sum + day.total, 0);
    const monthCorrect = days.reduce((sum, day) => sum + day.correct, 0);
    const monthAccuracy = monthTotal > 0 ? monthCorrect / monthTotal : 0;

    return {
      days,
      monthTotal,
      monthCorrect,
      monthAccuracy,
    };
  }
}
