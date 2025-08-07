import { GenerateSolvesByUnitUseCase } from '@/backend/solves/usecases/GenerateSolvesByUnitUseCase';
import { callGemini } from '@/libs/gemini/callGemini';
import { NextRequest, NextResponse } from 'next/server';

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
