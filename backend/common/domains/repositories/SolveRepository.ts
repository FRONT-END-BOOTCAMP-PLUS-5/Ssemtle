import { Solve } from '../entities/Solve';

export type SolveAggregationFilter = {
  userId: string;
  from?: Date;
  to?: Date;
};

export type SolveByUnitRow = {
  unitId: number;
  total: number; // 풀이 수
  correct: number; // 정답 수
};
export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  completedDay?: boolean;
  batchInfo?: {
    requestedLimit: number;
    actualCount: number;
    dayCompletionAdded: number;
  };
}

export interface PaginationFilters {
  userId: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  isCorrect?: boolean;
  cursor?: {
    t: string;
    id: number;
  };
}

export interface PaginationParams {
  userId: string;
  limit: number;
  filters: PaginationFilters;
  direction?: 'next' | 'prev';
  sortDirection?: 'newest' | 'oldest';
}

export interface UnitStatsResult {
  unitId: number;
  unitName: string;
  total: number;
  correct: number;
}

export interface SolveSample {
  id: number;
  question: string;
  isCorrect: boolean;
  createdAt: Date;
}

export interface SolveRepository {
  create(solve: Omit<Solve, 'id' | 'createdAt'>): Promise<Solve>;
  aggregateByUnit(filter: SolveAggregationFilter): Promise<SolveByUnitRow[]>;
}

export interface CalendarFilters {
  userId: string;
  from: Date;
  to: Date;
  isCorrect?: boolean;
}

export interface DaySolvesResult {
  date: string; // YYYY-MM-DD
  total: number;
  correct: number;
  solves: (Solve & { unit: { name: string } })[];
}

export interface ISolveRepository extends SolveRepository {
  findAll(): Promise<Solve[]>;
  findById(id: number): Promise<Solve | null>;
  findByIdAndUserId(id: number, userId: string): Promise<Solve | null>;
  update(id: number, solve: Partial<Solve>): Promise<Solve>;
  delete(id: number): Promise<void>;
  findPaginated(
    params: PaginationParams
  ): Promise<PaginatedResult<Solve & { unit: { name: string } }>>;
  countByUnitAndCorrectness(
    userId: string,
    dateFilter?: { gte?: Date; lte?: Date }
  ): Promise<UnitStatsResult[]>;
  findRecentSamplesByUnit(
    unitId: number,
    userId: string,
    limit: number,
    dateFilter?: { gte?: Date; lte?: Date }
  ): Promise<SolveSample[]>;
  findByDateRangeForCalendar(
    filters: CalendarFilters
  ): Promise<DaySolvesResult[]>;
}
