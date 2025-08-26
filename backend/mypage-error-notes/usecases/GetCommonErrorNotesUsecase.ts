// ABOUTME: 지정한 날짜의 일반 풀이(solves) 오답 노트를 조회하는 유스케이스

import { IErrorNotesSolveRepository } from '@/backend/common/infrastructures/repositories/IErrorNotesSolveRepository';
import {
  GetErrorNotesRequestDto,
  GetErrorNotesResponseDto,
} from '../dtos/ErrorNotesDto';

export class GetCommonErrorNotesUsecase {
  private solveRepository: IErrorNotesSolveRepository;

  constructor(solveRepository: IErrorNotesSolveRepository) {
    this.solveRepository = solveRepository;
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

    console.log('[CommonErrorNotes] 요청 파라미터', request);
    const hasDate = Boolean(request.date);
    const range = hasDate
      ? this.getDateRange(request.date as string)
      : undefined;
    if (hasDate) {
      console.log('[CommonErrorNotes] 날짜 범위', range);
    } else {
      console.log('[CommonErrorNotes] 날짜 미지정 → 전체 기간 조회');
    }

    const dailySolveCount = await this.solveRepository.countByUserAndDate(
      request.userId,
      range?.start,
      range?.end
    );

    const wrongSolves = await this.solveRepository.findWrongByUserAndDate(
      request.userId,
      range?.start,
      range?.end
    );

    const items = wrongSolves.map((s) => ({
      question: s.question,
      answer: s.answer,
      helpText: s.helpText,
      userInput: s.userInput,
      isCorrect: s.isCorrect,
      created_at: s.createdAt.toISOString(),
      unit_name: s.unit.name,
      vid_url: s.unit.vidUrl,
      source: 'solve' as const,
    }));

    return {
      question_nums: dailySolveCount.total,
      is_correct_nums: dailySolveCount.correct,
      items,
    };
  }
}
