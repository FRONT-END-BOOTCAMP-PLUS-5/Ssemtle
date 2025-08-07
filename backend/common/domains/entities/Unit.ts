// ABOUTME: Prisma 스키마의 속성을 가진 Unit 엔티티 클래스
// ABOUTME: 이름, 비디오 URL을 포함한 학습 단원 정보를 포함

import type { UnitQuestion } from './UnitQuestion';
import type { Solve } from './Solve';

export interface Unit {
  readonly id: number;
  readonly name: string;
  readonly vidUrl: string;
  readonly createdAt: Date;

  // Relations
  readonly unitQuestions?: UnitQuestion[];
  readonly solves?: Solve[];
}
