'use client';
import { useGets } from '@/hooks/useGets';
import { usePagination } from '@/hooks/usePagination';
import { TeacherAuthListResponseDto } from '@/backend/admin/teachers/dtos/TeacherAuthDto';
import TeacherAuthCard from './TeacherAuthCard';
import Pagination from '@/app/_components/pagination/Pagination';

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
    itemsPerPage: 6,
  });

  return (
    <div className="min-h-[932px] w-full bg-[#F8F5FF] md:min-h-[1180px] lg:min-h-[1024px]">
      <div className="w-full max-w-[430px] md:max-w-[820px] lg:max-w-[1440px]">
        <div className="flex">
          <div className="flex-1">
            {isLoading ? (
              <div className="flex min-h-[932px] flex-col items-center justify-center md:min-h-[1180px] lg:min-h-[1024px]">
                <div className="text-lg font-semibold text-gray-600">
                  선생님 승인 목록을 불러오는 중...
                </div>
              </div>
            ) : isError ? (
              <div className="flex min-h-[932px] flex-col items-center justify-center md:min-h-[1180px] lg:min-h-[1024px]">
                <div className="mb-4 text-lg font-semibold text-red-600 lg:mb-4">
                  데이터를 불러오는데 실패했습니다
                </div>
                <div className="mb-4 text-sm text-gray-600">
                  {error?.message || '서버 오류가 발생했습니다.'}
                </div>
              </div>
            ) : allTeacherAuths.length === 0 ? (
              <div className="flex min-h-[932px] flex-col items-center justify-center md:min-h-[1180px] lg:min-h-[1024px]">
                <div className="text-lg font-semibold text-gray-600">
                  승인 대기 중인 선생님이 없습니다
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="mb-4 w-full md:mt-16 xl:ml-16">
                  <div className="mb-8 text-center text-[32px] tracking-tight text-neutral-500 md:text-[36px] xl:ml-8 xl:text-left xl:text-[32px]">
                    선생님 승인
                  </div>
                </div>

                <div className="grid w-full grid-cols-1 place-items-center gap-6 px-4 md:grid-cols-2 md:place-items-center md:gap-8 md:px-6 lg:grid-cols-3 lg:place-items-start lg:content-start lg:justify-start lg:gap-10 xl:px-16">
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

                {/* 공용 페이지네이션 컴포넌트 */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    className="mt-8"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
