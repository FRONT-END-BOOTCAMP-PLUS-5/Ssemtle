// ABOUTME: UnitSolve 엔티티 저장을 위한 Repository 인터페이스

export interface CreateUnitSolveData {
  questionId: number;
  userId: string;
  userInput: string;
  isCorrect: boolean;
  createdAt?: Date;
}

export interface IUnitSolveRepository {
  createMany(data: CreateUnitSolveData[]): Promise<number>;
  findByUserIdWithQuestion(userId: string): Promise<
    Array<{
      id: number;
      questionId: number;
      userInput: string;
      isCorrect: boolean;
      createdAt: Date;
      question: { question: string; answer: string };
    }>
  >;

  /**
   * 지정한 사용자와 날짜 범위로 단원평가 풀이를 조회합니다.
   * onlyWrong=true 이면 오답만 조회합니다.
   */
  findByUserAndDate(
    userId: string,
    start?: Date,
    end?: Date,
    onlyWrong?: boolean
  ): Promise<
    Array<{
      userInput: string;
      isCorrect: boolean;
      createdAt: Date;
      question: {
        question: string;
        answer: string;
        unit: { id: number; name: string; vidUrl: string };
      };
    }>
  >;

  /**
   * 지정한 사용자와 날짜 범위에 대한 전체/정답 개수를 반환합니다.
   */
  countByUserAndDate(
    userId: string,
    start?: Date,
    end?: Date
  ): Promise<{ total: number; correct: number }>;
}
