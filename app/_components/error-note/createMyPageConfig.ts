import type { ErrorNoteConfig } from './ErrorNoteInterface';

// YYYY-MM-DD → KST 하루 → UTC Z
function ymdToUtcZ(ymd: string, asEnd: boolean) {
  const [y, m, d] = ymd.split('-').map(Number);
  const h = asEnd ? 23 : 0,
    min = asEnd ? 59 : 0,
    s = asEnd ? 59 : 59,
    ms = asEnd ? 999 : 0;
  const utcMs =
    Date.UTC(y, (m ?? 1) - 1, d ?? 1, h, min, s, ms) - 9 * 60 * 60 * 1000;
  return new Date(utcMs).toISOString();
}

export function createMyPageConfig(
  effectiveUserId: string,
  canEdit: boolean
): ErrorNoteConfig {
  return {
    getEndpoint: () => `/solves/list/${encodeURIComponent(effectiveUserId)}`,

    buildQueryParams: ({
      filterDate,
      startDate,
      endDate,
      category,
      unitId,
    }) => {
      const base: Record<string, string> = {
        userId: effectiveUserId,
        only: 'wrong',
        limit: '20',
        sortDirection: 'newest',
      };

      if (filterDate) {
        base.from = ymdToUtcZ(filterDate, false);
        base.to = ymdToUtcZ(filterDate, true);
      } else {
        if (startDate) {
          base.from = /^\d{4}-\d{2}-\d{2}$/.test(startDate)
            ? ymdToUtcZ(startDate, false)
            : startDate;
        }
        if (endDate) {
          base.to = /^\d{4}-\d{2}-\d{2}$/.test(endDate)
            ? ymdToUtcZ(endDate, true)
            : endDate;
        }
      }

      if (category) base.category = category;
      if (unitId) base.unitId = unitId.toString();

      return base;
    },

    canEdit,
    targetUserId: effectiveUserId,
    title: '오답노트',
    showAllOption: false,
    showReadOnlyIndicators: true,
    readOnlyMessage: canEdit
      ? undefined
      : '이 페이지는 읽기 전용입니다. 내 문제가 아니므로 정답 수정이 비활성화됩니다.',
  };
}
