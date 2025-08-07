// ABOUTME: Prisma 스키마의 속성을 나타내는 Pet 엔티티 클래스
// ABOUTME: 이름, 이미지 URL, 단계를 포함한 펫 정보를 포함

import type { OwnPet } from './OwnPet';
import type { Store } from './Store';

export interface Pet {
  readonly id: number;
  readonly name: string;
  readonly imgUrl: string;
  readonly stage: string;
  readonly createdAt: Date;

  // Relations
  readonly ownPets?: OwnPet[];
  readonly stores?: Store[];
}
