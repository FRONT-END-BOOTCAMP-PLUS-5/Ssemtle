import { GenerateSolvesByUnitUseCase } from '@/backend/solves/usecases/GenerateSolvesByUnitUseCase';
import { callGemini } from '@/libs/gemini/callGemini';
import { NextRequest, NextResponse } from 'next/server';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unit = searchParams.get('unit');
  console.log('✅ 요청 받은 카테고리:', unit); // ✅ 추가
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
  console.log('🟡 생성된 문제 리스트:', JSON.stringify(solves, null, 2)); // 👈 확인
  return NextResponse.json(solves);
}

// POST /api/solves
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 필수 필드 유효성 검사
    const {
      question,
      answer,
      helpText,
      userInput,
      isCorrect,
      unitId,
      userId,
    } = body;

    if (
      !question ||
      !answer ||
      helpText === undefined ||
      userInput === undefined ||
      isCorrect === undefined ||
      !unitId ||
      !userId
    ) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

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
