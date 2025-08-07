export interface SolveResponseDto {
  question: string;
  answer: string;
  helpText?: string; // Optional field for additional help text
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
