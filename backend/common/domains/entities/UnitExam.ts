// ABOUTME: Prisma 스키마의 속성을 가진 UnitExam 엔티티 클래스
// ABOUTME: 고유 코드와 교사 ID를 포함한 시험 정보를 포함

export class UnitExam {
  public readonly id: number;
  public readonly code: string;
  public readonly createdAt: Date;
  public readonly teacherId: string;

  constructor(
    id: number,
    code: string,
    teacherId: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.code = code;
    this.teacherId = teacherId;
    this.createdAt = createdAt;
  }
}
