// ABOUTME: 출석(일일 풀이 수) 관련 저장소 인터페이스

export type AttendanceCountRange = {
  userId: string;
  from: Date;
  to: Date;
};

export interface IAttendanceRepository {
  /** 지정 기간(from~to) 동안의 solves 카운트를 반환 */
  countSolvesInRange(range: AttendanceCountRange): Promise<number>;
}
