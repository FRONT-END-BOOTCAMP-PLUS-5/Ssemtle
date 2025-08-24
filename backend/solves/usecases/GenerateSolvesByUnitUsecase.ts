import { SolveResponseDto } from '../dtos/SolveDto';

type GeminiGenerator = {
  generate: (prompt: string) => Promise<string>;
};

export class GenerateSolvesByUnitUseCase {
  constructor(private readonly gemini: GeminiGenerator) {}
  //unitId로 할지? unit스트링 배열로 할지?
  async execute(unit: string): Promise<SolveResponseDto[]> {
    const prompt = `
"${unit}" 유형의 수학 문제 10개를 아래와 같은 JSON 배열 형식으로 출력해줘.

형식 예시:
[
  {
    "question": "12의 소인수분해는 무엇입니까?",
    "answer": "2² x 3",
    "helpText": "12는 1보다 큰 자연수 중에서 더 이상 나눌 수 없는 수인 '소수'들의 곱으로 나타낼 수 있습니다. 12를 소인수분해하면 먼저 2로 나누면 12 ÷ 2 = 6, 다시 2로 나누면 6 ÷ 2 = 3이 됩니다. 이제 3은 더 이상 2로 나눌 수 없고, 3도 소수이므로 여기서 멈춥니다. 따라서 12 = 2 x 2 x 3 = 2² x 3이 됩니다."
  }
]

주의사항:
- 반드시 위 형식처럼 JSON 배열만 출력해줘.
- 설명, 마크다운, 코드 블록, 주석 없이 순수 JSON으로만 응답해줘.
- 전과 항상 다른 문제를 생성해줘.
- 정답은 하나로 작성하고, 답이 여러개가 나오지 않게 해줘.
- 우리의 입력값이 1~9, +,-,×,/,(),^,√,x,y,π,.,,,이기 때문에, 정답을 이 기호들로 표현할 수 있게 해줘.
- 정답의 공백을 없애줘
- 문제에서는 x⁸, y²처럼 x,y에 지수가 붙을 수 있지만, 정답에서는 x^2,y^2처럼 ^로 표현해줘.
`;

    const rawText = await this.gemini.generate(prompt);

    // 대괄호로 감싼 JSON 배열만 추출
    const match = rawText.match(/\[\s*{[\s\S]*?}\s*\]/);

    if (!match) {
      console.error('❌ JSON 배열 형태를 찾을 수 없습니다.');
      return [];
    }

    const cleanedText = match[0];

    try {
      const parsed: SolveResponseDto[] = JSON.parse(cleanedText);
      return parsed.map((item) => ({
        question: item.question,
        answer: item.answer,
        helpText: item.helpText,
      }));
    } catch (err) {
      console.error('❌ JSON 파싱 실패:', err);
      return [];
    }
  }
}
