// ABOUTME: Prisma를 사용하는 출석(일일 풀이 수) 전용 리포지토리 구현체

import prisma from '@/libs/prisma';
import {
  AttendanceCountRange,
  IAttendanceRepository,
} from '@/backend/attendances/domains/repositories/AttendanceRepository';

export class PrAttendanceRepository implements IAttendanceRepository {
  /**
   * solves 테이블에서 지정 기간의 총 개수를 카운트합니다.
   */
  async countSolvesInRange(range: AttendanceCountRange): Promise<number> {
    const count = await prisma.solve.count({
      where: {
        userId: range.userId,
        createdAt: {
          gte: range.from,
          lte: range.to,
        },
      },
    });

    return count;
  }
}
