// ABOUTME: Prisma 스키마의 속성을 가진 UnitExamAttempt 엔티티 클래스
// ABOUTME: 학생과 단원 시험을 연결하는 시험 시도 정보를 포함

export class UnitExamAttempt {
  public readonly id: number;
  public readonly unitCode: string;
  public readonly studentId: number;
  public readonly createdAt: Date;
  public readonly unitExamId: number;

  constructor(
    id: number,
    unitCode: string,
    studentId: number,
    unitExamId: number,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.unitCode = unitCode;
    this.studentId = studentId;
    this.unitExamId = unitExamId;
    this.createdAt = createdAt;
  }
}
