// backend/common/domains/repositories/UnitExamAnalysisRepository.ts
export type UnitExamAggregationFilter = {
  userId: string;
  from?: Date;
  to?: Date;
};

export type UnitExamAggRow = {
  unitCode: string;
  total: number;
  correct: number;
  attempts?: number;
};

export interface UnitExamAnalysisRepository {
  aggregateByUnitCode(
    filter: UnitExamAggregationFilter
  ): Promise<UnitExamAggRow[]>;
}
