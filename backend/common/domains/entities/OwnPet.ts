// ABOUTME: User와 Pet 간의 관계를 나타내는 OwnPet 엔티티 클래스
// ABOUTME: 사용자와 소유한 펫을 연결하는 연결 테이블 엔티티

export class OwnPet {
  public readonly id: number;
  public readonly userId: number;
  public readonly petId: number;
  public readonly createdAt: Date;

  constructor(
    id: number,
    userId: number,
    petId: number,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.petId = petId;
    this.createdAt = createdAt;
  }
}
