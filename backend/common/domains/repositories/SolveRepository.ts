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

export interface SolveRepository {
  create(solve: Omit<Solve, 'id' | 'createdAt'>): Promise<Solve>;
  aggregateByUnit(filter: SolveAggregationFilter): Promise<SolveByUnitRow[]>;
}
