export interface CreateUnitRequestDto {
  name: string;        
  vidUrl: string;     
}

export interface CreateUnitResponseDto {
  id: number;
  name: string;
  vidUrl: string;
  createdAt: Date;
  userId: string;
}
