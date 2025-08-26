// backend/temp/dtos/GetStudentUnitExamAnalysisDTO.ts

export interface GetStudentUnitExamAnalysisRequestDTO {
  userId: string; // URL의 id (username이든 uuid든 문자열)
  from?: string; // YYYY-MM-DD or ISO (optional)
  to?: string; // optional
}

export interface UnitExamAnalysisItemDTO {
  unitCode: string; // 단원평가 코드
  total: number; // 풀이 수 (해당 unit_code의 문제에 대해 학생이 제출한 총 풀이수)
  correct: number; // 정답 수
}

export interface GetStudentUnitExamAnalysisResponseDTO {
  studentId: string;
  range: { from?: string; to?: string };
  units: UnitExamAnalysisItemDTO[];
}
