// ABOUTME: Prisma 스키마의 속성을 가진 Solve 엔티티 클래스
// ABOUTME: 문제, 답, 사용자 입력, 정답 여부를 포함한 일반적인 문제 해결 데이터를 포함

export interface Solve {
  readonly id: number;
  readonly question: string;
  readonly answer: string;
  readonly helpUrl: string;
  readonly userInput: string;
  readonly isCorrect: boolean;
  readonly createdAt: Date;
  readonly categoryId: number;
  readonly userId: string;
}
