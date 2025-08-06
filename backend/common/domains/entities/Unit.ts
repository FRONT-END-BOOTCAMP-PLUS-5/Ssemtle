// ABOUTME: Prisma 스키마의 속성을 가진 Unit 엔티티 클래스
// ABOUTME: 이름, 비디오 URL, 관련 사용자를 포함한 학습 단원 정보를 포함

export class Unit {
  public readonly id: number;
  public readonly name: string;
  public readonly vidUrl: string;
  public readonly createdAt: Date;
  public readonly userId: number;

  constructor(
    id: number,
    name: string,
    vidUrl: string,
    userId: number,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.vidUrl = vidUrl;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}
