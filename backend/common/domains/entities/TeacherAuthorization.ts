// ABOUTME: Prisma 스키마의 속성을 가진 TeacherAuthorization 엔티티 클래스
// ABOUTME: 교사 ID와 이미지 URL을 포함한 교사 인증 데이터를 포함

export class TeacherAuthorization {
  public readonly id: number;
  public readonly teacherId: number;
  public readonly imgUrl: string;
  public readonly createdAt: Date;

  constructor(
    id: number,
    teacherId: number,
    imgUrl: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.teacherId = teacherId;
    this.imgUrl = imgUrl;
    this.createdAt = createdAt;
  }
}
