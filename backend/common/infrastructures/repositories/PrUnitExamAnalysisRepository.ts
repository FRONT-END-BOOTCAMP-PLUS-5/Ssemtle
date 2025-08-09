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

    // solves + questions JOIN으로 unit_code당 total/correct 집계
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

    // attempts (선택): 학생이 해당 unit_code로 시도한 횟수
    const attemptsRows: Array<{ unit_code: string; attempts: bigint }> =
      await prisma.$queryRaw(
        Prisma.sql`
          SELECT unit_code, COUNT(*)::bigint AS attempts
          FROM unit_exam_attempts
          WHERE student_id = ${userId}
            ${from ? Prisma.sql`AND created_at >= ${from}` : Prisma.empty}
            ${to ? Prisma.sql`AND created_at <= ${to}` : Prisma.empty}
          GROUP BY unit_code
        `
      );

    const attemptsMap = new Map<string, number>();
    for (const a of attemptsRows) {
      attemptsMap.set(a.unit_code, Number(a.attempts));
    }

    return solvesRows.map((r) => ({
      unitCode: r.unit_code,
      total: Number(r.total),
      correct: Number(r.correct),
      attempts: attemptsMap.get(r.unit_code) ?? 0,
    }));
  }
}
