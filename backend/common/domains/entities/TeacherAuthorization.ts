// ABOUTME: Prisma 스키마의 속성을 가진 TeacherAuthorization 엔티티 클래스
// ABOUTME: 교사 ID와 이미지 URL을 포함한 교사 인증 데이터를 포함

import type { User } from './User';

export interface TeacherAuthorization {
  readonly id: number;
  readonly teacherId: string;
  readonly name: string;
  readonly email: string;
  readonly imgUrl: string;
  readonly createdAt: Date;

  // Relations
  readonly teacher?: User;
}
