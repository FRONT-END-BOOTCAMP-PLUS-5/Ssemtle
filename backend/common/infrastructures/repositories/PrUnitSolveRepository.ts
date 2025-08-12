// ABOUTME: Prisma를 사용한 UnitSolve Repository 구현체
import { PrismaClient } from '@prisma/client';
import {
  CreateUnitSolveData,
  IUnitSolveRepository,
} from '../../domains/repositories/IUnitSolveRepository';
import { Prisma } from '@prisma/client';

export class PrUnitSolveRepository implements IUnitSolveRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createMany(data: CreateUnitSolveData[]): Promise<number> {
    try {
      if (data.length === 0) return 0;
      const result = await this.prisma.unitSolve.createMany({ data });
      return result.count;
    } catch (error) {
      console.error('UnitSolve 일괄 생성 오류:', error);
      throw new Error('단원평가 답안 저장에 실패했습니다.');
    }
  }

  async findByUserIdWithQuestion(userId: string) {
    try {
      const rows = await this.prisma.unitSolve.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          questionId: true,
          userInput: true,
          isCorrect: true,
          createdAt: true,
          question: { select: { question: true, answer: true } },
        },
      });
      return rows;
    } catch (error) {
      console.error('UnitSolve 조회 오류:', error);
      throw new Error('문제 풀이 조회에 실패했습니다.');
    }
  }

  async findByUserAndDate(
    userId: string,
    start?: Date,
    end?: Date,
    onlyWrong?: boolean
  ) {
    try {
      const createdAt = start && end ? { gte: start, lt: end } : undefined;
      const where: Prisma.UnitSolveWhereInput = {
        userId,
        ...(createdAt ? { createdAt } : {}),
      };
      if (onlyWrong) where.isCorrect = false;

      const rows = await this.prisma.unitSolve.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          userInput: true,
          isCorrect: true,
          createdAt: true,
          question: {
            select: {
              question: true,
              answer: true,
              unit: { select: { id: true, name: true, vidUrl: true } },
            },
          },
        },
      });
      return rows;
    } catch (error) {
      console.error('UnitSolve 날짜/오답 조회 오류:', error);
      throw new Error('단원평가 오답 조회에 실패했습니다.');
    }
  }

  async countByUserAndDate(userId: string, start?: Date, end?: Date) {
    try {
      const createdAt = start && end ? { gte: start, lt: end } : undefined;
      const [total, correct] = await Promise.all([
        this.prisma.unitSolve.count({
          where: { userId, ...(createdAt ? { createdAt } : {}) },
        }),
        this.prisma.unitSolve.count({
          where: {
            userId,
            isCorrect: true,
            ...(createdAt ? { createdAt } : {}),
          },
        }),
      ]);
      return { total, correct };
    } catch (error) {
      console.error('UnitSolve 카운트 조회 오류:', error);
      throw new Error('단원평가 정답률 조회에 실패했습니다.');
    }
  }
}
