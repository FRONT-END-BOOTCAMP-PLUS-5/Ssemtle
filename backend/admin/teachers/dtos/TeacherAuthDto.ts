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

export interface TeacherAuthApprovalRequestDto {
  readonly id: number;
}

export interface TeacherAuthApprovalResponseDto {
  message: string;
  data: {
    id: number;
    teacherId: string;
  };
}
