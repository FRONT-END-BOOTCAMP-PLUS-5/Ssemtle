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

    // meta의 원소가 아래 두 형태 중 하나라고 가정:
    // { id: number; name: string } | { unitId: number; name: string }
    type MetaById = { id: number; name: string };
    type MetaByUnitId = { unitId: number; name: string };

    function isMetaById(x: unknown): x is MetaById {
      if (typeof x !== 'object' || x === null) return false;
      const o = x as { id?: unknown; name?: unknown };
      return typeof o.id === 'number' && typeof o.name === 'string';
    }
    function isMetaByUnitId(x: unknown): x is MetaByUnitId {
      if (typeof x !== 'object' || x === null) return false;
      const o = x as { unitId?: unknown; name?: unknown };
      return typeof o.unitId === 'number' && typeof o.name === 'string';
    }

    const meta = await this.unitRepo.findNamesByIds(unitIds);
    // meta의 런타임 타입을 안전하게 검사해서 Map을 채운다
    const nameMap = new Map<number, string>();
    for (const m of meta as ReadonlyArray<unknown>) {
      if (isMetaById(m)) {
        nameMap.set(m.id, m.name);
      } else if (isMetaByUnitId(m)) {
        nameMap.set(m.unitId, m.name);
      }
    }

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
