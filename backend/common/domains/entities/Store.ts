// ABOUTME: Prisma 스키마의 속성을 가진 상점 아이템을 나타내는 Store 엔티티 클래스
// ABOUTME: 이름, 가격, 관련된 펫을 포함한 상점 아이템 정보를 포함

export class Store {
  public readonly id: number;
  public readonly name: string;
  public readonly imgUrl: string;
  public readonly price: number;
  public readonly petId: number;
  public readonly createdAt: Date;

  constructor(
    id: number,
    name: string,
    imgUrl: string,
    price: number,
    petId: number,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.imgUrl = imgUrl;
    this.price = price;
    this.petId = petId;
    this.createdAt = createdAt;
  }
}
