export interface TeacherAuthDto {
  readonly id: number;
  readonly teacherId: string;
  readonly name: string;
  readonly imgUrl: string;
  readonly createdAt: Date;
}
export interface TeacherAuthListResponseDto {
  message: string;
  data: {
    teacherAuths: TeacherAuthDto[];
    total: number;
  };
}
