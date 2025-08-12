// ABOUTME: 지정한 날짜의 단원평가(unit_solves) 오답 노트를 조회하는 유스케이스

import { IUnitSolveRepository } from '@/backend/common/domains/repositories/IUnitSolveRepository';
import {
  GetErrorNotesRequestDto,
  GetErrorNotesResponseDto,
} from '../dtos/ErrorNotesDto';

export class GetUnitEvalErrorNotesUsecase {
  private unitSolveRepository: IUnitSolveRepository;

  constructor(unitSolveRepository: IUnitSolveRepository) {
    this.unitSolveRepository = unitSolveRepository;
  }

  private getDateRange(dateStr: string): { start: Date; end: Date } {
    const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
    if (!y || !m || !d) throw new Error('유효하지 않은 날짜 형식입니다.');
    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    const end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
    return { start, end };
  }

  async execute(
    request: GetErrorNotesRequestDto
  ): Promise<GetErrorNotesResponseDto> {
    if (!request.userId) throw new Error('유효하지 않은 사용자입니다.');

    console.log('[UnitEvalErrorNotes] 요청 파라미터', request);
    const hasDate = Boolean(request.date);
    const range = hasDate
      ? this.getDateRange(request.date as string)
      : undefined;
    if (hasDate) {
      console.log('[UnitEvalErrorNotes] 날짜 범위', range);
    } else {
      console.log('[UnitEvalErrorNotes] 날짜 미지정 → 전체 기간 조회');
    }

    const dailyUnitSolveCount =
      await this.unitSolveRepository.countByUserAndDate(
        request.userId,
        range?.start,
        range?.end
      );

    const wrongUnitSolves = await this.unitSolveRepository.findByUserAndDate(
      request.userId,
      range?.start,
      range?.end,
      true
    );

    const items = wrongUnitSolves.map((r) => ({
      question: r.question.question,
      answer: r.question.answer,
      userInput: r.userInput,
      isCorrect: r.isCorrect,
      created_at: r.createdAt.toISOString(),
      unit_name: r.question.unit.name,
      vid_url: r.question.unit.vidUrl,
      source: 'unitSolve' as const,
    }));

    return {
      question_nums: dailyUnitSolveCount.total,
      is_correct_nums: dailyUnitSolveCount.correct,
      items,
    };
  }
}
