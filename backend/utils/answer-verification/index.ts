// ABOUTME: 정답 검증 유틸리티. 문자열 비교가 아니라 수학적 동등성 및 다중 정답, 공백/기호 정규화를 처리.
// - 기본 전략: (1) 빠른 문자열 정규화 후 동일성 검사 (2) 수학식 평가 통한 동치성 검사 (mathjs)
// - 다중 정답: 쉼표로 구분된 경우 어떤 하나라도 참이면 정답
// - 예외: 원문 그대로가 정답이어야 하는 경우(예: 문제 텍스트 자체가 답일 수 있음) 대비, 완전 일치도 보존

/**
 * 사용자 입력과 정답 문자열을 비교하여 정답 여부를 반환합니다.
 * - 숫자/수식은 평가하여 수학적으로 동등하면 정답 처리
 * - 다중 정답(예: "-3, 3")은 어떤 하나라도 맞으면 정답
 * - 공백/기호/유니코드 마이너스 등의 정규화를 적용
 */
export function verifyAnswer(userInputRaw: string, answerRaw: string): boolean {
  try {
    const userInput = (userInputRaw ?? '').trim();
    const answer = (answerRaw ?? '').trim();

    if (userInput === '' || answer === '') return false;

    // 1) 빠른 경로: 라이트 정규화 후 동일성 검사
    const normUser = normalizeLight(userInput);
    const normAnswer = normalizeLight(answer);
    if (normUser === normAnswer) return true;

    // 2) 다중 정답 처리: 쉼표 분리 후 '전체 포함 일치(순서 무시)' 검사
    const correctList = splitAnswers(answer);
    const userList = splitAnswers(userInput);
    if (correctList.length > 1 || userList.length > 1) {
      return matchMultiAnswers(userList, correctList);
    }

    // 3) 단일 정답 규칙 기반 비교
    const candidate = correctList[0];
    const candidateHasLetter = /[A-Za-z]/.test(candidate);
    const userHasLetter = /[A-Za-z]/.test(userInput);
    const normCandidate = normalizeLight(candidate);
    if (candidateHasLetter || userHasLetter) {
      if (normUser === normCandidate || userInput === candidate) return true;
      return false;
    }

    if (isNumericLiteralLike(userInput) && isNumericLiteralLike(candidate)) {
      const a = parseNumericLiteral(userInput);
      const b = parseNumericLiteral(candidate);
      if (a.ok && b.ok && nearlyEqual(a.value, b.value)) return true;
      return false;
    }

    // 마지막 방어: 원문 완전 일치(기호, 공백 포함) 검사
    if (userInput === answer) return true;
    return false;
  } catch (error) {
    // 에러는 로깅하고 일반 메시지로 처리 영역에서 안내
    console.error('[verifyAnswer] error:', error);
    return false;
  }
}

/** 가벼운 정규화: 공백, 유니코드 마이너스, 곱셈기호 통일 등 */
function normalizeLight(s: string): string {
  return s
    .trim()
    .replace(/[−–—]/g, '-') // 유니코드 대시 → '-'
    .replace(/·|×/g, '*')
    .replace(/\s+/g, '') // 모든 공백 제거
    .replace(/([\d\)])(?=[A-Za-z(])/g, '$1*') // 암시적 곱셈 일부 처리: 2x, 2(x)
    .replace(/([A-Za-z\)])(?=\d)/g, '$1*'); // x2, )2
}

/** 쉼표로 다중 정답 분리 */
function splitAnswers(s: string): string[] {
  if (!s.includes(',')) return [s];
  return s
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p !== '');
}

/**
 * 다중 정답 매칭: 순서 무시, 전체 포함(multiset 일치) 기준
 * - 숫자형은 수치 비교, 식/문자 포함은 정규화 동일성 비교
 * - 개수가 다르면 즉시 오답 처리
 */
function matchMultiAnswers(
  userParts: string[],
  correctParts: string[]
): boolean {
  // 개수 일치 필요
  if (userParts.length !== correctParts.length) return false;

  const userTokens = userParts.map(toToken);
  const correctTokens = correctParts.map(toToken);
  const used: boolean[] = new Array(userTokens.length).fill(false);

  for (const ct of correctTokens) {
    let found = false;
    for (let i = 0; i < userTokens.length; i++) {
      if (used[i]) continue;
      if (tokensEqual(userTokens[i], ct)) {
        used[i] = true;
        found = true;
        break;
      }
    }
    if (!found) return false;
  }

  // 모두 매칭되면 정답
  return true;
}

/** 토큰 모델: 숫자/문자 여부와 정규화 값, 숫자값 포함 */
function toToken(part: string): {
  original: string;
  normalized: string;
  isNumeric: boolean;
  hasLetter: boolean;
  num?: number;
} {
  const original = part.trim();
  const normalized = normalizeLight(original);
  const hasLetter = /[A-Za-z]/.test(original);
  const isNumeric = isNumericLiteralLike(original);
  const num = isNumeric
    ? parseNumericLiteral(original)
    : { ok: false as const, value: NaN };
  return {
    original,
    normalized,
    isNumeric,
    hasLetter,
    num: num.ok ? num.value : undefined,
  };
}

/** 두 토큰 동치성 검사 */
function tokensEqual(
  a: ReturnType<typeof toToken>,
  b: ReturnType<typeof toToken>
): boolean {
  // 식/문자가 하나라도 있으면 정규화 동일성으로만 비교
  if (a.hasLetter || b.hasLetter) {
    return a.normalized === b.normalized || a.original === b.original;
  }
  // 숫자형은 수치 비교, 둘 다 숫자여야 함
  if (
    a.isNumeric &&
    b.isNumeric &&
    a.num !== undefined &&
    b.num !== undefined
  ) {
    return nearlyEqual(a.num, b.num);
  }
  // 그 외는 정규화 동일성
  return a.normalized === b.normalized || a.original === b.original;
}

/** 숫자 리터럴(정수/소수/분수) 형태인지 검사 */
function isNumericLiteralLike(s: string): boolean {
  return /^[-+]?((\d+(\.\d+)?)|(\d+\/\d+))$/.test(s);
}

/** 숫자 리터럴 파싱: 분수 지원 */
function parseNumericLiteral(s: string): { ok: boolean; value: number } {
  try {
    if (/^[-+]?\d+\/\d+$/.test(s)) {
      const sign = s.startsWith('-') ? -1 : 1;
      const [numStr, denStr] = s.replace(/^[-+]/, '').split('/');
      const num = Number(numStr);
      const den = Number(denStr);
      if (den === 0 || !Number.isFinite(num) || !Number.isFinite(den)) {
        return { ok: false, value: NaN };
      }
      return { ok: true, value: sign * (num / den) };
    }
    const n = Number(s);
    if (Number.isFinite(n)) return { ok: true, value: n };
    return { ok: false, value: NaN };
  } catch {
    return { ok: false, value: NaN };
  }
}

/** 부동소수 비교 허용 오차 */
const EPS = 1e-9;
function nearlyEqual(a: number, b: number, eps: number = EPS): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
}

export type {};
