// ABOUTME: 단원평가 비즈니스 로직을 담당하는 UseCase
// ABOUTME: 코드 생성, 검증, 중복 체크, AI 문제 생성, 시도 기록 등의 핵심 비즈니스 규칙 구현

import { IUnitExamRepository } from '../../common/domains/repositories/IUnitExamRepository';
import { IUnitQuestionRepository } from '../../common/domains/repositories/IUnitQuestionRepository';
import { IUnitExamAttemptRepository } from '../../common/domains/repositories/IUnitExamAttemptRepository';
import { IUnitSolveRepository } from '../../common/domains/repositories/IUnitSolveRepository';
import { callGemini } from '../../common/infrastructures/LLM/callGemini';
import {
  GenerateUnitExamRequestDto,
  UnitExamGenerationResult,
  VerifyUnitExamRequestDto,
  UnitExamVerificationResult,
  AIGeneratedQuestion,
  AIQuestionGenerationResult,
  CreateExamAttemptRequestDto,
  ExamAttemptResult,
  GetQuestionsRequestDto,
  GetQuestionsResult,
  SubmitAnswersRequestDto,
  SubmitAnswersResult,
  // 조회 결과 DTO는 새로 정의하지 않고 이 UseCase 내부에서 단순 객체로 반환
} from '../dtos/UnitExamDto';
import { AIQuestionValidator } from '@/backend/common/domains/entities/AIQuestionValidator';

export class GenerateUnitExamUseCase {
  private unitExamRepository: IUnitExamRepository;
  private unitQuestionRepository: IUnitQuestionRepository;
  private linearEquationValidator?: AIQuestionValidator;

  constructor(
    unitExamRepository: IUnitExamRepository,
    unitQuestionRepository: IUnitQuestionRepository,
    linearEquationValidator?: AIQuestionValidator
  ) {
    this.unitExamRepository = unitExamRepository;
    this.unitQuestionRepository = unitQuestionRepository;
    this.linearEquationValidator = linearEquationValidator;
  }

