// ABOUTME: Prisma 스키마의 속성을 나타내는 Pet 엔티티 클래스
// ABOUTME: 이름, 이미지 URL, 단계를 포함한 펫 정보를 포함

export class Pet {
  public readonly id: number;
  public readonly name: string;
  public readonly imgUrl: string;
  public readonly stage: string;
  public readonly createdAt: Date;

  constructor(
    id: number,
    name: string,
    imgUrl: string,
    stage: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.imgUrl = imgUrl;
    this.stage = stage;
    this.createdAt = createdAt;
  }
}
