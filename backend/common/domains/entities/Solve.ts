// ABOUTME: Prisma 스키마의 속성을 가진 Solve 엔티티 클래스
// ABOUTME: 문제, 답, 사용자 입력, 정답 여부를 포함한 일반적인 문제 해결 데이터를 포함

export class Solve {
  public readonly id: number;
  public readonly question: string;
  public readonly answer: string;
  public readonly helpUrl: string;
  public readonly userInput: string;
  public readonly isCorrect: boolean;
  public readonly createdAt: Date;
  public readonly categoryId: number;
  public readonly userId: number;

  constructor(
    id: number,
    question: string,
    answer: string,
    helpUrl: string,
    userInput: string,
    isCorrect: boolean,
    categoryId: number,
    userId: number,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.question = question;
    this.answer = answer;
    this.helpUrl = helpUrl;
    this.userInput = userInput;
    this.isCorrect = isCorrect;
    this.categoryId = categoryId;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}
