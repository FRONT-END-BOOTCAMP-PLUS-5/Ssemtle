import { GenerateSolvesByUnitUseCase } from '@/backend/solves/usecases/GenerateSolvesByUnitUseCase';
import { callGemini } from '@/libs/gemini/callGemini';
import { NextRequest, NextResponse } from 'next/server';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';

// GET /api/solves?unit=unitName
// unitName은 문제 유형 (예: "소인수분해", "미분적분" 등)으로, 이 유형에 맞는 문제를 생성합니다.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unit = searchParams.get('unit');
  if (!unit) {
    return NextResponse.json(
      { error: '카테고리를 입력하세요' },
      { status: 400 }
    );
  }

  const usecase = new GenerateSolvesByUnitUseCase({
    async generate(prompt: string) {
      const result = await callGemini(prompt);
      return result;
    },
  });

  const solves = await usecase.execute(unit);
  return NextResponse.json(solves);
}

// POST /api/solves
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 필수 필드 유효성 검사
    const { question, answer, helpText, userInput, unitId, userId } = body;

    if (
      !question ||
      !answer ||
      helpText === undefined ||
      userInput === undefined ||
      !unitId ||
      !userId
    ) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const isCorrect = String(userInput).trim() === String(answer).trim();

    // SolveRepository 주입 및 저장
    const repo = new PrSolveRepository();

    const created = await repo.create({
      question,
      answer,
      helpText,
      userInput,
      isCorrect,
      unitId,
      userId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('❌ Solve 저장 중 오류:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
