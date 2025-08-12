// ABOUTME: Prisma를 사용하는 오답 노트용 solves 전용 리포지토리 구현체

import prisma from '@/libs/prisma';
import { IErrorNotesSolveRepository } from './IErrorNotesSolveRepository';

export class PrErrorNotesSolveRepository implements IErrorNotesSolveRepository {
  async findWrongByUserAndDate(userId: string, start: Date, end: Date) {
    const rows = await prisma.solve.findMany({
      where: {
        userId,
        isCorrect: false,
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        question: true,
        answer: true,
        helpText: true,
        userInput: true,
        isCorrect: true,
        createdAt: true,
        unitId: true,
        unit: { select: { name: true, vidUrl: true } },
      },
    });
    return rows;
  }

  async countByUserAndDate(userId: string, start: Date, end: Date) {
    const [total, correct] = await Promise.all([
      prisma.solve.count({
        where: { userId, createdAt: { gte: start, lt: end } },
      }),
      prisma.solve.count({
        where: { userId, isCorrect: true, createdAt: { gte: start, lt: end } },
      }),
    ]);
    return { total, correct };
  }
}
