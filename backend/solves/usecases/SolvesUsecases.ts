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

    // Compare user input with correct answer using numeric tolerance
    const isCorrect = this.compareAnswers(
      request.userInput,
      existingSolve.answer
    );

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

  private compareAnswers(userInput: string, correctAnswer: string): boolean {
    // Tolerance values as specified in requirements
    const ABS_TOL = 0.0005;
    const REL_TOL = 0.001;

    // Trim inputs
    const trimmedUserInput = userInput.trim();
    const trimmedCorrectAnswer = correctAnswer.trim();

    // First try exact string match (case-insensitive)
    if (trimmedUserInput.toLowerCase() === trimmedCorrectAnswer.toLowerCase()) {
      return true;
    }

    // Try numeric comparison with tolerance
    const userNum = this.parseNumber(trimmedUserInput);
    const correctNum = this.parseNumber(trimmedCorrectAnswer);

    if (userNum !== null && correctNum !== null) {
      const absoluteDiff = Math.abs(userNum - correctNum);
      const relativeDiff = Math.abs(absoluteDiff / correctNum);

      return absoluteDiff <= ABS_TOL || relativeDiff <= REL_TOL;
    }

    // If not numeric, fall back to exact string comparison
    return false;
  }

  private parseNumber(input: string): number | null {
    // Handle fractions like "1/2", "3/4"
    if (input.includes('/')) {
      const parts = input.split('/');
      if (parts.length === 2) {
        const numerator = parseFloat(parts[0].trim());
        const denominator = parseFloat(parts[1].trim());
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          return numerator / denominator;
        }
      }
      return null;
    }

    // Handle regular decimal numbers
    const parsed = parseFloat(input);
    return isNaN(parsed) ? null : parsed;
  }
}
