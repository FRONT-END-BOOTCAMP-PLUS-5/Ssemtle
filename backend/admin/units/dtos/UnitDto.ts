export interface UnitDto {
  readonly id?: number;
  readonly name: string;
  readonly vidUrl: string;
}

// API 응답 타입 정의
export interface UnitListResponseDto {
  message: string;
  data: {
    units: UnitDto[];
    total: number;
  };
}
