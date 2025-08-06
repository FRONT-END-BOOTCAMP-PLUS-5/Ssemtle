// ABOUTME: Prisma 스키마의 속성을 가진 UnitSolve 엔티티 클래스
// ABOUTME: 특정 문제에 대한 사용자 입력과 정답 여부를 포함한 단원별 문제 해결 데이터를 포함

export class UnitSolve {
  public readonly id: number;
  public readonly userInput: string;
  public readonly isCorrect: boolean;
  public readonly createdAt: Date;
  public readonly questionId: number;
  public readonly userId: number;

  constructor(
    id: number,
    userInput: string,
    isCorrect: boolean,
    questionId: number,
    userId: number,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.userInput = userInput;
    this.isCorrect = isCorrect;
    this.questionId = questionId;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}
