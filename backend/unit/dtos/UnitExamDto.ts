// ABOUTME: 단원평가 관련 Data Transfer Objects
// ABOUTME: 단원평가 코드 생성 및 검증을 위한 입출력 구조 정의

export interface GenerateUnitExamRequestDto {
  categories: string[];
  questionCount: number;
  teacherId?: string; // 선택적으로 교사 ID 포함
}

export interface GenerateUnitExamResponseDto {
  code: string;
  teacherId: string;
  createdAt: Date;
}

export interface UnitExamGenerationResult {
  success: boolean;
  code?: string;
  examId?: number;
  error?: string;
}

export interface VerifyUnitExamRequestDto {
  code: string;
}

export interface VerifyUnitExamResponseDto {
  valid: boolean;
  examId?: number;
  teacherId?: string;
  createdAt?: Date;
}

export interface UnitExamVerificationResult {
  success: boolean;
  valid?: boolean;
  examData?: {
    id: number;
    teacherId: string;
    createdAt: Date;
  };
  error?: string;
}
