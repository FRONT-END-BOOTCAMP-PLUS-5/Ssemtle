// ABOUTME: Prisma 스키마의 속성을 가진 UnitQuestion 엔티티 클래스
// ABOUTME: 문제 텍스트, 답, 도움말 텍스트를 포함한 단원의 문제 데이터를 포함

import type { Unit } from './Unit';
import type { User } from './User';
import type { UnitSolve } from './UnitSolve';

export interface UnitQuestion {
  readonly id: number;
  readonly unitCode: string;
  readonly question: string;
  readonly answer: string;
  readonly helpText: string;
  readonly createdAt: Date;
  readonly unitId: number;
  readonly userId: string;

  // Relations
  readonly unit?: Unit;
  readonly user?: User;
  readonly unitSolves?: UnitSolve[];
}
