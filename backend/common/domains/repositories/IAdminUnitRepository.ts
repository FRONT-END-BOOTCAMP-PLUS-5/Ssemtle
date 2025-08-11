import { Unit } from '../entities/Unit';

export interface IAdminUnitRepository {
  create(unitData: { name: string; vidUrl: string }): Promise<Unit>;
  findAll(): Promise<Unit[]>;
  update(
    id: number,
    unitData: { name?: string; vidUrl?: string }
  ): Promise<Unit>;
  findById(id: number): Promise<Unit | null>;
  findByName(name: string): Promise<Unit | null>;
  delete(id: number): Promise<Unit>;
  findVidUrlById(id: number): Promise<{ id: number; vidUrl: string } | null>;
}