  async execute(
    request: GenerateUnitExamRequestDto
  ): Promise<UnitExamGenerationResult> {
    try {
      // 입력 파라미터 유효성 검증
      // 환경 변수 확인: GEMINI_API_KEY 없으면 동작 금지
      if (!process.env.GEMINI_API_KEY) {
        return {
          success: false,
          error: 'GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.',
        };
      }

      // 입력 데이터 유효성 검증
      if (!request.selectedUnits || request.selectedUnits.length === 0) {
        return {
          success: false,
          error: '최소 1개 이상의 단원을 선택해주세요.',
        };
      }

      if (!request.questionCount || request.questionCount <= 0) {
        return {
          success: false,
          error: '문제 개수는 1개 이상이어야 합니다.',
        };
      }

      // 카테고리 수 이하의 문제 개수 불가: 각 카테고리 최소 1문제 배분 전제
      if (
        Array.isArray(request.selectedUnits) &&
        request.selectedUnits.length > 0 &&
        request.questionCount < request.selectedUnits.length
      ) {
        return {
          success: false,
          error:
            '문제 개수는 선택한 카테고리 수 이상이어야 합니다. 문제 개수를 늘려주세요.',
        };
      }

      // 랜덤 코드 생성 (영어 대문자 6글자)
      const code = this.generateRandomCode();

      // 코드 중복 체크
      const isDuplicate = await this.unitExamRepository.existsByCode(code);
      if (isDuplicate) {
        // 중복된 경우 재귀적으로 다시 생성
        return this.execute(request);
      }

      // AI를 사용하여 문제 생성: 요청 수를 여유분(+5) 포함하여 요청
      const overRequest = request.questionCount + 5;
      console.log('[UnitExam] 검증 준비 시작', {
        requested: request.questionCount,
        overRequest,
        selectedUnits: request.selectedUnits.map((u) => u.unitName),
      });
      const aiResult = await this.generateQuestionsWithAI(
        request.selectedUnits,
        overRequest
      );

      // AI 생성 실패 시 중단
      if (
        !aiResult.success ||
        !aiResult.questions ||
        aiResult.questions.length === 0
      ) {
        return {
          success: false,
          error: aiResult.error || 'AI 문제 생성에 실패했습니다.',
        };
      }

      // 생성 문제 검증 및 선별 (일차방정식 단원에 한하여 검증 실시)
      const validated: AIGeneratedQuestion[] = this.filterValidatedQuestions(
        aiResult.questions,
        request.selectedUnits
      );
      console.log('[UnitExam] 1차 검증 샘플', {
        sample: validated.slice(0, 1).map((q) => ({
          unitId: q.unitId,
          question: q.question,
          answer: q.answer,
        })),
      });
      console.log('[UnitExam] 1차 검증 통과 수', {
        validated: validated.length,
        totalFetched: aiResult.questions.length,
      });

      // 부족하면 재시도 한 번 더 수행 (부족한 수 + 5개 재요청)
      if (validated.length < request.questionCount) {
        const missing = request.questionCount - validated.length;
        const retryCount = Math.max(missing + 5, 5);
        const retry = await this.generateQuestionsWithAI(
          request.selectedUnits,
          retryCount
        );
        if (retry.success && retry.questions) {
          const moreValidated = this.filterValidatedQuestions(
            retry.questions,
            request.selectedUnits
          );
          console.log('[UnitExam] 재요청 및 검증 결과', {
            retryRequested: retryCount,
            retryFetched: retry.questions.length,
            retryValidated: moreValidated.length,
          });
          validated.push(
            ...moreValidated.filter(
              (q) => !validated.some((v) => v.question === q.question)
            )
          );
        }
      }

      if (validated.length < request.questionCount) {
        console.warn('[UnitExam] 유효 문제 부족', {
          need: request.questionCount,
          have: validated.length,
        });
        return {
          success: false,
          error: '유효한 문제 수가 부족합니다. 다시 시도해주세요.',
        };
      }

      // 세션에서 전달된 교사 ID 사용
      const teacherId = request.teacherId as string;

      // 단원평가 생성 및 저장 (AI 성공 이후에 수행)
      const unitExam = await this.unitExamRepository.create({
        code,
        teacherId,
      });

      // 검증 통과한 문제 중 요청 개수만큼 저장
      console.log('[UnitExam] 저장 진행', {
        saveCount: request.questionCount,
      });
      await this.saveGeneratedQuestions(
        validated.slice(0, request.questionCount),
        code,
        teacherId
      );

      return {
        success: true,
        code: unitExam.code,
        examId: unitExam.id,
      };
    } catch (_error) {
      console.error('단원평가 생성 오류:', _error);
      return {
        success: false,
        error: '단원평가 생성 중 오류가 발생했습니다.',
      };
    }
  }

