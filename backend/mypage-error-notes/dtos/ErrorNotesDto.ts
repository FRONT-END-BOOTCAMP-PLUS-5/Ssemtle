// ABOUTME: 오답 노트 요청/응답 DTO

export type GetErrorNotesRequestDto = {
  userId: string;
  date?: string; // YYYY-MM-DD (현지 기준) - 없으면 전체 기간
};

export type ErrorNoteItem = {
  // create_at, user_id, id 제외 나머지 필드 전달
  question?: string;
  answer?: string;
  helpText?: string;
  userInput: string;
  isCorrect: boolean;
  created_at: string; // ISO
  unit_name: string;
  vid_url: string;
  source: 'solve' | 'unitSolve';
};

export type GetErrorNotesResponseDto = {
  question_nums: number; // 전체 문제 수
  is_correct_nums: number; // 맞은 문제 수
  items: ErrorNoteItem[]; // 오답 상세 (일반 + 단원평가)
};
