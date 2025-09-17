'use client';

import { useState } from 'react';
import { useGets } from '@/hooks/useGets';
import {
  UnitDto,
  UnitListResponseDto,
} from '@/backend/admin/units/dtos/UnitDto';
import UnitCard from './components/UnitCard';
import CreateUnitModal from './components/CreateUnitModal';
import EditUnitModal from './components/EditUnitModal';
import { useDeletes } from '@/hooks/useDeletes';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Pagination from '@/app/_components/pagination/Pagination';
import { usePagination } from '@/hooks/usePagination';
import DataStateHandler from '@/app/_components/admin-loading/DataStateHandler';
import { toast } from 'react-toastify';

interface DeleteUnitResponse {
  message: string;
  data: { id: number; name: string };
}

export default function UnitManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitDto | null>(null);

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

  const { currentPage, totalPages, currentData, goToPage } =
    usePagination<UnitDto>({
      data: units,
      itemsPerPage: 8,
    });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEdit = (unit: UnitDto) => {
    setSelectedUnit(unit);
    setIsEditOpen(true);
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    setSelectedUnit(null);
  };

  const { mutate: deleteUnit, isPending: isDeleting } = useDeletes<
    undefined,
    DeleteUnitResponse
  >({
    onSuccess: () => {
      setIsDeleteOpen(false);
      setSelectedUnit(null);
      toast.success('과목이 성공적으로 삭제되었습니다.');
      refetch();
    },
    onError: () => {
      toast.error('과목 삭제에 실패했습니다.');
    },
  });

  const handleDelete = (unit: UnitDto) => {
    if (!unit?.id) return;
    setSelectedUnit(unit);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedUnit?.id) return;
    deleteUnit({ path: `/admin/units/${selectedUnit.id}` });
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF]">
      <div className="w-full px-4 py-8 sm:px-6 lg:mx-auto lg:max-w-[970px] lg:px-8 lg:py-16">
        <div className="mb-8 flex flex-col items-center sm:flex-row sm:justify-between">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-500">
            과목 관리
          </h1>
          <button
            onClick={handleOpenModal}
            className="h-10 w-40 cursor-pointer rounded bg-indigo-400 text-xs font-semibold tracking-tight text-white shadow-[0px_4px_10px_0px_rgba(16,156,241,0.24)] transition-all hover:bg-indigo-500 lg:h-[42px] lg:w-[160px] lg:bg-[#6366F1] lg:text-sm-alt lg:tracking-[0.13px] lg:hover:bg-[#5855EB]"
          >
            과목등록
          </button>
        </div>

        <DataStateHandler
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={units.length === 0}
          loadingMessage="과목 목록을 불러오는 중..."
          errorMessage="데이터를 불러오는데 실패했습니다"
          emptyMessage="등록된 과목이 없습니다"
        >
          <>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-[30px] lg:mt-10">
              {currentData.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                maxVisiblePages={4}
                showFirstLast={true}
              />
            </div>
          </>
        </DataStateHandler>
      </div>

      <CreateUnitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleCreateSuccess}
      />
      <EditUnitModal
        isOpen={isEditOpen}
        unit={selectedUnit}
        onClose={handleEditClose}
        onSuccess={refetch}
      />
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        name={selectedUnit?.name}
        isBusy={isDeleting}
        onCancel={() => {
          if (isDeleting) return;
          setIsDeleteOpen(false);
          setSelectedUnit(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
