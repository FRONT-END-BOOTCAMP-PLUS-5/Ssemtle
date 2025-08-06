// ABOUTME: Prisma 스키마의 TeacherStudent 관계를 나타내는 엔티티 클래스
// ABOUTME: 교사와 학생을 연결하는 연결 테이블 엔티티

export class TeacherStudent {
  public readonly id: number;
  public readonly teacherId: number;
  public readonly studentId: number;
  public readonly createdAt: Date;

  constructor(
    id: number,
    teacherId: number,
    studentId: number,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.teacherId = teacherId;
    this.studentId = studentId;
    this.createdAt = createdAt;
  }
}
