import { Unit } from '../entities/Unit';

export interface IUnitRepository {
  create(unitData: {
    name: string;
    vidUrl: string;
    userId: string;
  }): Promise<Unit>;

  findAll(): Promise<Unit[]>;
  // findByUserId 제거
}
