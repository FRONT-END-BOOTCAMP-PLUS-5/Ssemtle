'use client';

import type { StudentDto } from '@/backend/admin/students/dtos/StudentDto';
import DeleteStudentIcon from './DeleteStudentIcon';

interface StudentTableProps {
  students: StudentDto[];
  onRefetch: () => void;
  onViewAnalysis: (studentId: string) => void;
  onViewWorkbook: (studentId: string) => void;
}

export default function StudentTable({
  students,
  onRefetch,
  onViewAnalysis,
  onViewWorkbook,
}: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        등록된 학생이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        {students.map((student) => (
          <div
            key={student.id}
            className="grid grid-cols-5 border-b-2 border-neutral-200/70 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <span className="truncate text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs lg:text-xs">
                {student.name}
              </span>
            </div>

            <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <span className="truncate text-[8px] font-bold text-neutral-700 sm:text-[10px] md:text-xs lg:text-xs">
                {student.userId}
              </span>
            </div>

            <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <button
                onClick={() => onViewAnalysis(student.userId)}
                className="flex h-2 w-8 items-center justify-center rounded bg-slate-500 px-1 py-0.5 text-[6px] font-medium text-white transition-colors hover:bg-slate-600 sm:h-[16px] sm:w-[68px] sm:px-2 sm:py-1 sm:text-[8px] md:h-auto md:w-auto md:px-6 md:text-xs lg:h-auto lg:w-auto lg:px-6 lg:text-xs"
              >
                <span className="hidden sm:inline lg:inline">평가분석</span>
              </button>
            </div>

            <div className="flex items-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <button
                onClick={() => onViewWorkbook(student.userId)}
                className="flex h-2 w-8 items-center justify-center rounded bg-indigo-400 px-1 py-0.5 text-[6px] font-medium text-white transition-colors hover:bg-indigo-500 sm:h-3 sm:w-12 sm:px-2 sm:py-1 sm:text-[8px] md:h-auto md:w-auto md:px-6 md:text-xs lg:h-auto lg:w-auto lg:px-6 lg:text-xs"
              >
                <span className="hidden sm:inline lg:inline">문제집</span>
              </button>
            </div>

            <div className="flex items-center justify-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-6">
              <DeleteStudentIcon
                student={student}
                onSuccess={onRefetch}
                className="flex h-4 w-4 items-center justify-center text-rose-500 transition-colors hover:text-rose-600 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-6 lg:w-6"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="md:hidden">
        {students.map((student) => (
          <div key={student.id} className="border-b border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-neutral-700">
                  {student.name}
                </div>
                <div className="text-xs text-neutral-500">{student.userId}</div>
              </div>
              <DeleteStudentIcon
                student={student}
                onSuccess={onRefetch}
                className="flex h-6 w-6 items-center justify-center text-rose-500 hover:text-rose-600"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewAnalysis(student.userId)}
                className="flex-1 rounded bg-slate-500 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
              >
                평가분석
              </button>
              <button
                onClick={() => onViewWorkbook(student.id)}
                className="flex-1 rounded bg-indigo-400 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                문제집
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
