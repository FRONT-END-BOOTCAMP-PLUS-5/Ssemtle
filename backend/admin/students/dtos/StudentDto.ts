export interface StudentDto {
  id: string;
  userId: string;
  name: string;
  point: number;
  streak: number;
  createdAt: Date;
  teacherStudentId?: string;
  teacherId?: string;
  deletedAt?: Date;
  password?: string;
  successCount?: number;
  failureCount?: number;
  createdStudents?: StudentDto[];
  failedStudents?: {
    name: string;
    reason: string;
  }[];

  students?: StudentDto[];
  total?: number;
}
