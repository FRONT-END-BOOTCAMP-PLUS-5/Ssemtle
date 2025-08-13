// backend/analysis/usecases/GetStudentUnitPerformanceUsecase.ts
import {
  GetStudentUnitPerformanceRequestDTO,
  GetStudentUnitPerformanceResponseDTO,
  UnitPerformanceDTO,
} from '../dtos/GetStudentUnitPerformanceDTO';

import {
  SolveRepository,
  SolveAggregationFilter,
} from '../../common/domains/repositories/SolveRepository';

import { IUnitRepository } from '@/backend/common/domains/repositories/IUnitRepository';

export class GetStudentUnitPerformanceUseCase {
  constructor(
    private readonly solveRepo: SolveRepository,
    private readonly unitRepo: IUnitRepository // ✅ 단원 메타 조회용
  ) {}

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
    // rows 예: [{ unitId: 12, total: 173, correct: 126 }, ...]

    // 4) 단원 메타 조회 (unitId → unitName)
    const unitIds = Array.from(new Set(rows.map((r) => r.unitId)));
    const meta = await this.unitRepo.findNamesByIds(unitIds);
    // meta 예: [{ id: 12, name: '수학 연산' }, ...]
    // ⚠️ 만약 스키마가 { unitId, name }라면 아래 nameMap 생성부에서 m.id 대신 m.unitId 사용하세요.
    const nameMap = new Map(
      meta.map((m) => [(m as unknown).id ?? (m as unknown).unitId, m.name])
    );

    // 5) 정렬(선택): unitId 오름차순
    rows.sort((a, b) => a.unitId - b.unitId);

    // 6) 응답 매핑 (unitName 포함)
    const units: UnitPerformanceDTO[] = rows.map((r) => ({
      unitId: r.unitId,
      unitName: nameMap.get(r.unitId) ?? '', // ✅ 이름 합치기
      total: r.total,
      correct: r.correct,
    }));

    // console.log('📊 단원별 풀이 성과:', units);

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
