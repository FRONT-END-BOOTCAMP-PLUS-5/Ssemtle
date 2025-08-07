// ABOUTME: Prisma 스키마의 모든 속성과 관계를 나타내는 User 엔티티 클래스
// ABOUTME: 사용자 인증 데이터, 프로필 정보, 포인트, 연속 기록 및 관련 엔티티를 포함

export interface User {
  readonly id: string;
  readonly userId: string;
  readonly password: string;
  readonly name: string;
  readonly role: string;
  readonly point: number;
  readonly streak: number;
  readonly createdAt: Date;
}
