'use client';

import { useState } from 'react';
import { useGets } from '@/hooks/useGets';
import { UnitListResponseDto } from '@/backend/admin/units/dtos/UnitDto';
import UnitCard from './UnitCard';
import CreateUnitModal from './CreateUnitModal';

/** 과목관리 페이지: 데스크탑 고정 레이아웃 + 태블릿/모바일 반응형 */
export default function UnitManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGets<UnitListResponseDto>(
    ['units'],
    '/admin/units',
    true,
    undefined,
    undefined,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const units = response?.data?.units || [];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF]">
      {/* 데스크탑 레이아웃 (lg 이상) - 기존 유지 */}
      <div className="hidden lg:block">
        <div className="mx-auto w-full max-w-[970px] px-8 pt-16 pb-16">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-500">
              과목관리
            </h1>

            <button
              onClick={handleOpenModal}
              className="h-[42px] w-[160px] rounded bg-[#8979FF] text-center text-[13px] font-semibold tracking-[0.13px] text-white shadow-[0px_4px_10px_rgba(16,156,241,0.24)] transition-all hover:bg-[#7A6AFF]"
            >
              과목등록
            </button>
          </div>

          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-lg font-semibold text-gray-600">
                과목 목록을 불러오는 중...
              </div>
            </div>
          ) : isError ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <div className="mb-4 text-lg font-semibold text-red-600">
                데이터를 불러오는데 실패했습니다
              </div>
              <div className="mb-4 text-sm text-gray-600">
                {error?.message || '서버 오류가 발생했습니다.'}
              </div>
              <button
                onClick={() => refetch()}
                className="rounded bg-indigo-400 px-4 py-2 text-sm text-white hover:bg-indigo-500"
              >
                다시 시도
              </button>
            </div>
          ) : units.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <div className="mb-4 text-lg font-semibold text-gray-600">
                등록된 과목이 없습니다
              </div>
              <button
                onClick={handleOpenModal}
                className="rounded bg-indigo-400 px-4 py-2 text-sm text-white hover:bg-indigo-500"
              >
                첫 과목 등록하기
              </button>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-4 gap-[30px]">
              {units.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 태블릿/모바일 레이아웃 (lg 미만) */}
      <div className="lg:hidden">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
            <h1 className="mb-6 text-center text-4xl font-semibold tracking-tight text-neutral-500 sm:mb-0">
              과목관리
            </h1>

            <button
              onClick={handleOpenModal}
              className="h-10 w-40 rounded bg-indigo-400 text-center text-xs font-semibold tracking-tight text-white shadow-[0px_4px_10px_0px_rgba(16,156,241,0.24)] transition-all hover:bg-indigo-500"
            >
              과목등록
            </button>
          </div>

          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-lg font-semibold text-gray-600">
                과목 목록을 불러오는 중...
              </div>
            </div>
          ) : isError ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <div className="mb-4 text-lg font-semibold text-red-600">
                데이터를 불러오는데 실패했습니다
              </div>
              <div className="mb-4 text-sm text-gray-600">
                {error?.message || '서버 오류가 발생했습니다.'}
              </div>
              <button
                onClick={() => refetch()}
                className="rounded bg-indigo-400 px-4 py-2 text-sm text-white hover:bg-indigo-500"
              >
                다시 시도
              </button>
            </div>
          ) : units.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <div className="mb-4 text-lg font-semibold text-gray-600">
                등록된 과목이 없습니다
              </div>
              <button
                onClick={handleOpenModal}
                className="rounded bg-indigo-400 px-4 py-2 text-sm text-white hover:bg-indigo-500"
              >
                첫 과목 등록하기
              </button>
            </div>
          ) : (
            /* 모바일 2열, 태블릿 3~4열 */
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {units.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateUnitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
