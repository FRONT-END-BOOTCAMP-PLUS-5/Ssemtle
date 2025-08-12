// ABOUTME: 일차방정식(Linear Equation) 문제의 정답을 검증하는 구현체
import {
  AIQuestionValidator,
  ValidationResult,
} from '@/backend/common/domains/entities/AIQuestionValidator';
import { AIGeneratedQuestion } from '@/backend/unit/dtos/UnitExamDto';

export class LinearEquationValidator implements AIQuestionValidator {
  private toNumber(val: string): number | null {
    if (!val) return null;
    const frac = val.match(/^([+-]?\d+)\/(\d+)$/);
    if (frac) {
      const n = parseInt(frac[1], 10);
      const d = parseInt(frac[2], 10);
      if (!d) return null;
      return n / d;
    }
    const num = Number(val);
    return Number.isFinite(num) ? num : null;
  }

  // 선형식 파서: (분수/괄호/암시적곱 포함) 표현식을 A*x + B로 평가 후 양변을 비교해 해를 구함
  private evalLinearExpr(expr: string): { ax: number; b: number } | null {
    let s = expr.replace(/\s+/g, '');
    s = s.replace(/(\d|\))(?=x|\()/g, '$1*');
    s = s.replace(/x(?=\()/g, 'x*');
    let i = 0;
    const len = s.length;
    const consume = () => s[i++];
    const parseNumber = (): number | null => {
      const start = i;
      while (i < len && /\d/.test(s[i])) i++;
      if (i < len && s[i] === '.') {
        i++;
        while (i < len && /\d/.test(s[i])) i++;
      }
      if (i < len && s[i] === '/') {
        i++;
        while (i < len && /\d/.test(s[i])) i++;
      }
      const str = s.slice(start, i);
      if (!str) return null;
      return this.toNumber(str);
    };
    const parseFactor = (): { ax: number; b: number } | null => {
      let sign = 1;
      while (i < len && (s[i] === '+' || s[i] === '-')) {
        if (s[i] === '-') sign *= -1;
        i++;
      }
      let res: { ax: number; b: number } | null = null;
      if (i < len && s[i] === '(') {
        i++;
        res = parseExpr();
        if (!res || s[i] !== ')') return null;
        i++;
      } else if (i < len && (s[i] === 'x' || s[i] === 'X')) {
        i++;
        res = { ax: 1, b: 0 };
      } else if (i < len && /\d/.test(s[i])) {
        const n = parseNumber();
        if (n === null) return null;
        res = { ax: 0, b: n };
      } else {
        return null;
      }
      return { ax: sign * res.ax, b: sign * res.b };
    };
    const mul = (
      l: { ax: number; b: number },
      r: { ax: number; b: number }
    ) => {
      if (l.ax !== 0 && r.ax !== 0) return null;
      if (l.ax === 0) return { ax: r.ax * l.b, b: r.b * l.b };
      return { ax: l.ax * r.b, b: l.b * r.b };
    };
    const div = (
      l: { ax: number; b: number },
      r: { ax: number; b: number }
    ) => {
      if (r.ax !== 0 || r.b === 0) return null;
      return { ax: l.ax / r.b, b: l.b / r.b };
    };
    const parseTerm = (): { ax: number; b: number } | null => {
      let left = parseFactor();
      if (!left) return null;
      while (i < len && (s[i] === '*' || s[i] === '/')) {
        const op = consume();
        const right = parseFactor();
        if (!right) return null;
        left = op === '*' ? mul(left, right) : div(left, right);
        if (!left) return null;
      }
      return left;
    };
    const parseExpr = (): { ax: number; b: number } | null => {
      let left = parseTerm();
      if (!left) return null;
      while (i < len && (s[i] === '+' || s[i] === '-')) {
        const op = consume();
        const right = parseTerm();
        if (!right) return null;
        left =
          op === '+'
            ? { ax: left.ax + right.ax, b: left.b + right.b }
            : { ax: left.ax - right.ax, b: left.b - right.b };
      }
      return left;
    };
    const res = parseExpr();
    if (!res || i !== len) return null;
    return res;
  }

  private trySolveLinear(eq: string): number | null {
    const parts = eq.replace(/\s+/g, '').split('=');
    if (parts.length !== 2) return null;
    const L = this.evalLinearExpr(parts[0]);
    const R = this.evalLinearExpr(parts[1]);
    if (!L || !R) return null;
    const a = L.ax - R.ax;
    const b = R.b - L.b;
    if (Math.abs(a) < 1e-12) return null;
    const x = b / a;
    return Number.isFinite(x) ? x : null;
  }

  validate(
    question: AIGeneratedQuestion,
    _unitName?: string
  ): ValidationResult {
    void _unitName;
    // 단원 이름으로 필터링 가능 (예: unitName에 '일차방정식' 포함 여부)
    const maybeEq =
      (question as { question2?: string; question: string }).question2 ||
      question.question;
    const expected = question.answer?.toString().trim();
    const solved = this.trySolveLinear(maybeEq);
    if (solved === null) {
      return { isValid: false, reason: '해당 문제는 일차방정식 파싱 실패' };
    }
    // 정답 형식은 숫자 또는 'x = N' 모두 허용
    const normalizedExpected =
      expected?.replace(/\s+/g, '').replace(/^x=/i, '') ?? '';
    const expNum = this.toNumber(normalizedExpected);
    const ok =
      expNum !== null
        ? Math.abs(expNum - solved) < 1e-9
        : normalizedExpected === String(solved);
    return {
      isValid: ok,
      reason: ok ? undefined : `예상:${normalizedExpected}, 계산:${solved}`,
    };
  }
}
