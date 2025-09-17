/**
 * 유닛별 카드 보조 정보(배경색, 설명)
 * - 현재 db에 description이 없어서 임시로 추가하였음.
 * 차후에 description을 추가하면 이 파일에서 description을 삭제하고 accentClass만 사용하면 됨.
 */
export type UnitMeta = Record<
  string,
  { accentClass: string; description: string }
>;

export const UNIT_META: UnitMeta = {
  // 상단 라인
  이차방정식: {
    accentClass: 'bg-gradient-to-br from-rose-50 to-pink-50',
    description: '이차방정식을 풀어 해를 구해요.',
  },
  인수분해: {
    accentClass: 'bg-gradient-to-br from-sky-50 to-indigo-50',
    description: '식을 인수로 분해하는 방법을 배워요.',
  },
  '다항식의 덧셈과 곱셈': {
    accentClass: 'bg-gradient-to-br from-emerald-50 to-green-50',
    description: '다항식의 연산을 마스터해요.',
  },

  // 중단 라인
  지수법칙: {
    accentClass: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    description: '거듭제곱의 규칙을 이해해요.',
  },
  일차방정식: {
    accentClass: 'bg-gradient-to-br from-violet-50 to-fuchsia-50',
    description: '방정식을 풀어 미지수를 찾아요.',
  },
  '일차식의 곱셈과 나눗셈': {
    accentClass: 'bg-gradient-to-br from-orange-50 to-amber-50',
    description: '문자식의 곱셈과 나눗셈을 배워요.',
  },

  // 하단 라인
  '일차식의 덧셈과 뺄셈': {
    accentClass: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    description: '문자를 사용한 식의 계산을 연습해요.',
  },
  '정수와 유리수의 사칙계산': {
    accentClass: 'bg-gradient-to-br from-sky-50 to-blue-50',
    description: '음수와 분수의 계산을 마스터해요.',
  },
  '정수와유리수의 사칙계산': {
    accentClass: 'bg-gradient-to-br from-sky-50 to-blue-50',
    description: '음수와 분수의 계산을 마스터해요.',
  },
  소인수분해: {
    accentClass: 'bg-gradient-to-br from-pink-50 to-rose-50',
    description: '수를 소인수로 분해하는 방법을 배워요.',
  },
};
