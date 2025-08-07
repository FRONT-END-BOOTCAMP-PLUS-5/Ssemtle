import { Solve } from '../entities/Solve';

export interface SolveRepository {
  create(solve: Omit<Solve, 'id' | 'createdAt'>): Promise<Solve>;
}
