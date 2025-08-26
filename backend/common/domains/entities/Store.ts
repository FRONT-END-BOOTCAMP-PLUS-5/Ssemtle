// ABOUTME: Prisma 스키마의 속성을 가진 상점 아이템을 나타내는 Store 엔티티 클래스
// ABOUTME: 이름, 가격, 관련된 펫을 포함한 상점 아이템 정보를 포함

import type { Pet } from './Pet';

export interface Store {
  readonly id: number;
  readonly name: string;
  readonly imgUrl: string;
  readonly price: number;
  readonly petId: number;
  readonly createdAt: Date;

  // Relations
  readonly pet?: Pet;
}
