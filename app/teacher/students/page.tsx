'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGets } from '@/hooks/useGets';
import { useSession } from 'next-auth/react';
import type { StudentDto } from '@/backend/admin/students/dtos/StudentDto';
import BulkRegisterModal from './components/BulkRegisterModal';
import RegisterModal from './components/RegisterModal';
import ActionButtons from './components/ActionButtons';
import SearchInput from './components/SearchInput';
import TableHeader from './components/TableHeader';
import StudentTable from './components/StudentTable';
import Pagination from '@/app/_components/pagination/Pagination';

interface StudentsResponse {
  students: StudentDto[];
  total: number;
}

const ITEMS_PER_PAGE = 7;

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

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F5FF]">
      <div className="text-lg font-semibold text-gray-600">{message}</div>
    </div>
  );
}

export default function StudentManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isBulkRegisterOpen, setIsBulkRegisterOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: response,
    isLoading,
    isError,
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

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleBulkRegister = () => setIsBulkRegisterOpen(true);
  const handleBulkRegisterSuccess = () => refetch();

  const handleRegister = () => setIsRegisterOpen(true);
  const handleRegisterSuccess = () => refetch();

  const handleViewAnalysis = (studentId: string) => {
    router.push(`/students/${studentId}/unit-exam`);
  };

  const handleViewWorkbook = (studentId: string) => {
    router.push(`/students/${studentId}/unit`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (status === 'loading') {
    return <LoadingState message="로그인 정보를 확인하는 중..." />;
  }

  if (status === 'unauthenticated' || !session?.user?.id) {
    return <LoadingState message="로그인이 필요합니다." />;
  }

  if (isLoading) {
    return <LoadingState message="학생 목록을 불러오는 중..." />;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F5FF]">
        <div className="text-lg font-semibold text-red-600">
          학생 목록을 불러오는데 실패했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF]">
      <div className="w-full px-4 py-8 sm:px-6 lg:mx-auto lg:max-w-[1200px] lg:px-8 lg:py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-500">
            학생관리
          </h1>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-col md:items-center md:items-end md:justify-between md:justify-end lg:flex-row lg:justify-between">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="학생 이름을 검색하세요"
          />
          <ActionButtons
            onBulkRegister={handleBulkRegister}
            onRegister={handleRegister}
          />
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="hidden lg:block">
            <TableHeader />
            <StudentTable
              students={paginatedStudents}
              onRefetch={refetch}
              onViewAnalysis={handleViewAnalysis}
              onViewWorkbook={handleViewWorkbook}
            />

            {totalPages > 1 && (
              <div className="py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-4"
                />
              </div>
            )}
          </div>

          <div className="lg:hidden">
            <StudentTable
              students={paginatedStudents}
              onRefetch={refetch}
              onViewAnalysis={handleViewAnalysis}
              onViewWorkbook={handleViewWorkbook}
            />

            {totalPages > 1 && (
              <div className="py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-4"
                />
              </div>
            )}
          </div>
        </div>
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
