import { Unit } from '@/backend/common/domains/entities/Unit';
import { IUnitRepository } from '@/backend/common/domains/repositories/IAdminUnitRepository';

export class UnitSelectUseCase {
  private unitRepository: IUnitRepository;

  constructor(unitRepository: IUnitRepository) {
    this.unitRepository = unitRepository;
  }

  async getAllUnits(): Promise<{ units: Unit[]; total: number }> {
    try {
      const units = await this.unitRepository.findAll();

      return {
        units,
        total: units.length,
      };
    } catch (error) {
      console.error('Unit select error:', error);
      throw new Error('단원 목록 조회 중 오류가 발생했습니다.');
    }
  }
}
