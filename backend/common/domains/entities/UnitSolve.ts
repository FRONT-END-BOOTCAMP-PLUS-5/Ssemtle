// ABOUTME: Prisma 스키마의 속성을 가진 UnitSolve 엔티티 클래스
// ABOUTME: 특정 문제에 대한 사용자 입력과 정답 여부를 포함한 단원별 문제 해결 데이터를 포함

import type { UnitQuestion } from './UnitQuestion';
import type { User } from './User';

export interface UnitSolve {
  readonly id: number;
  readonly userInput: string;
  readonly isCorrect: boolean;
  readonly createdAt: Date;
  readonly questionId: number;
  readonly userId: string;

  // Relations
  readonly question?: UnitQuestion;
  readonly user?: User;
}
