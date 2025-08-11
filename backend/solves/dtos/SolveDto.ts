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
