// backend/common/infrastructures/repositories/PrUnitExamAnalysisRepository.ts
import { Prisma } from '@prisma/client';
import {
  UnitExamAnalysisRepository,
  UnitExamAggregationFilter,
  UnitExamAggRow,
} from '../../domains/repositories/UnitExamAnalysisRepository';
import prisma from '@/libs/prisma';

export class PrUnitExamAnalysisRepository
  implements UnitExamAnalysisRepository
{
  async aggregateByUnitCode(
    filter: UnitExamAggregationFilter
  ): Promise<UnitExamAggRow[]> {
    const { userId, from, to } = filter;

    const solvesRows: Array<{
      unit_code: string;
      total: bigint;
      correct: bigint;
    }> = await prisma.$queryRaw(
      Prisma.sql`
          SELECT q.unit_code,
                 COUNT(*)::bigint AS total,
                 SUM(CASE WHEN s.is_correct THEN 1 ELSE 0 END)::bigint AS correct
          FROM unit_solves s
          JOIN unit_questions q ON q.id = s.question_id
          WHERE s.user_id = ${userId}
            ${from ? Prisma.sql`AND s.created_at >= ${from}` : Prisma.empty}
            ${to ? Prisma.sql`AND s.created_at <= ${to}` : Prisma.empty}
          GROUP BY q.unit_code
          ORDER BY q.unit_code ASC
        `
    );

    return solvesRows.map((r) => ({
      unitCode: r.unit_code,
      total: Number(r.total),
      correct: Number(r.correct),
    }));
  }
}
