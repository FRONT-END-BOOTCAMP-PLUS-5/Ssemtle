import {
  GetStudentUnitPerformanceRequestDTO,
  GetStudentUnitPerformanceResponseDTO,
  UnitPerformanceDTO,
} from '../dtos/GetStudentUnitPerformanceDTO';

import {
  SolveRepository,
  SolveAggregationFilter,
} from '../../common/domains/repositories/SolveRepository';

export class GetStudentUnitPerformanceUseCase {
  constructor(private readonly solveRepo: SolveRepository) {}

  async execute(
    req: GetStudentUnitPerformanceRequestDTO
  ): Promise<GetStudentUnitPerformanceResponseDTO> {
    // 1) 최소 검증
    if (!req?.userId || req.userId.trim() === '') {
      throw new Error('userId is required');
    }

    // 2) 날짜 파싱 (옵션)
    const fromDate = safeParseDate(req.from);
    const toDate = safeParseDate(req.to);

    // 3) 집계 조회
    const filter: SolveAggregationFilter = {
      userId: req.userId,
      from: fromDate,
      to: toDate,
    };
    const rows = await this.solveRepo.aggregateByUnit(filter);

    // 4) 정렬(선택): unitId 오름차순
    rows.sort((a, b) => a.unitId - b.unitId);

    // 5) 응답 매핑
    const units: UnitPerformanceDTO[] = rows.map((r) => ({
      unitId: r.unitId,
      total: r.total,
      correct: r.correct,
    }));
    console.log('📊 단원별 풀이 성과:', units);
    return {
      studentId: req.userId,
      range: { from: toYMD(fromDate), to: toYMD(toDate) },
      units,
    };
  }
}

/** 내부 유틸 */
function safeParseDate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}

function toYMD(d?: Date): string | undefined {
  if (!d) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
