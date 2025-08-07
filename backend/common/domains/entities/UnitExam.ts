// ABOUTME: Prisma 스키마의 속성을 가진 UnitExam 엔티티 클래스
// ABOUTME: 고유 코드와 교사 ID를 포함한 시험 정보를 포함

export interface UnitExam {
  readonly id: number;
  readonly code: string;
  readonly createdAt: Date;
  readonly teacherId: string;
}
