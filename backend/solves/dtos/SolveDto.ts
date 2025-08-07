export interface SolveResponseDto {
  question: string;
  answer: string;
  helpUrl: string;
}

export interface CreateSolveDto {
  question: string;
  answer: string;
  helpUrl: string;
  userInput: string;
  isCorrect: boolean;
  categoryId: number;
  userId: string;
}
