// ABOUTME: Prisma 스키마의 TeacherStudent 관계를 나타내는 엔티티 클래스
// ABOUTME: 교사와 학생을 연결하는 연결 테이블 엔티티

export interface TeacherStudent {
  readonly id: number;
  readonly teacherId: string;
  readonly studentId: string;
  readonly createdAt: Date;
}
