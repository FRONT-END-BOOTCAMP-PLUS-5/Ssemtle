// ABOUTME: 오답 노트(일반 풀이 solves 테이블) 전용 리포지토리 인터페이스

export interface IErrorNotesSolveRepository {
  /**
   * 지정한 사용자와 날짜 범위의 일반 풀이(솔브)에서 오답만 조회합니다.
   */
  findWrongByUserAndDate(
    userId: string,
    start?: Date,
    end?: Date
  ): Promise<
    Array<{
      question: string;
      answer: string;
      helpText: string;
      userInput: string;
      isCorrect: boolean;
      createdAt: Date;
      unitId: number;
      unit: { name: string; vidUrl: string };
    }>
  >;

  /**
   * 지정한 사용자와 날짜 범위의 일반 풀이 개수(전체/정답)를 반환합니다.
   */
  countByUserAndDate(
    userId: string,
    start?: Date,
    end?: Date
  ): Promise<{ total: number; correct: number }>;
}
