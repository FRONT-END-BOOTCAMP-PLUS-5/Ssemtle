// ABOUTME: Prisma 스키마의 속성을 가진 UnitQuestion 엔티티 클래스
// ABOUTME: 문제 텍스트, 답, 도움말 URL, 카테고리를 포함한 단원의 문제 데이터를 포함

export interface UnitQuestion {
  readonly id: number;
  readonly unitCode: string;
  readonly question: string;
  readonly answer: string;
  readonly helpUrl: string;
  readonly createdAt: Date;
  readonly categoryId: number;
  readonly unitId: number;
  readonly userId: string;
}
