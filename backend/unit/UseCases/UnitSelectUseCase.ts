import { IUnitRepository } from '@/backend/common/domains/repositories/IUnitRepository';
import { UnitSelectResponseDto, UnitListResponseDto } from '../dtos/UnitDto';

export class UnitSelectUseCase {
  private unitRepository: IUnitRepository;

  constructor(unitRepository: IUnitRepository) {
    this.unitRepository = unitRepository;
  }

  async getAllUnits(): Promise<UnitListResponseDto> {
    try {
      const units = await this.unitRepository.findAll();
      
      const unitList: UnitSelectResponseDto[] = units.map(unit => ({
        id: unit.id,
        name: unit.name
      }));

      return {
        units: unitList,
        total: unitList.length
      };
    } catch (error) {
      console.error('Unit select error:', error);
      throw new Error('단원 목록 조회 중 오류가 발생했습니다.');
    }
  }
}
