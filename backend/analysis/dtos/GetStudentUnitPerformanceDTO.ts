// backend/temp/dtos/GetStudentUnitPerformanceDTO.ts

/** 요청 DTO */
export interface GetStudentUnitPerformanceRequestDTO {
  userId: string; // 조회할 유저(학생) ID
  from?: string; // 시작 날짜 (YYYY-MM-DD 또는 ISO) optional
  to?: string; // 끝 날짜 optional
}

/** 응답 DTO */
export interface UnitPerformanceDTO {
  unitId: number;
  total: number; // 해당 단원 풀이 개수
  correct: number; // 해당 단원 정답 개수
}

export interface GetStudentUnitPerformanceResponseDTO {
  studentId: string;
  range: {
    from?: string; // YYYY-MM-DD
    to?: string; // YYYY-MM-DD
  };
  units: UnitPerformanceDTO[];
}