  // 랜덤 코드 생성 메서드 (영어 대문자 6글자)
  private generateRandomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }

  // 일차방정식 검증 적용: 단원명이 일치하는 경우에만 validator 실행, 그 외 단원은 통과
  private filterValidatedQuestions(
    questions: AIGeneratedQuestion[],
    selectedUnits: Array<{ unitId: number; unitName: string }>
  ): AIGeneratedQuestion[] {
    const unitIdToName = new Map<number, string>(
      selectedUnits.map((u) => [u.unitId, u.unitName])
    );

    return questions.filter((q) => {
      const name = unitIdToName.get(q.unitId) || '';
      const isLinear = /일차방정식|1차방정식/.test(name);
      if (isLinear && this.linearEquationValidator) {
        // 디버깅: AI 원본과 기대 정답 출력
        console.log('[UnitExam][Validate] AI 원본', {
          unitName: name,
          question: q.question,
          expected: q.answer,
        });
        const res = this.linearEquationValidator.validate(q, name);
        // 디버깅: 검증 결과와 사유 출력
        console.log('[UnitExam][Validate] 결과', {
          isValid: res.isValid,
          reason: res.reason,
        });
        return res.isValid;
      }
      // 다른 단원은 현재 검증 미적용 → 통과
      return true;
    });
  }

  // AI를 사용하여 문제 생성
  private async generateQuestionsWithAI(
    selectedUnits: Array<{ unitId: number; unitName: string }>,
    questionCount: number
  ): Promise<AIQuestionGenerationResult> {
    try {
      // 프롬프트 생성
      const prompt = this.createPrompt(selectedUnits, questionCount);

      // Gemini AI 호출
      const response = await callGemini(prompt);

      // JSON 응답 파싱
      const questions = this.parseAIResponse(response);

      return {
        success: true,
        questions,
      };
    } catch (_error) {
      console.error('AI 문제 생성 오류:', _error);
      return {
        success: false,
        error: 'AI 문제 생성에 실패했습니다.',
      };
    }
  }

  // AI 프롬프트 생성
  private createPrompt(
    selectedUnits: Array<{ unitId: number; unitName: string }>,
    questionCount: number
  ): string {
    const unitsJson = JSON.stringify(selectedUnits);

    return `기초학력을 위한 수학 문제를 생성하라. 해설은 학생이 이해하기 쉽게 자세히 작성한다.
단원 목록(단원명과 저장용 식별자 포함)은 다음과 같다: ${unitsJson}
총 문제 수는 ${questionCount}개이며, 단원별 문제 비율은 가능한 비슷하게 분배한다.
오직 JSON 배열로만 응답하라. 각 항목은 아래 형식을 따른다.
{
  "unitId": number,
  "question1": string, // 문제 설명 텍스트 (예: "x의 값을 구하시오")
  "question2": string, // 실제 문제 식 (예: "2x + 6 = 14")
  "answer": string,
  "help_text": string
}
배열 이외의 다른 텍스트나 주석은 절대 포함하지 말고, 모든 항목은 위 단원 목록에 포함된 unitId 중 하나를 사용한다.`;
  }

  // AI 응답 파싱
  private parseAIResponse(response: string): AIGeneratedQuestion[] {
    try {
      // JSON 부분만 추출 (```json과 ``` 제거)
      const jsonMatch =
        response.match(/```json\s*([\s\S]*?)\s*```/) ||
        response.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없습니다.');
      }

      const jsonString = jsonMatch[1] || jsonMatch[0];
      const raw = JSON.parse(jsonString);
      const questions = (Array.isArray(raw) ? raw : []).map(
        (q: {
          unitId: number;
          question?: string;
          question1?: string;
          question2?: string;
          answer: string | number;
          help_text: string;
        }) => {
          const question1 = typeof q.question1 === 'string' ? q.question1 : '';
          const question2 = typeof q.question2 === 'string' ? q.question2 : '';
          const merged = [question1, question2].filter(Boolean).join(' ');
          const rawAnswer =
            typeof q.answer === 'string' ? q.answer : String(q.answer ?? '');
          const normalizedAnswer = rawAnswer
            .toString()
            .trim()
            .replace(/^x\s*=\s*/i, '');
          return {
            unitId: q.unitId,
            question: merged || q.question, // 하위호환: 기존 question 필드 허용
            question1,
            question2,
            answer: normalizedAnswer,
            help_text: q.help_text,
          } as AIGeneratedQuestion;
        }
      );

      if (!Array.isArray(questions)) {
        throw new Error('응답이 배열 형식이 아닙니다.');
      }

      return questions;
    } catch (_error) {
      console.error('AI 응답 파싱 오류:', _error);
      // 파싱 실패 시 빈 배열 반환 → 상위 로직에서 실패 처리
      return [];
    }
  }

  // 생성된 문제들을 데이터베이스에 저장
  private async saveGeneratedQuestions(
    questions: AIGeneratedQuestion[],
    unitCode: string,
    userId: string
  ): Promise<void> {
    try {
      const unitQuestionData = questions.map((q) => ({
        unitCode,
        question: q.question,
        answer: q.answer,
        helpText: q.help_text,
        unitId: q.unitId,
        userId,
      }));

      await this.unitQuestionRepository.createMany(unitQuestionData);
    } catch (_error) {
      console.error('문제 저장 오류:', _error);
      throw new Error('생성된 문제 저장에 실패했습니다.');
    }
  }
}

export class VerifyUnitExamUseCase {
  private unitExamRepository: IUnitExamRepository;
  private unitExamAttemptRepository: IUnitExamAttemptRepository;
  private unitQuestionRepository: IUnitQuestionRepository;
  private unitSolveRepository: IUnitSolveRepository;

