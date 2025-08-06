// ABOUTME: Prisma 스키마의 속성을 가진 UnitQuestion 엔티티 클래스
// ABOUTME: 문제 텍스트, 답, 도움말 URL, 카테고리를 포함한 단원의 문제 데이터를 포함

export class UnitQuestion {
  public readonly id: number;
  public readonly unitCode: string;
  public readonly question: string;
  public readonly answer: string;
  public readonly helpUrl: string;
  public readonly createdAt: Date;
  public readonly categoryId: number;
  public readonly unitId: number;
  public readonly userId: string;

  constructor(
    id: number,
    unitCode: string,
    question: string,
    answer: string,
    helpUrl: string,
    categoryId: number,
    unitId: number,
    userId: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.unitCode = unitCode;
    this.question = question;
    this.answer = answer;
    this.helpUrl = helpUrl;
    this.categoryId = categoryId;
    this.unitId = unitId;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}
