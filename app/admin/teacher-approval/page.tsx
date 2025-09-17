'use client';
import { useGets } from '@/hooks/useGets';
import { usePagination } from '@/hooks/usePagination';
import { TeacherAuthListResponseDto } from '@/backend/admin/teachers/dtos/TeacherAuthDto';
import TeacherAuthCard from './components/TeacherAuthCard';
import Pagination from '@/app/_components/pagination/Pagination';
import DataStateHandler from '@/app/_components/admin-loading/DataStateHandler';

export default function ApprovalListPage() {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGets<TeacherAuthListResponseDto>(
    ['teacher-auths'],
    '/admin/teachers',
    true,
    undefined,
    undefined,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const allTeacherAuths = response?.data?.teacherAuths || [];

  const { currentPage, totalPages, currentData, goToPage } = usePagination({
    data: allTeacherAuths,
    itemsPerPage: 4,
  });

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF]">
      <div className="w-full px-4 py-8 sm:px-6 lg:mx-auto lg:max-w-[1200px] lg:px-8 lg:py-16">
        <div className="mb-8">
          <h1 className="mb-8 text-center text-4xl text-3xl-alt font-semibold text-neutral-500 md:text-4xl lg:pl-2 xl:ml-8 xl:text-left xl:text-3xl-alt">
            선생님 승인
          </h1>
        </div>

        <DataStateHandler
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={allTeacherAuths.length === 0}
          loadingMessage="선생님 승인 목록을 불러오는 중..."
          errorMessage="데이터를 불러오는데 실패했습니다"
          emptyMessage="승인 대기 중인 선생님이 없습니다"
        >
          <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2 md:gap-6 md:px-6 lg:grid-cols-4 lg:gap-8 xl:px-8">
            {currentData.map((teacherAuth) => (
              <TeacherAuthCard
                key={teacherAuth.id}
                teacherAuth={teacherAuth}
                onSuccess={() => {
                  refetch();
                  if (currentData.length === 1 && currentPage > 1) {
                    goToPage(currentPage - 1);
                  }
                }}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="w-full px-4 md:px-6 xl:px-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                className="mt-8"
                maxVisiblePages={4}
                showFirstLast={true}
              />
            </div>
          )}
        </DataStateHandler>
      </div>
    </div>
  );
}
