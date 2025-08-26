// src/utils/normalizeDateParams.ts

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

// YYYY-MM-DD → (KST 하루 시작/끝) → UTC Z
function kstDateOnlyToUtcZ(dateStr: string, asEnd: boolean): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const kstH = asEnd ? 23 : 0;
  const kstM = asEnd ? 59 : 0;
  const kstS = asEnd ? 59 : 0;
  const kstMs = asEnd ? 999 : 0;
  const msUtc =
    Date.UTC(y, (m ?? 1) - 1, d ?? 1, kstH, kstM, kstS, kstMs) -
    9 * 60 * 60 * 1000;
  return new Date(msUtc).toISOString();
}

// 임의 문자열을 스키마가 요구하는 UTC Z ISO로 보정
function ensureZIso(
  input: string | undefined | null,
  asEnd = false
): string | undefined {
  if (!input) return undefined;
  if (DATE_ONLY_RE.test(input)) return kstDateOnlyToUtcZ(input, asEnd);
  const t = Date.parse(input);
  if (!Number.isNaN(t)) return new Date(t).toISOString();
  return input; // 파싱 불가 시 원문 유지(스키마에서 걸림)
}

/**
 * URLSearchParams → from/to만 UTC Z ISO로 정규화해서 객체로 반환.
 * 나머지 파라미터는 그대로 전달.
 */
export function normalizeDateQueryForSchema(
  params: URLSearchParams
): Record<string, string> {
  const obj = Object.fromEntries(params) as Record<string, string>;
  if (obj.from) {
    const z = ensureZIso(obj.from, false);
    if (z) obj.from = z;
  }
  if (obj.to) {
    const z = ensureZIso(obj.to, true);
    if (z) obj.to = z;
  }
  return obj;
}
