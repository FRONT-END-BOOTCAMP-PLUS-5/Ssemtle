import { SolveResponseDto } from '../dtos/SolveDto';

type GeminiGenerator = {
  generate: (prompt: string) => Promise<string>;
};

export class GenerateSolvesByCategoryUseCase {
  constructor(private readonly gemini: GeminiGenerator) {}

  async execute(category: string): Promise<SolveResponseDto[]> {
    const prompt = `${category} 유형의 수학 문제 10개를 다음 형식으로 만들어줘: 
    \n문제: ... \n답: ... \nURL: ...\n10개를 배열로.`;

    const text = await this.gemini.generate(prompt);

    // 간단한 파싱 (예: \n문제: ...\n답: ...\nURL: ...)
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    const results: SolveResponseDto[] = [];

    for (let i = 0; i < lines.length; i += 3) {
      results.push({
        question: lines[i]?.replace('문제:', '').trim(),
        answer: lines[i + 1]?.replace('답:', '').trim(),
        helpUrl: lines[i + 2]?.replace('URL:', '').trim(),
      });
    }

    return results;
  }
}