  constructor(
    unitExamRepository: IUnitExamRepository,
    unitExamAttemptRepository: IUnitExamAttemptRepository,
    unitQuestionRepository: IUnitQuestionRepository,
    unitSolveRepository: IUnitSolveRepository
  ) {
    this.unitExamRepository = unitExamRepository;
    this.unitExamAttemptRepository = unitExamAttemptRepository;
    this.unitQuestionRepository = unitQuestionRepository;
    this.unitSolveRepository = unitSolveRepository;
  }

  async execute(
    request: VerifyUnitExamRequestDto
  ): Promise<UnitExamVerificationResult> {
    try {
      // 입력 데이터 유효성 검증
      if (!request.code || request.code.trim().length !== 6) {
        return {
          success: false,
          error: '코드는 6글자 영어 대문자여야 합니다.',
        };
      }

      // 코드 형식 검증 (영어 대문자만 허용)
      const codePattern = /^[A-Z]{6}$/;
      if (!codePattern.test(request.code)) {
        return {
          success: false,
          error: '코드는 영어 대문자 6글자만 허용됩니다.',
        };
      }

      // 데이터베이스에서 코드 검증
      const unitExam = await this.unitExamRepository.findByCode(request.code);

      if (unitExam) {
        // 이미 응시했는지 확인
        if (request.studentId) {
          const alreadyAttempted =
            await this.unitExamAttemptRepository.existsByStudentAndExam(
              request.studentId,
              unitExam.id
            );
          if (alreadyAttempted) {
            return {
              success: true,
              valid: false,
              error: '이미 응시한 내역입니다.',
              alreadyAttempted: true,
            };
          }
        }

        // 유효한 코드이면서 응시 이력이 없으면, 시도 기록 생성
        await this.createExamAttempt(
          request.code,
          unitExam.id,
          request.studentId
        );

        return {
          success: true,
          valid: true,
          examData: {
            id: unitExam.id,
            teacherId: unitExam.teacherId,
            createdAt: unitExam.createdAt,
          },
        };
      } else {
        return {
          success: true,
          valid: false,
        };
      }
    } catch (error) {
      console.error('코드 검증 오류:', error);
      return {
        success: false,
        error: '코드 검증 중 오류가 발생했습니다.',
      };
    }
  }

  // 시도 기록 생성
  private async createExamAttempt(
    unitCode: string,
    unitExamId: number,
    sessionStudentId?: string
  ): Promise<void> {
    try {
      const studentId = sessionStudentId || 'temp-student-id';

      await this.unitExamAttemptRepository.create({
        unitCode,
        studentId,
        unitExamId,
      });

      // 시도 기록 성공 로그 제거
    } catch (_error) {
      console.error('시도 기록 생성 오류:', _error);
      // 시도 기록 실패는 전체 검증을 실패시키지 않음
    }
  }
}

// 단원평가 시도 기록을 위한 별도 UseCase
export class CreateExamAttemptUseCase {
  private unitExamRepository: IUnitExamRepository;
  private unitExamAttemptRepository: IUnitExamAttemptRepository;

  constructor(
    unitExamRepository: IUnitExamRepository,
    unitExamAttemptRepository: IUnitExamAttemptRepository
  ) {
    this.unitExamRepository = unitExamRepository;
    this.unitExamAttemptRepository = unitExamAttemptRepository;
  }

  async execute(
    request: CreateExamAttemptRequestDto
  ): Promise<ExamAttemptResult> {
    try {
      // 코드 유효성 검증
      if (!request.code || request.code.trim().length !== 6) {
        return {
          success: false,
          error: '코드는 6글자 영어 대문자여야 합니다.',
        };
      }

      // 단원평가 존재 확인
      const unitExam = await this.unitExamRepository.findByCode(request.code);
      if (!unitExam) {
        return {
          success: false,
          error: '존재하지 않는 코드입니다.',
        };
      }

      // 시도 기록 생성
      const studentId = request.studentId || 'temp-student-id';
      const attempt = await this.unitExamAttemptRepository.create({
        unitCode: request.code,
        studentId,
        unitExamId: unitExam.id,
      });

      return {
        success: true,
        attemptId: attempt.id,
      };
    } catch (_error) {
      console.error('시도 기록 생성 오류:', _error);
      return {
        success: false,
        error: '시도 기록 생성 중 오류가 발생했습니다.',
      };
    }
  }
}

