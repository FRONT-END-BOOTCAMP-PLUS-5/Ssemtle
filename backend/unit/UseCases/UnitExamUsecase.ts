// ABOUTME: 단원평가 비즈니스 로직을 담당하는 UseCase
// ABOUTME: 코드 생성, 검증, 중복 체크 등의 핵심 비즈니스 규칙 구현

import { IUnitExamRepository } from '../../common/domains/repositories/IUnitExamRepository';
import {
  GenerateUnitExamRequestDto,
  UnitExamGenerationResult,
  VerifyUnitExamRequestDto,
  UnitExamVerificationResult,
} from '../dtos/UnitExamDto';

export class GenerateUnitExamUseCase {
  private unitExamRepository: IUnitExamRepository;

  constructor(unitExamRepository: IUnitExamRepository) {
    this.unitExamRepository = unitExamRepository;
  }

  async execute(
    request: GenerateUnitExamRequestDto
  ): Promise<UnitExamGenerationResult> {
    try {
      // 입력 데이터 유효성 검증
      if (!request.categories || request.categories.length === 0) {
        return {
          success: false,
          error: '최소 1개 이상의 카테고리를 선택해주세요.',
        };
      }

      if (!request.questionCount || request.questionCount <= 0) {
        return {
          success: false,
          error: '문제 개수는 1개 이상이어야 합니다.',
        };
      }

      // 랜덤 코드 생성 (영어 대문자 6글자)
      const code = this.generateRandomCode();

      // 코드 중복 체크
      const isDuplicate = await this.unitExamRepository.existsByCode(code);
      if (isDuplicate) {
        // 중복된 경우 재귀적으로 다시 생성
        return this.execute(request);
      }

      // 임시 교사 ID (실제로는 인증된 사용자 정보에서 가져와야 함)
      const teacherId = request.teacherId || 'temp-teacher-id';

      // 단원평가 생성 및 저장
      const unitExam = await this.unitExamRepository.create({
        code,
        teacherId,
      });

      return {
        success: true,
        code: unitExam.code,
        examId: unitExam.id,
      };
    } catch (error) {
      console.error('단원평가 생성 오류:', error);
      return {
        success: false,
        error: '단원평가 생성 중 오류가 발생했습니다.',
      };
    }
  }

  // 랜덤 코드 생성 메서드 (영어 대문자 6글자)
  private generateRandomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }
}

export class VerifyUnitExamUseCase {
  private unitExamRepository: IUnitExamRepository;

  constructor(unitExamRepository: IUnitExamRepository) {
    this.unitExamRepository = unitExamRepository;
  }

  async execute(
    request: VerifyUnitExamRequestDto
  ): Promise<UnitExamVerificationResult> {
    try {
      // 입력 데이터 유효성 검증
      if (!request.code || request.code.trim().length !== 6) {
        return {
          success: false,
          error: '코드는 6글자 영어 대문자여야 합니다.',
        };
      }

      // 코드 형식 검증 (영어 대문자만 허용)
      const codePattern = /^[A-Z]{6}$/;
      if (!codePattern.test(request.code)) {
        return {
          success: false,
          error: '코드는 영어 대문자 6글자만 허용됩니다.',
        };
      }

      // 데이터베이스에서 코드 검증
      const unitExam = await this.unitExamRepository.findByCode(request.code);

      if (unitExam) {
        return {
          success: true,
          valid: true,
          examData: {
            id: unitExam.id,
            teacherId: unitExam.teacherId,
            createdAt: unitExam.createdAt,
          },
        };
      } else {
        return {
          success: true,
          valid: false,
        };
      }
    } catch (error) {
      console.error('코드 검증 오류:', error);
      return {
        success: false,
        error: '코드 검증 중 오류가 발생했습니다.',
      };
    }
  }
}
