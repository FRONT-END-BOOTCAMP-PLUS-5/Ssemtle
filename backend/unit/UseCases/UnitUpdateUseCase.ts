import { UpdateUnitRequestDto, UpdateUnitResponseDto } from '../dtos/UnitDto';
import { IUnitRepository } from '@/backend/common/domains/repositories/IUnitRepository';

export class UnitUpdateUseCase {
  private unitRepository: IUnitRepository;

  constructor(unitRepository: IUnitRepository) {
    this.unitRepository = unitRepository;
  }

  async execute(request: UpdateUnitRequestDto): Promise<UpdateUnitResponseDto> {
    if (!request.id) {
      throw new Error('업데이트할 단원의 ID가 필요합니다.');
    }

    // 기존 단원이 존재하는지 확인
    const existingUnit = await this.unitRepository.findById(request.id);
    if (!existingUnit) {
      throw new Error('존재하지 않는 단원입니다.');
    }

    // 업데이트할 데이터 검증
    const updateData: { name?: string; vidUrl?: string } = {};

    if (request.name !== undefined) {
      if (request.name.trim().length < 2) {
        throw new Error('과목명은 2자 이상 입력해주세요.');
      }
      if (request.name.length > 20) {
        throw new Error('과목명은 20자 이하로 입력해주세요.');
      }
      updateData.name = request.name.trim();
    }

    if (request.vidUrl !== undefined) {
      if (!request.vidUrl.trim()) {
        throw new Error('영상 URL을 입력해주세요.');
      }
      updateData.vidUrl = request.vidUrl.trim();
    }

    // 업데이트할 데이터가 없는 경우
    if (Object.keys(updateData).length === 0) {
      throw new Error('업데이트할 데이터가 없습니다.');
    }

    try {
      const updatedUnit = await this.unitRepository.update(request.id, updateData);

      return {
        id: updatedUnit.id,
        name: updatedUnit.name,
        vidUrl: updatedUnit.vidUrl,
        createdAt: updatedUnit.createdAt,
      };
    } catch (error) {
      console.error('Unit update error:', error);
      throw new Error('단원 업데이트 중 오류가 발생했습니다.');
    }
  }
}