// 단원평가 문제 조회 UseCase
export class GetQuestionsUseCase {
  private unitQuestionRepository: IUnitQuestionRepository;

  constructor(unitQuestionRepository: IUnitQuestionRepository) {
    this.unitQuestionRepository = unitQuestionRepository;
  }

  async execute(request: GetQuestionsRequestDto): Promise<GetQuestionsResult> {
    try {
      if (!request.code || request.code.trim().length !== 6) {
        return { success: false, error: '유효한 코드가 아닙니다.' };
      }
      const list = await this.unitQuestionRepository.findByUnitCode(
        request.code
      );
      return {
        success: true,
        questions: list.map((q) => ({
          id: q.id,
          question: q.question,
          helpText: q.helpText,
        })),
      };
    } catch {
      return { success: false, error: '문제 조회에 실패했습니다.' };
    }
  }
}

// 단원평가 일괄 제출 UseCase
export class SubmitAnswersUseCase {
  private unitQuestionRepository: IUnitQuestionRepository;
  private unitSolveRepository: IUnitSolveRepository;

  constructor(
    unitQuestionRepository: IUnitQuestionRepository,
    unitSolveRepository: IUnitSolveRepository
  ) {
    this.unitQuestionRepository = unitQuestionRepository;
    this.unitSolveRepository = unitSolveRepository;
  }

  async execute(
    request: SubmitAnswersRequestDto
  ): Promise<SubmitAnswersResult> {
    try {
      if (!request.code || request.code.trim().length !== 6) {
        return { success: false, error: '유효한 코드가 아닙니다.' };
      }
      if (!request.answers || request.answers.length === 0) {
        return { success: false, error: '제출할 답안이 없습니다.' };
      }

      const questions = await this.unitQuestionRepository.findByUnitCode(
        request.code
      );
      const idToAnswer = new Map(questions.map((q) => [q.id, q.answer]));

      const createData = request.answers.map((a) => ({
        questionId: a.questionId,
        userId: request.studentId,
        userInput: a.userInput ?? '',
        isCorrect:
          (a.userInput ?? '').trim() ===
          (idToAnswer.get(a.questionId) ?? '').trim(),
      }));

      const saved = await this.unitSolveRepository.createMany(createData);
      return { success: true, saved };
    } catch {
      return { success: false, error: '답안 제출에 실패했습니다.' };
    }
  }
}

// 학생이 푼 단원평가 문제 조회 UseCase
export class GetUserUnitSolvesUseCase {
  private unitSolveRepository: IUnitSolveRepository;

  constructor(unitSolveRepository: IUnitSolveRepository) {
    this.unitSolveRepository = unitSolveRepository;
  }

  async execute(
    userId: string,
    code?: string
  ): Promise<
    | {
        success: true;
        solves: Array<{
          id: number;
          question: string;
          answer: string;
          helpText?: string;
          userInput: string;
          isCorrect: boolean;
          createdAt: Date;
        }>;
      }
    | { success: false; error: string }
  > {
    try {
      if (!userId) {
        return { success: false, error: '유효하지 않은 사용자입니다.' };
      }
      const rows = code
        ? await this.unitSolveRepository.findByUserIdAndCodeWithQuestion(
            userId,
            code
          )
        : await this.unitSolveRepository.findByUserIdWithQuestion(userId);
      const solves = rows.map((r) => ({
        id: r.id,
        question: r.question.question,
        answer: r.question.answer,
        // helpText는 결과 화면에서만 노출
        helpText: (r as unknown as { question: { helpText?: string } }).question
          .helpText,
        userInput: r.userInput,
        isCorrect: r.isCorrect,
        createdAt: r.createdAt,
      }));
      return { success: true, solves };
    } catch {
      return {
        success: false,
        error: '문제 풀이 조회 중 오류가 발생했습니다.',
      };
    }
  }
}
