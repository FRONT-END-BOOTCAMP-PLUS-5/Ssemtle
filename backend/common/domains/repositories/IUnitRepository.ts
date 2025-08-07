import { Unit } from '../entities/Unit';

export interface IUnitRepository {
  create(unitData: {
    name: string;
    vidUrl: string;
  }): Promise<Unit>;
}
