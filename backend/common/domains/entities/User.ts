// ABOUTME: Prisma 스키마의 모든 속성과 관계를 나타내는 User 엔티티 클래스
// ABOUTME: 사용자 인증 데이터, 프로필 정보, 포인트, 연속 기록 및 관련 엔티티를 포함

export class User {
  public readonly id: string;
  public readonly userId: string;
  public readonly password: string;
  public readonly name: string;
  public readonly role: string;
  public readonly point: number;
  public readonly streak: number;
  public readonly createdAt: Date;

  constructor(
    id: string,
    userId: string,
    password: string,
    name: string,
    role: string,
    point: number = 0,
    streak: number = 0,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.password = password;
    this.name = name;
    this.role = role;
    this.point = point;
    this.streak = streak;
    this.createdAt = createdAt;
  }
}
