// lib/gemini/generateProblemsByCategory.ts
import { callGemini } from './gemini/callGemini';

export interface GeneratedProblem {
  question: string;
  answer: string;
  helpUrl?: string;
}

export async function generateProblemsByCategory(
  categoryId: number
): Promise<GeneratedProblem[]> {
  const categoryPrompt = getPromptByCategory(categoryId);

  const geminiResponse = await callGemini(
    `${categoryPrompt}\n문제 10개와 정답만 JSON 형태로 만들어줘.`
  );

  // 예시 응답 포맷 파싱
  const parsed = JSON.parse(geminiResponse);
  return parsed as GeneratedProblem[];
}

function getPromptByCategory(categoryId: number): string {
  return `다음 카테고리의 문제를 생성해줘: ${categoryId}.
          문제는 주관식으로, 각 문제에 대한 정답도 포함해야 해.
          각 문제는 다음 형식으로 작성해줘:
          { "question": "문제 내용",
           "answer": "정답 내용",
           }`;
}
