'use client';

import { useState } from 'react';
import { useGets } from '@/hooks/useGets';
import { UnitListResponseDto } from '@/backend/admin/units/dtos/UnitDto';
import UnitCard from './UnitCard';
import CreateUnitModal from './CreateUnitModal';

/** 과목관리 페이지: 단일 반응형 레이아웃(간격/위치 유지) */
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

  // 모달 열기
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 생성 성공 시 목록 새로고침
  const handleCreateSuccess = () => {
    refetch();
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF]">
      {/* 컨테이너: 모바일/태블릿 기본 패딩 유지, 데스크탑에서 970px 중앙 고정 및 상하 16 */}
      <div className="w-full px-4 py-8 sm:px-6 lg:mx-auto lg:max-w-[970px] lg:px-8 lg:py-16">
        {/* 헤더: 모바일 세로 중앙, 태블릿부터 좌우 배치(간격 동일) */}
        <div className="mb-8 flex flex-col items-center sm:flex-row sm:justify-between">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-500">
            과목관리
          </h1>

          {/* 버튼: 모바일 스타일 유지, 데스크탑에서 기존 보라색 스타일 적용 */}
          <button
            onClick={handleOpenModal}
            className="h-10 w-40 rounded bg-indigo-400 text-xs font-semibold tracking-tight text-white shadow-[0px_4px_10px_0px_rgba(16,156,241,0.24)] transition-all hover:bg-indigo-500 lg:h-[42px] lg:w-[160px] lg:bg-[#8979FF] lg:text-[13px] lg:tracking-[0.13px] lg:hover:bg-[#7A6AFF]"
          >
            과목등록
          </button>
        </div>

        {/* 콘텐츠 */}
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
          </div>
        ) : units.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <div className="mb-4 text-lg font-semibold text-gray-600">
              등록된 과목이 없습니다
            </div>
          </div>
        ) : (
          // 그리드: 모바일 2열, 태블릿 3열, md 이상 4열
          // 데스크탑에서만 상단 여백 10과 gap 30px 유지(모바일/태블릿은 기존 gap 6 유지)
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-[30px] lg:mt-10">
            {units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
          </div>
        )}
      </div>

      {/* 과목 등록 모달 */}
      <CreateUnitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
