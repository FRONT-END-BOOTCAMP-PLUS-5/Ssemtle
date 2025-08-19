// ABOUTME: 오늘 날짜의 풀이 수를 기반으로 출석 진행률을 계산하는 유즈케이스
// - 세션에서 전달받은 userId를 사용
// - 저장소를 통해 오늘 풀이 수(count)를 조회하여 남은 개수/퍼센트 계산

import { IAttendanceRepository } from '../domains/repositories/AttendanceRepository';

export type GetTodayAttendanceRequest = {
  /** 사용자 고유 ID (UUID) */
  userId: string;
  /** 일일 목표치 (기본 10문제) */
  dailyTarget?: number;
  /** 타임존 기준 일자 경계 (기본: 로컬 서버 타임존) */
  timezone?: 'local' | 'utc';
};

export type GetTodayAttendanceResponse = {
  /** 오늘 푼 문제 수 */
  solvedCount: number;
  /** 일일 목표치 */
  targetCount: number;
  /** 남은 문제 수 (0 미만으로 내려가지 않음) */
  remainingCount: number;
  /** 진행률 퍼센트(0~100) */
  progressPercent: number;
};

export class GetTodayAttendanceUsecase {
  constructor(private readonly repository: IAttendanceRepository) {}

  /**
   * 오늘 날짜의 풀이 수를 조회하여 출석 정보를 반환합니다.
   */
  async execute(
    params: GetTodayAttendanceRequest
  ): Promise<GetTodayAttendanceResponse> {
    const target = params.dailyTarget ?? 10;

    // 날짜 경계 계산 (로컬 또는 UTC)
    const now = new Date();
    const { startOfDay, endOfDay } = this.getDayRange(now, params.timezone);

    const solvedCount = await this.repository.countSolvesInRange({
      userId: params.userId,
      from: startOfDay,
      to: endOfDay,
    });

    const remaining = Math.max(0, target - solvedCount);
    const progressPercent = Math.max(
      0,
      Math.min(100, Math.floor((solvedCount / target) * 100))
    );

    return {
      solvedCount,
      targetCount: target,
      remainingCount: remaining,
      progressPercent,
    };
  }

  /**
   * 주어진 기준 시각으로 그날의 시작/끝을 반환합니다.
   */
  private getDayRange(
    base: Date,
    timezone: 'local' | 'utc' = 'local'
  ): { startOfDay: Date; endOfDay: Date } {
    if (timezone === 'utc') {
      const start = new Date(
        Date.UTC(
          base.getUTCFullYear(),
          base.getUTCMonth(),
          base.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
      const end = new Date(
        Date.UTC(
          base.getUTCFullYear(),
          base.getUTCMonth(),
          base.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
      return { startOfDay: start, endOfDay: end };
    }

    const start = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      23,
      59,
      59,
      999
    );
    return { startOfDay: start, endOfDay: end };
  }
}
