import { Unit } from '../entities/Unit';

export interface IUnitRepository {
  create(unitData: { name: string; vidUrl: string }): Promise<Unit>;
  findAll(): Promise<Unit[]>;
  update(id: number, unitData: { name?: string; vidUrl?: string }): Promise<Unit>;
  findById(id: number): Promise<Unit | null>;
}
