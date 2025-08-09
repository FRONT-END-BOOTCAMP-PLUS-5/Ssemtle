// backend/temp/usecases/GetStudentUnitExamAnalysisUseCase.ts
import {
  GetStudentUnitExamAnalysisRequestDTO,
  GetStudentUnitExamAnalysisResponseDTO,
} from '../dtos/GetStudentUnitExamAnalysisDTO';
import {
  UnitExamAnalysisRepository,
  UnitExamAggregationFilter,
} from '../../common/domains/repositories/UnitExamAnalysisRepository';

export class GetStudentUnitExamAnalysisUseCase {
  constructor(private readonly repo: UnitExamAnalysisRepository) {}

  async execute(
    req: GetStudentUnitExamAnalysisRequestDTO
  ): Promise<GetStudentUnitExamAnalysisResponseDTO> {
    if (!req?.userId || req.userId.trim() === '') {
      throw new Error('userId is required');
    }
    const fromDate = parseDate(req.from);
    const toDate = parseDate(req.to);

    const filter: UnitExamAggregationFilter = {
      userId: req.userId,
      from: fromDate,
      to: toDate,
    };
    const rows = await this.repo.aggregateByUnitCode(filter);

    return {
      studentId: req.userId,
      range: { from: toYMD(fromDate), to: toYMD(toDate) },
      units: rows,
    };
  }
}

function parseDate(iso?: string): Date | undefined {
  if (!iso) return;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? undefined : d;
}
function toYMD(d?: Date): string | undefined {
  if (!d) return;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
