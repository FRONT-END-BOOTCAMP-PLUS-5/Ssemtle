// ABOUTME: AI가 생성한 문제를 도메인 규칙으로 검증하기 위한 인터페이스
import { AIGeneratedQuestion } from '@/backend/unit/dtos/UnitExamDto';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export interface AIQuestionValidator {
  // 단일 문제 검증. unitName은 선택적으로 주입하여 단원별 검증 분기 가능
  validate(question: AIGeneratedQuestion, unitName?: string): ValidationResult;
}
