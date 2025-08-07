import { CreateUnitRequestDto, CreateUnitResponseDto } from '../dtos/UnitDto';
import { IUnitRepository } from '@/backend/common/domains/repositories/IUnitRepository';

export class CreateUnitUseCase {
  private unitRepository: IUnitRepository;

  constructor(unitRepository: IUnitRepository) {
    this.unitRepository = unitRepository;
  }

  async execute(request: CreateUnitRequestDto): Promise<CreateUnitResponseDto> {
    if (!request.name || !request.vidUrl) {
      throw new Error('과목명과 영상 URL을 모두 입력해주세요.');
    }

    // Validate subject name (수학 과목/단원명)
    if (request.name.trim().length < 2) {
      throw new Error('과목명은 2자 이상 입력해주세요.');
    }

    if (request.name.length > 20) {
      throw new Error('과목명은 20자 이하로 입력해주세요.');
    }

    // Create math unit
    try {
      const unit = await this.unitRepository.create({
        name: request.name.trim(),
        vidUrl: request.vidUrl.trim(),
      });

      return {
        id: unit.id,
        name: unit.name,
        vidUrl: unit.vidUrl,
        createdAt: unit.createdAt,
      };
    } catch (error) {
      console.error('Math unit creation error:', error);
      throw new Error('수학 단원 생성 중 오류가 발생했습니다.');
    }
  }
}
