'use client';

import { useEffect, useMemo, useState } from 'react';
import { useGets } from '@/hooks/useGets';
import type { UnitListResponseDto } from '@/backend/admin/units/dtos/UnitDto';
import SearchInput from '@/app/teacher/students/components/SearchInput';

interface CreateUnitExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (categories: string[]) => void;
}

/**
 * 단원평가 생성 모달 UI
 * - 카테고리 다중 선택 및 생성 버튼 제공 (UI 전용)
 */
export default function CreateUnitExamModal({
  isOpen,
  onClose,
  onCreate,
}: CreateUnitExamModalProps) {
  const { data, isLoading, isError } = useGets<UnitListResponseDto>(
    ['admin-units'],
    '/admin/units',
    isOpen,
    undefined,
    undefined,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const categories = useMemo(() => {
    const units = data?.data?.units ?? [];
    return units.map((u) => u.name);
  }, [data?.data?.units]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isQuestionCountInvalid = questionCount < selected.size;

  useEffect(() => {
    if (!isOpen) {
      setSelected(new Set());
      setSearchTerm('');
    }
  }, [isOpen]);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  /**
   * 단원평가 생성 버튼 클릭 핸들러
   * - 선택된 카테고리명을 id 매핑 후 API 호출
   */
  const handleCreate = async () => {
    try {
      if (selected.size === 0) {
        alert('최소 1개 이상의 카테고리를 선택해주세요.');
        return;
      }
      if (!questionCount || questionCount <= 0) {
        alert('문제 개수는 1개 이상이어야 합니다.');
        return;
      }
      // 문제 개수는 선택한 카테고리 수 이상이어야 함(각 카테고리 최소 1문제 배분)
      if (questionCount < selected.size) {
        // 입력란 옆에 에러 메시지로 안내하므로 별도 alert은 띄우지 않음
        return;
      }

      const units = data?.data?.units ?? [];
      const nameToUnit = new Map(units.map((u) => [u.name, u]));
      const selectedUnits = Array.from(selected)
        .map((name) => nameToUnit.get(name))
        .filter((u): u is UnitListResponseDto['data']['units'][number] =>
          Boolean(u)
        );

      // id 누락 방지
      const invalid = selectedUnits.find((u) => typeof u.id !== 'number');
      if (invalid) {
        alert(
          '선택한 카테고리의 식별자(id)를 찾을 수 없습니다. 새로고침 후 다시 시도해주세요.'
        );
        return;
      }

      const payload = {
        selectedUnits: selectedUnits.map((u) => ({
          unitId: u.id as number,
          unitName: u.name,
        })),
        questionCount,
      };

      setIsSubmitting(true);
      const res = await fetch('/api/unit-exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        alert(json?.error || '단원평가 생성에 실패했습니다.');
        return;
      }

      alert(`단원평가 코드가 생성되었습니다: ${json.code}`);
      onCreate?.(Array.from(selected)); // 부모에 알림 → 목록 갱신 용도
      onClose();
    } catch (e) {
      console.error('[CreateUnitExamModal] create error:', e);
      alert('생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative z-10 flex h-[560px] w-full max-w-sm flex-col rounded-2xl bg-white p-4 shadow-xl sm:p-5">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-700">단원평가</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mb-3">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="이름 검색"
          />
        </div>

        {/* Category List */}
        <div className="flex-1 space-y-3 overflow-auto py-1">
          {isLoading && (
            <div className="py-10 text-center text-sm text-neutral-500">
              카테고리를 불러오는 중...
            </div>
          )}
          {isError && !isLoading && (
            <div className="py-10 text-center text-sm text-rose-500">
              카테고리 조회 실패. 잠시 후 다시 시도해주세요.
            </div>
          )}
          {!isLoading && !isError && categories.length === 0 && (
            <div className="py-10 text-center text-sm text-neutral-500">
              등록된 카테고리가 없습니다.
            </div>
          )}
          {categories
            .filter((name) =>
              searchTerm.trim()
                ? name.toLowerCase().includes(searchTerm.toLowerCase())
                : true
            )
            .map((name) => {
              const isSelected = selected.has(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggle(name)}
                  className="grid grid-cols-[44px_1fr] items-center gap-3"
                >
                  {/* Checkbox-like icon */}
                  <span
                    className={
                      'flex h-11 w-11 items-center justify-center rounded-[12px] border text-white ' +
                      (isSelected
                        ? 'border-violet-500 bg-violet-500'
                        : 'border-neutral-300 bg-neutral-200 text-white')
                    }
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>

                  {/* Label card */}
                  <span className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm font-semibold text-neutral-700 shadow-[0px_1px_4px_rgba(0,0,0,0.08)]">
                    {name}
                  </span>
                </button>
              );
            })}
        </div>

        {/* 문제 개수 설정 */}
        <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <label
            htmlFor="question-count"
            className="block text-sm font-medium text-neutral-700"
          >
            문제 개수
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              id="question-count"
              type="number"
              min={Math.max(1, selected.size)}
              max={50}
              value={questionCount}
              onChange={(e) => {
                const raw = Number(e.target.value) || 1;
                setQuestionCount(raw < 1 ? 1 : raw);
              }}
              className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
            />
            <span className="text-sm text-neutral-500">개</span>
            {isQuestionCountInvalid && (
              <span className="ml-2 text-xs font-medium text-rose-500">
                선택한 카테고리 수({selected.size}) 이상으로 입력하세요
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4">
          <button
            onClick={handleCreate}
            disabled={
              selected.size === 0 || isSubmitting || isQuestionCountInvalid
            }
            className="h-12 w-full rounded-xl bg-violet-500 text-base font-semibold text-white shadow transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {isSubmitting ? '생성 중...' : '단원평가 생성'}
          </button>
        </div>
      </div>
    </div>
  );
}
