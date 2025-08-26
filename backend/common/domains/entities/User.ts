// ABOUTME: Prisma 스키마의 모든 속성과 관계를 나타내는 User 엔티티 클래스
// ABOUTME: 사용자 인증 데이터, 프로필 정보, 포인트, 연속 기록 및 관련 엔티티를 포함

import type { OwnPet } from './OwnPet';
import type { TeacherAuthorization } from './TeacherAuthorization';
import type { Unit } from './Unit';
import type { UnitQuestion } from './UnitQuestion';
import type { Solve } from './Solve';
import type { UnitSolve } from './UnitSolve';
import type { TeacherStudent } from './TeacherStudent';
import type { UnitExam } from './UnitExam';

export interface User {
  readonly id: string;
  readonly userId: string;
  readonly password: string;
  readonly name: string;
  readonly role: string;
  readonly point: number;
  readonly streak: number;
  readonly createdAt: Date;

  // Relations
  readonly ownPets?: OwnPet[];
  readonly teacherAuthorizations?: TeacherAuthorization[];
  readonly units?: Unit[];
  readonly unitQuestions?: UnitQuestion[];
  readonly solves?: Solve[];
  readonly unitSolves?: UnitSolve[];
  readonly teacherStudentsAsTeacher?: TeacherStudent[];
  readonly teacherStudentsAsStudent?: TeacherStudent[];
  readonly unitExams?: UnitExam[];
}
