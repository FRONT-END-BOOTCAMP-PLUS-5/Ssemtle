// ABOUTME: Prisma 스키마의 속성을 가진 Unit 엔티티 클래스
// ABOUTME: 이름, 비디오 URL, 관련 사용자를 포함한 학습 단원 정보를 포함

export interface Unit {
  readonly id: number;
  readonly name: string;
  readonly vidUrl: string;
  readonly createdAt: Date;
  readonly userId: string;
}
