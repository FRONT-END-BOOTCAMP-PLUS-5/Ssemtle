'use client';

import { useEffect, useState } from 'react';
import { HiSearch } from 'react-icons/hi';

interface Student {
  id: string;
  name: string;
  studentId: string;
  hasAnalysis: boolean;
  hasWorkbook: boolean;
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: '형대희',
    studentId: '25ABCD01',
    hasAnalysis: true,
    hasWorkbook: true,
  },
  {
    id: '2',
    name: '임정훈',
    studentId: '25ABCD02',
    hasAnalysis: true,
    hasWorkbook: true,
  },
  {
    id: '3',
    name: '권동규',
    studentId: '25ABCD03',
    hasAnalysis: true,
    hasWorkbook: true,
  },
  {
    id: '4',
    name: '최광민',
    studentId: '25ABCD04',
    hasAnalysis: true,
    hasWorkbook: true,
  },
  {
    id: '5',
    name: '유재석',
    studentId: '25ABCD05',
    hasAnalysis: true,
    hasWorkbook: true,
  },
  {
    id: '6',
    name: '하하',
    studentId: '25ABCD06',
    hasAnalysis: true,
    hasWorkbook: true,
  },
  {
    id: '7',
    name: '김종국',
    studentId: '25ABCD07',
    hasAnalysis: true,
    hasWorkbook: true,
  },
];

export default function StudentManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] =
    useState<Student[]>(mockStudents);

  useEffect(() => {
    const filtered = mockStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm]);

  const handleBulkRegister = () => {
    console.log('학생 일괄 등록');
  };

  const handleRegister = () => {
    console.log('학생 등록');
  };

  const handleExport = () => {
    console.log('학생 데이터 내보내기');
  };

  const handleViewAnalysis = (studentId: string) => {
    console.log('평가분석 보러가기:', studentId);
  };

  const handleViewWorkbook = (studentId: string) => {
    console.log('문제집 보러가기:', studentId);
  };

  const handleDelete = (studentId: string) => {
    console.log('학생 삭제:', studentId);
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
          <div className="flex flex-col gap-4 sm:flex-row lg:gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="이름 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-[10px] border border-neutral-300 bg-white px-4 text-sm shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] focus:ring-2 focus:ring-indigo-400 focus:outline-none sm:w-80"
              />
              <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                <HiSearch className="h-7 w-7 text-neutral-400" />
              </div>
            </div>
          </div>

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
            <button
              onClick={handleExport}
              className="h-10 w-full rounded bg-indigo-400 text-xs font-semibold tracking-tight text-white shadow-[0px_4px_10px_0px_rgba(16,156,241,0.24)] transition-all hover:bg-indigo-500 sm:w-40"
            >
              내보내기
            </button>
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
              <div className="px-6 py-3 text-left">
                <span className="text-xs font-bold text-neutral-700">
                  평가분석
                </span>
              </div>
              <div className="px-6 py-3 text-left">
                <span className="text-xs font-bold text-neutral-700">
                  문제집
                </span>
              </div>
              <div className="px-6 py-3 text-center">
                <span className="text-xs font-bold text-neutral-700">관리</span>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredStudents.map((student) => (
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
                      {student.studentId}
                    </span>
                  </div>

                  <div className="flex items-center px-6 py-3">
                    <button
                      onClick={() => handleViewAnalysis(student.id)}
                      className="rounded bg-slate-500 px-6 py-1 text-xs font-medium text-white transition-colors hover:bg-slate-600"
                    >
                      보러가기
                    </button>
                  </div>

                  <div className="flex items-center px-6 py-3">
                    <button
                      onClick={() => handleViewWorkbook(student.id)}
                      className="rounded bg-indigo-400 px-6 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
                    >
                      보러가기
                    </button>
                  </div>

                  <div className="flex items-center justify-center px-6 py-3">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="flex h-6 w-6 items-center justify-center text-rose-500 transition-colors hover:text-rose-600"
                      title="학생 삭제"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
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
              <div className="px-2 py-2 text-left sm:px-4 sm:py-3 md:px-6">
                <span className="text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs">
                  평가분석
                </span>
              </div>
              <div className="px-2 py-2 text-left sm:px-4 sm:py-3 md:px-6">
                <span className="text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs">
                  문제집
                </span>
              </div>
              <div className="px-2 py-2 text-center sm:px-4 sm:py-3 md:px-6">
                <span className="text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs">
                  관리
                </span>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredStudents.map((student) => (
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
                      {student.studentId}
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
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="flex h-4 w-4 items-center justify-center text-rose-500 transition-colors hover:text-rose-600 sm:h-5 sm:w-5 md:h-6 md:w-6"
                      title="학생 삭제"
                    >
                      <svg
                        className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="md:hidden">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border-b border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-neutral-700">
                      {student.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {student.studentId}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="flex h-6 w-6 items-center justify-center text-rose-500 hover:text-rose-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
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
          </div>
        </div>
      </div>
    </div>
  );
}
