// ABOUTME: Prisma 스키마의 속성을 가진 UnitExamAttempt 엔티티 클래스
// ABOUTME: 학생과 단원 시험을 연결하는 시험 시도 정보를 포함

import type { UnitExam } from './UnitExam';

export interface UnitExamAttempt {
  readonly id: number;
  readonly unitCode: string;
  readonly studentId: string;
  readonly createdAt: Date;
  readonly unitExamId: number;

  // Relations
  readonly unitExam?: UnitExam;
}
