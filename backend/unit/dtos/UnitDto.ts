export interface CreateUnitRequestDto {
  name: string;
  vidUrl: string;
}

export interface CreateUnitResponseDto {
  id: number;
  name: string;
  vidUrl: string;
  createdAt: Date;
}

export interface UnitSelectResponseDto {
  id: number;
  name: string;
}

export interface UnitListResponseDto {
  units: UnitSelectResponseDto[];
  total: number;
}
