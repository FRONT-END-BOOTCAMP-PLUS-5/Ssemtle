import { SolveResponseDto } from '../dtos/SolveDto';

type GeminiGenerator = {
  generate: (prompt: string) => Promise<string>;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function pickString(
  obj: Record<string, unknown>,
  keys: readonly string[]
): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim() !== '') return v;
  }
  return undefined;
}

function stripAnswerSpaces(s: string): string {
  // 답 공백 제거 규칙
  return s.replace(/\s+/g, '');
}

// 코드펜스/앞뒤 잡텍스트 제거 후 JSON 배열만 뽑기
function extractJsonArray(raw: string): string | null {
  // 1) ```json ... ``` 내부
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const inside = fence ? fence[1] : raw;

  // 2) 배열만 추출 (가장 바깥 [ ... ] )
  const arr = inside.match(/\[\s*{[\s\S]*}\s*\]/);
  return arr ? arr[0] : null;
}

export class GenerateSolvesByUnitUseCase {
  constructor(private readonly gemini: GeminiGenerator) {}

  async execute(unit: string): Promise<SolveResponseDto[]> {
    const prompt = `
"${unit}" 유형의 수학 문제 10개를 아래와 같은 JSON 배열 형식으로 출력해줘.

형식 예시:
[
  {
    "question": "12의 소인수분해는 무엇입니까?",
    "answer": "2^2x3",
    "helpText": "12는 1보다 큰 자연수 중에서 더 이상 나눌 수 없는 수인 '소수'들의 곱으로 나타낼 수 있습니다. 12를 소인수분해하면 먼저 2로 나누면 12 ÷ 2 = 6, 다시 2로 나누면 6 ÷ 2 = 3이 됩니다. 이제 3은 더 이상 2로 나눌 수 없고, 3도 소수이므로 여기서 멈춥니다. 따라서 12 = 2 x 2 x 3 = 2² x 3이 됩니다."
  }
]

주의사항:
- 반드시 위 형식처럼 JSON 배열만 출력해줘.
- 설명, 마크다운, 코드 블록, 주석 없이 순수 JSON으로만 응답해줘.
- 전과 항상 다른 문제를 생성해줘.
- 정답은 하나로 작성하고, 답이 여러개가 나오지 않게 해줘.
- 우리의 입력값이 1~9, +,-,×,/,(),^,√,x,y,π,.,,,이기 때문에, 정답을 이 기호들만 표현할 수 있게 해줘. 따라서 문제에서 a,b,c같은 문자가 나오면 안돼.
- 정답의 공백을 없애줘(예: "2 x 3" -> "2x3").
- 문제에서는 x⁸, y²처럼 x,y에 지수가 붙을 수 있지만, 정답에서는 x^2,y^2처럼 ^로 표현해줘.
- 문제에서 x의 값은? 이라고 물어보면 답은 "x=2"처럼 쓰지 말고, "2"만 써줘.
- helpText는 문제 해설이고, 풀이과정을 자세하게 적어줘. 기초학력 학생이 이용할테니까 최대한 자세하고 이해하기 쉽게.
- **키 이름은 반드시 question / answer / helpText만 사용**해줘.
`;

    const rawText = await this.gemini.generate(prompt);

    const jsonText = extractJsonArray(rawText);
    if (!jsonText) {
      console.error('❌ JSON 배열 형태를 찾을 수 없습니다.');
      return [];
    }

    let parsedUnknown: unknown;
    try {
      parsedUnknown = JSON.parse(jsonText);
    } catch (err) {
      console.error('❌ JSON 파싱 실패:', err);
      return [];
    }

    if (!Array.isArray(parsedUnknown)) {
      console.error('❌ 최상위가 배열이 아닙니다.');
      return [];
    }

    // 다양한 키(nearly-synonyms)를 helpText로 정규화
    const HELP_KEYS = [
      'helpText',
      'help_text',
      'explanation',
      'explain',
      'help',
      'hint',
    ] as const;
    const QUESTION_KEYS = ['question', 'q', 'problem'] as const;
    const ANSWER_KEYS = ['answer', 'ans', 'solution', 'result'] as const;

    const out: SolveResponseDto[] = [];

    for (const item of parsedUnknown) {
      if (!isRecord(item)) continue;

      const question = pickString(item, QUESTION_KEYS);
      const answerRaw = pickString(item, ANSWER_KEYS);
      const help = pickString(item, HELP_KEYS);

      if (!question || !answerRaw) {
        // 필수값이 없으면 스킵
        continue;
      }
      console.log('==== 문제 ====');
      console.log('question:', question, '| length:', question.length);
      console.log('answer:', answerRaw, '| length:', answerRaw.length);
      console.log('helpText length:', (help ?? '').length);

      out.push({
        question,
        answer: stripAnswerSpaces(answerRaw),
        helpText: help ?? '', // 없으면 빈 문자열로 통일
      });
    }

    return out;
  }
}
