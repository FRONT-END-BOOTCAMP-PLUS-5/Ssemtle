// ABOUTME: User와 Pet 간의 관계를 나타내는 OwnPet 엔티티 클래스
// ABOUTME: 사용자와 소유한 펫을 연결하는 연결 테이블 엔티티

export interface OwnPet {
  readonly id: number;
  readonly userId: string;
  readonly petId: number;
  readonly createdAt: Date;
}
