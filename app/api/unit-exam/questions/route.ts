// ABOUTME: 단원평가 코드로 해당 문제 목록을 조회하는 API (정답은 내려주지 않음)
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/libs/prisma';
import { PrUnitQuestionRepository } from '@/backend/common/infrastructures/repositories/PrUnitQuestionRepository';
import { PrUnitExamRepository } from '@/backend/common/infrastructures/repositories/PrUnitExamRepository';
import { PrUnitExamAttemptRepository } from '@/backend/common/infrastructures/repositories/PrUnitExamAttemptRepository';
import { GetQuestionsUseCase } from '@/backend/unit/Usecases/UnitExamUsecase';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const code = body?.code?.toString().trim().toUpperCase();
    const codePattern = /^[A-Z]{6}-(0[1-9]|[1-5][0-9]|60)$/;
    if (!code || !codePattern.test(code)) {
      return NextResponse.json(
        { success: false, error: '유효한 코드가 아닙니다.' },
        { status: 400 }
      );
    }

    const unitQuestionRepository = new PrUnitQuestionRepository(prisma);
    const usecase = new GetQuestionsUseCase(unitQuestionRepository);
    const result = await usecase.execute({ code });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // 시도기록 생성: 질문을 성공적으로 가져온 최초 진입 시에만 1회 생성
    try {
      const unitExamRepository = new PrUnitExamRepository(prisma);
      const unitExamAttemptRepository = new PrUnitExamAttemptRepository(prisma);
      const unitExam = await unitExamRepository.findByCode(code);
      if (unitExam) {
        const already = await unitExamAttemptRepository.existsByStudentAndExam(
          session.user.id,
          unitExam.id
        );
        if (!already) {
          await unitExamAttemptRepository.create({
            unitCode: code,
            studentId: session.user.id,
            unitExamId: unitExam.id,
          });
        }
      }
    } catch (e) {
      // 시도기록 생성 실패는 문제 응답 자체를 막지 않음
      console.error('시도기록 생성 실패(무시):', e);
    }

    return NextResponse.json({ success: true, questions: result.questions });
  } catch (error) {
    console.error('문제 조회 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
