import { callGemini } from '@/backend/common/infrastructures/LLM/callGemini';
import { NextRequest, NextResponse } from 'next/server';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { verifyAnswer } from '@/backend/utils/answer-verification';
import { GenerateSolvesByUnitUseCase } from '@/backend/solves/usecases/GenerateSolvesByUnitUsecase';

// Next.js: Gemini 호출은 Node.js 런타임에서 수행 (Edge 환경에서 fetch 헤더 제약 회피)
export const runtime = 'nodejs';

// GET /api/solves?unit=unitName
// unitName은 문제 유형 (예: "소인수분해", "미분적분" 등)으로, 이 유형에 맞는 문제를 생성합니다.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unit = searchParams.get('unit');
    // benchmarkParam 은 더 이상 사용하지 않음 (프롬프트 벤치마크 제거)
    if (!unit) {
      return NextResponse.json(
        { error: '카테고리를 입력하세요' },
        { status: 400 }
      );
    }

    const usecase = new GenerateSolvesByUnitUseCase({
      async generate(prompt: string) {
        try {
          const result = await callGemini(prompt);
          return result;
        } catch (error) {
          // 내부 로깅 후 상위로 전달
          console.error('❌ Gemini 호출 오류:', error);
          throw error;
        }
      },
    });

    const solves = await usecase.execute(unit);
    return NextResponse.json(solves);
  } catch (error) {
    // 운영 환경에서 문제 원인 파악을 위한 안전한 에러 표준화 응답
    const message =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';

    // 공통적인 Gemini 오류 메시지 매핑 (노출은 일반화, 콘솔은 상세)
    const isGeminiAuth = /GEMINI_API_KEY|401|403|permission|unauthorized/i.test(
      message
    );
    const isGeminiQuota = /quota|rate|429/i.test(message);
    const isGeminiBadReq = /(Gemini HTTP 4\d\d|invalid|bad request)/i.test(
      message
    );
    const isServerParse = /Failed to parse Gemini response/i.test(message);

    if (isGeminiAuth) {
      console.error('❌ Gemini 인증/권한 오류:', message);
    } else if (isGeminiQuota) {
      console.error('❌ Gemini 할당량/레이트 제한 오류:', message);
    } else if (isGeminiBadReq) {
      console.error('❌ Gemini 요청 형식 오류:', message);
    } else if (isServerParse) {
      console.error('❌ Gemini 응답 파싱 오류:', message);
    } else {
      console.error('❌ 문제 생성 API 처리 중 오류:', message);
    }

    // 클라이언트에는 일반화된 메시지와 상태코드 제공
    const status = isGeminiAuth
      ? 502
      : isGeminiQuota
        ? 429
        : isGeminiBadReq
          ? 400
          : 500;
    const clientMessage = isGeminiAuth
      ? '외부 AI 서비스 인증 문제로 문제 생성에 실패했습니다. 잠시 후 다시 시도하세요.'
      : isGeminiQuota
        ? 'AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도하세요.'
        : isGeminiBadReq || isServerParse
          ? '문제를 생성하는 중 오류가 발생했습니다. 단원을 바꾸어 다시 시도해보세요.'
          : '서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.';

    return NextResponse.json({ error: clientMessage }, { status });
  }
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

    const isCorrect = verifyAnswer(String(userInput), String(answer));

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
