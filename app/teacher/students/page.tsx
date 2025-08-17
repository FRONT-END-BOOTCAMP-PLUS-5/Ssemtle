'use client';

import { useState, useMemo } from 'react';
import { useGets } from '@/hooks/useGets';
import { useSession } from 'next-auth/react';
import type { StudentDto } from '@/backend/admin/students/dtos/StudentDto';
import BulkRegisterModal from './components/BulkRegisterModal';
import RegisterModal from './components/RegisterModal';
import DeleteStudentIcon from './components/DeleteStudentIcon';
import ExportButton from './components/ExportButton';
import Pagination from '@/app/_components/pagination/Pagination';

interface StudentsResponse {
  students: StudentDto[];
  total: number;
}

export default function StudentManagementPage() {
  const { data: session, status } = useSession();
  const [isBulkRegisterOpen, setIsBulkRegisterOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGets<StudentsResponse>(
    ['students', session?.user?.id],
    session?.user?.id ? `/admin/students/${session.user.id}` : '',
    !!session?.user?.id,
    undefined,
    undefined,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const students = useMemo(
    () => response?.students || [],
    [response?.students]
  );
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return students.slice(startIndex, endIndex);
  }, [students, currentPage]);

  const totalPages = Math.ceil(students.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F5FF]">
        <div className="text-lg font-semibold text-gray-600">
          학생 목록을 불러오는 중...
        </div>
      </div>
    );
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

  const handleBulkRegister = () => {
    setIsBulkRegisterOpen(true);
  };

  const handleBulkRegisterSuccess = () => {
    refetch();
  };

  const handleRegister = () => {
    setIsRegisterOpen(true);
  };

  const handleRegisterSuccess = () => {
    refetch();
  };

  const handleViewAnalysis = (studentId: string) => {
    console.log('평가분석 보러가기:', studentId);
  };

  const handleViewWorkbook = (studentId: string) => {
    console.log('문제집 보러가기:', studentId);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF]">
      <div className="w-full px-4 py-8 sm:px-6 lg:mx-auto lg:max-w-[1200px] lg:px-8 lg:py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-500">
            학생관리
          </h1>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-col md:items-center md:items-end md:justify-between md:justify-end lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row lg:gap-2"></div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleBulkRegister}
              className="h-10 w-full rounded bg-indigo-400 text-xs font-semibold tracking-tight text-white shadow-[0px_4px_10px_0px_rgba(16,156,241,0.24)] transition-all hover:bg-indigo-500 sm:w-40"
            >
              학생 일괄 등록
            </button>
            <button
              onClick={handleRegister}
              className="h-10 w-full rounded bg-indigo-400 text-xs font-semibold tracking-tight text-white shadow-[0px_4px_10px_0px_rgba(16,156,241,0.24)] transition-all hover:bg-indigo-500 sm:w-40"
            >
              학생 등록
            </button>
            <ExportButton />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="hidden lg:block">
            <div className="grid grid-cols-5 border-b-2 border-neutral-200/70 bg-violet-50">
              <div className="px-6 py-3 text-left">
                <span className="text-xs font-bold text-neutral-700">이름</span>
              </div>
              <div className="px-6 py-3 text-left">
                <span className="text-xs font-bold text-neutral-700">
                  아이디
                </span>
              </div>
              <div className="px-6 py-3 text-left"></div>
              <div className="px-6 py-3 text-left"></div>
              <div className="px-6 py-3 text-center"></div>
            </div>

            {students.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                등록된 학생이 없습니다.
              </div>
            ) : (
              <>
                {paginatedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="grid grid-cols-5 border-b-2 border-neutral-200/70 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center px-6 py-3">
                      <span className="text-xs font-bold text-neutral-700">
                        {student.name}
                      </span>
                    </div>

                    <div className="flex items-center px-6 py-3">
                      <span className="text-xs font-bold text-neutral-700">
                        {student.userId}
                      </span>
                    </div>

                    <div className="flex items-center px-6 py-3">
                      <button
                        onClick={() => handleViewAnalysis(student.id)}
                        className="rounded bg-slate-500 px-6 py-1 text-xs font-medium text-white transition-colors hover:bg-slate-600"
                      >
                        평가분석
                      </button>
                    </div>

                    <div className="flex items-center px-6 py-3">
                      <button
                        onClick={() => handleViewWorkbook(student.id)}
                        className="rounded bg-indigo-400 px-6 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
                      >
                        문제집
                      </button>
                    </div>

                    <div className="flex items-center justify-center px-6 py-3">
                      <DeleteStudentIcon
                        student={student}
                        onSuccess={refetch}
                      />
                    </div>
                  </div>
                ))}

                {/* 페이지네이션 */}
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
              </>
            )}
          </div>

          <div className="hidden md:block lg:hidden">
            <div className="grid grid-cols-5 border-b-2 border-neutral-200/70 bg-violet-50">
              <div className="px-2 py-2 text-left sm:px-4 sm:py-3 md:px-6">
                <span className="text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs">
                  이름
                </span>
              </div>
              <div className="px-2 py-2 text-left sm:px-4 sm:py-3 md:px-6">
                <span className="text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs">
                  아이디
                </span>
              </div>
              <div className="px-2 py-2 text-left sm:px-4 sm:py-3 md:px-6"></div>
              <div className="px-2 py-2 text-left sm:px-4 sm:py-3 md:px-6"></div>
              <div className="px-2 py-2 text-center sm:px-4 sm:py-3 md:px-6"></div>
            </div>

            {students.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                등록된 학생이 없습니다.
              </div>
            ) : (
              <>
                {paginatedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="grid grid-cols-5 border-b-2 border-neutral-200/70 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6">
                      <span className="truncate text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs">
                        {student.name}
                      </span>
                    </div>

                    <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6">
                      <span className="truncate text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs">
                        {student.userId}
                      </span>
                    </div>

                    <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6">
                      <button
                        onClick={() => handleViewAnalysis(student.id)}
                        className="flex h-2 w-8 items-center justify-center rounded bg-slate-500 px-1 py-0.5 text-[6px] font-medium text-white transition-colors hover:bg-slate-600 sm:h-[16px] sm:w-[68px] sm:px-2 sm:py-1 sm:text-[8px] md:h-auto md:w-auto md:px-6 md:text-xs"
                      >
                        <span className="hidden sm:inline">평가분석</span>
                        <span className="sm:hidden">보기</span>
                      </button>
                    </div>

                    <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6">
                      <button
                        onClick={() => handleViewWorkbook(student.id)}
                        className="flex h-2 w-8 items-center justify-center rounded bg-indigo-400 px-1 py-0.5 text-[6px] font-medium text-white transition-colors hover:bg-indigo-500 sm:h-3 sm:w-12 sm:px-2 sm:py-1 sm:text-[8px] md:h-auto md:w-auto md:px-6 md:text-xs"
                      >
                        <span className="hidden sm:inline">문제집</span>
                        <span className="sm:hidden">보기</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center px-2 py-2 sm:px-4 sm:py-3 md:px-6">
                      <DeleteStudentIcon
                        student={student}
                        onSuccess={refetch}
                        className="flex h-4 w-4 items-center justify-center text-rose-500 transition-colors hover:text-rose-600 sm:h-5 sm:w-5 md:h-6 md:w-6"
                      />
                    </div>
                  </div>
                ))}

                {/* 페이지네이션 */}
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
              </>
            )}
          </div>

          <div className="md:hidden">
            {students.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                등록된 학생이 없습니다.
              </div>
            ) : (
              <>
                {paginatedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="border-b border-gray-200 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-neutral-700">
                          {student.name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {student.userId}
                        </div>
                      </div>
                      <DeleteStudentIcon
                        student={student}
                        onSuccess={refetch}
                        className="flex h-6 w-6 items-center justify-center text-rose-500 hover:text-rose-600"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewAnalysis(student.id)}
                        className="flex-1 rounded bg-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
                      >
                        평가분석
                      </button>
                      <button
                        onClick={() => handleViewWorkbook(student.id)}
                        className="flex-1 rounded bg-indigo-400 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                      >
                        문제집
                      </button>
                    </div>
                  </div>
                ))}

                {/* 페이지네이션 */}
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
              </>
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
