export interface SolveResponseDto {
  question: string;
  answer: string;
  helpText?: string; // Optional field for additional help text
}

export interface CreateSolveDto {
  question: string;
  answer: string;
  helpUrl: string;
  userInput: string;
  isCorrect: boolean;
  categoryId: number;
  userId: string;
}

// New DTOs for list API
export interface ListSolvesRequestDto {
  userId: string;
  from?: string;
  to?: string;
  only?: 'all' | 'wrong';
  limit: number;
  cursor?: string;
  direction?: 'next' | 'prev';
  sortDirection?: 'newest' | 'oldest';
}

export interface SolveListItemDto {
  id: number;
  question: string;
  answer: string;
  helpText: string;
  userInput: string;
  isCorrect: boolean;
  createdAt: Date;
  unitId: number;
  userId: string;
  category: string;
}

export interface ListSolvesResponseDto {
  items: SolveListItemDto[];
  nextCursor?: string;
  prevCursor?: string;
  completedDay?: boolean; // Indicates if the last day was completed for better card grouping
  batchInfo?: {
    requestedLimit: number;
    actualCount: number;
    dayCompletionAdded: number;
  };
}

// DTOs for units summary API
export interface UnitsSummaryRequestDto {
  userId: string;
  from?: string;
  to?: string;
  limitPerUnit: number;
}

export interface SolveSampleDto {
  id: number;
  question: string;
  isCorrect: boolean;
  createdAt: Date;
}

export interface UnitSummaryDto {
  unitId: number;
  title: string;
  total: number;
  correct: number;
  accuracy: number;
  samples: SolveSampleDto[];
}

export type UnitsSummaryResponseDto = UnitSummaryDto[];

// DTOs for category stats API
export interface CategoryStatsRequestDto {
  userId: string;
  from?: string;
  to?: string;
}

export interface CategoryStatDto {
  unitId: number;
  title: string;
  total: number;
  correct: number;
  accuracy: number;
}

export type CategoryStatsResponseDto = CategoryStatDto[];

// DTOs for update solve API
export interface UpdateSolveRequestDto {
  id: number;
  userId: string;
  userInput: string;
}

export interface UpdateSolveResponseDto {
  id: number;
  isCorrect: boolean;
}

// DTOs for calendar API
export interface CalendarSolvesRequestDto {
  userId: string;
  month?: string; // Format: YYYY-MM
  from?: string; // ISO date string
  to?: string; // ISO date string
  only?: 'all' | 'wrong';
}

export interface DaySolvesDto {
  date: string; // YYYY-MM-DD format
  total: number;
  correct: number;
  accuracy: number;
  solves: SolveListItemDto[];
}

export interface CalendarSolvesResponseDto {
  days: DaySolvesDto[];
  monthTotal: number;
  monthCorrect: number;
  monthAccuracy: number;
}
