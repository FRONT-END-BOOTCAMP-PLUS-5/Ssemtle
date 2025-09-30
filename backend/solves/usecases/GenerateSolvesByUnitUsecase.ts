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
    // 프롬프트 생성 (영문만 사용)
    // NOTE(ko): 한글 프롬프트는 현재 사용하지 않음 (검토용 주석만 유지)
    const englishPrompt = this.buildPromptEnglish(unit);

    const rawText = await this.gemini.generate(englishPrompt);

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
      out.push({
        question,
        answer: stripAnswerSpaces(answerRaw),
        helpText: help ?? '', // 없으면 빈 문자열로 통일
      });
    }

    return out;
  }

  // NOTE(ko): 한글 프롬프트 생성기는 현재 미사용. (주석 유지: 규칙 검토용)
  // private buildPromptKorean(unit: string): string {
  //   return `...`;
  // }

  // 영어 프롬프트 생성기
  private buildPromptEnglish(unit: string): string {
    // NOTE(ko): 모든 카테고리는 해당 카테고리(단원) 문제만 생성하도록 강제
    // NOTE(ko): "정수와 유리수의 사칙계산" 단원일 경우 소인수분해 문제만 생성하도록 강제
    const primeFactorizationClause = unit.includes('정수와 유리수의 사칙계산')
      ? `
Additional strict rule for this unit:
- Generate ONLY prime factorization problems (e.g., "What is the prime factorization of 28?"). Do NOT include any other types such as simplification, arithmetic operations, or equations.
- For prime factorization answers, use the multiplication sign '×' between factors (not 'x'), e.g., 28 → "2^2×7", 12 → "2^2×3".`
      : '';
    const categoryExclusivity = `
Global rule:
- Generate problems that STRICTLY belong to the topic "${unit}". Do NOT produce any problems that are outside this topic/category.`;

    return `
Generate 10 math problems of the type "${unit}" and output them as a JSON array.

Example format:
[
  {
    "question": "What is the prime factorization of 12?",
    "answer": "2^2×3",
    "helpText": "Provide a detailed explanation suitable for students building foundational skills."
  }
]

Constraints:
- Respond ONLY with a JSON array in the exact format above.
- No explanations, markdown, code fences, or comments outside the JSON.
- Always generate different problems from previous calls.
 - All textual content must be written in Korean. Write "question" and "helpText" in Korean.
- Ensure exactly one answer. Do not produce multiple possible answers.
- Our input supports 1-9, +,-,×,/,(),^,√,x,y,π,.,,, so ensure answers can be expressed with these. Do not introduce variables like a,b,c in answers.
- Remove spaces in the answer (e.g., "2 x 3" -> "2x3").
- For prime factorization problems, use the multiplication sign '×' between factors (do not use 'x').
  Examples: 28 → "2^2×7", 12 → "2^2×3".
- Problems may use exponents like x⁸,y², but answers must use ^ like x^2,y^2.
- If the question asks for the value of x, do not answer "x=2"; answer "2" only.
- helpText must be a detailed explanation, easy to understand for students.
- Use EXACT keys: question / answer / helpText.
${primeFactorizationClause}
${categoryExclusivity}
`;
  }
}
