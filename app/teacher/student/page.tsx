'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGets } from '@/hooks/useGets';
import { useSession } from 'next-auth/react';
import { usePagination } from '@/hooks/usePagination';
import type { StudentDto } from '@/backend/admin/students/dtos/StudentDto';
import BulkRegisterModal from './components/BulkRegisterModal';
import RegisterModal from './components/RegisterModal';
import ActionButtons from './components/ActionButtons';
import SearchInput from './components/SearchInput';
import TableHeader from './components/TableHeader';
import StudentTable from './components/StudentTable';
import Pagination from '@/app/_components/pagination/Pagination';
import DataStateHandler from '@/app/_components/admin-loading/DataStateHandler';

interface StudentsResponse {
  students: StudentDto[];
  total: number;
}

function useStudentData(sessionId: string | undefined) {
  return useGets<StudentsResponse>(
    ['students', sessionId],
    sessionId ? `/admin/students/${sessionId}` : '',
    !!sessionId,
    undefined,
    undefined,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
}

export default function StudentManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isBulkRegisterOpen, setIsBulkRegisterOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useStudentData(session?.user?.id);

  const students = useMemo(
    () => response?.students || [],
    [response?.students]
  );

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const { currentPage, totalPages, currentData, goToPage } = usePagination({
    data: filteredStudents,
    itemsPerPage: 7,
  });

  const handleBulkRegister = () => setIsBulkRegisterOpen(true);
  const handleBulkRegisterSuccess = () => refetch();

  const handleRegister = () => setIsRegisterOpen(true);
  const handleRegisterSuccess = () => refetch();

  const handleViewAnalysis = (userId: string) => {
    router.push(`/mypage/${userId}`);
  };

  const handleViewWorkbook = (userId: string) => {
    router.push(`/student/${userId}/unit-exam`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    goToPage(1);
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F5FF]">
        <div className="text-lg font-semibold text-gray-600">
          로그인 정보를 확인하는 중...
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session?.user?.id) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F5FF]">
        <div className="text-lg font-semibold text-gray-600">
          로그인이 필요합니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF]">
      <div className="w-full px-4 py-8 sm:px-6 lg:mx-auto lg:max-w-[1200px] lg:px-8 lg:py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-500">
            학생 관리
          </h1>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-col md:items-center md:items-end md:justify-between md:justify-end lg:flex-row lg:justify-between">
          <SearchInput value={searchTerm} onChange={handleSearchChange} />
          <ActionButtons
            onBulkRegister={handleBulkRegister}
            onRegister={handleRegister}
          />
        </div>

        <DataStateHandler
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={students.length === 0}
          loadingMessage="학생 목록을 불러오는 중..."
          errorMessage="학생 목록을 불러오는데 실패했습니다"
          emptyMessage="등록된 학생이 없습니다"
        >
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="hidden lg:block">
              <TableHeader />
              <StudentTable
                students={currentData}
                onRefetch={refetch}
                onViewAnalysis={handleViewAnalysis}
                onViewWorkbook={handleViewWorkbook}
              />

              {totalPages > 1 && (
                <div className="py-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    className="mt-4"
                  />
                </div>
              )}
            </div>

            <div className="lg:hidden">
              <StudentTable
                students={currentData}
                onRefetch={refetch}
                onViewAnalysis={handleViewAnalysis}
                onViewWorkbook={handleViewWorkbook}
              />

              {totalPages > 1 && (
                <div className="py-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    className="mt-4"
                    maxVisiblePages={4}
                    showFirstLast={true}
                  />
                </div>
              )}
            </div>
          </div>
        </DataStateHandler>
      </div>

      <BulkRegisterModal
        isOpen={isBulkRegisterOpen}
        onClose={() => setIsBulkRegisterOpen(false)}
        onSuccess={handleBulkRegisterSuccess}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
}
