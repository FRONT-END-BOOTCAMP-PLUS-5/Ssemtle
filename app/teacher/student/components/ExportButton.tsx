'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { StudentDto } from '@/backend/admin/students/dtos/StudentDto';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  className?: string;
}

export default function ExportButton({
  className = 'h-10 w-full rounded bg-indigo-400 text-xs font-semibold tracking-tight text-white shadow-[0px_4px_10px_0px_rgba(16,156,241,0.24)] transition-all hover:bg-indigo-500 sm:w-40 cursor-pointer',
}: ExportButtonProps) {
  const { data: session } = useSession();

  const { refetch: exportData } = useQuery({
    queryKey: ['export-students', session?.user?.id],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/students/${session?.user?.id}?type=bulk`,
        { withCredentials: true }
      );
      return response.data;
    },
    enabled: false,
  });

  const handleExport = async () => {
    if (!session?.user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const result = await exportData();
      if (result.data) {
        downloadExcel(result.data.students);
      }
    } catch (err) {
      console.error('내보내기 실패:', err);
      alert('내보내기에 실패했습니다.');
    }
  };

  const downloadExcel = (students: StudentDto[]) => {
    const excelData = students.map((student) => ({
      이름: student.name,
      아이디: student.userId,
      비밀번호: '1234',
      가입일: new Date(student.createdAt).toLocaleDateString('ko-KR'),
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const columnWidths = [
      { wch: 10 }, // 이름
      { wch: 12 }, // 아이디
      { wch: 10 }, // 비밀번호
      { wch: 12 }, // 가입일
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, '학생목록');

    const fileName = `학생목록_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <button onClick={handleExport} className={className}>
      내보내기
    </button>
  );
}
