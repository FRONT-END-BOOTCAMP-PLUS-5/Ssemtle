// ABOUTME: 단원평가 관련 Data Transfer Objects
// ABOUTME: 단원평가 코드 생성 및 검증을 위한 입출력 구조 정의

export interface GenerateUnitExamRequestDto {
  // 프론트에서 선택한 단원 목록 (카테고리명 대신 단원명 사용)
  selectedUnits: Array<{ unitId: number; unitName: string }>;
  questionCount: number;
  teacherId?: string; // 선택적으로 교사 ID 포함
  // 시험 제한 시간(분). 1~60 사이. 제공되면 생성되는 코드 뒤에 -01~-60 형태로 부여
  timerMinutes?: number;
  // 하위 호환을 위해 기존 categories를 남겨두되 사용하지 않음
  categories?: string[];
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
  // 서버에서 세션으로부터 주입될 학생 ID (선택)
  studentId?: string;
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
  alreadyAttempted?: boolean;
}

// AI 생성 문제 관련 DTO
export interface AIGeneratedQuestion {
  unitId: number;
  // 렌더링용 최종 질문 (question1 + question2 병합)
  question: string;
  // 검증 및 표현을 위한 분리 필드
  question1?: string; // 문제 설명 텍스트
  question2?: string; // 실제 식(예: 2x + 6 = 14)
  answer: string;
  help_text: string;
}

export interface AIQuestionGenerationResult {
  success: boolean;
  questions?: AIGeneratedQuestion[];
  error?: string;
}

// 단원평가 시도 관련 DTO
export interface CreateExamAttemptRequestDto {
  code: string;
  studentId?: string; // 선택적으로 학생 ID 포함
}

export interface ExamAttemptResult {
  success: boolean;
  attemptId?: number;
  error?: string;
}

// 단원평가 문제 조회 DTO
export interface GetQuestionsRequestDto {
  code: string;
}

export interface GetQuestionsResult {
  success: boolean;
  questions?: Array<{ id: number; question: string; helpText: string }>;
  error?: string;
}

// 단원평가 일괄 제출 DTO
export interface SubmitAnswersRequestDto {
  code: string;
  studentId: string;
  answers: Array<{ questionId: number; userInput: string }>;
}

export interface SubmitAnswersResult {
  success: boolean;
  saved?: number;
  error?: string;
}
