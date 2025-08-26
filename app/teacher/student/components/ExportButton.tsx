'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { StudentDto } from '@/backend/admin/students/dtos/StudentDto';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

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
      toast.error('로그인이 필요합니다.');
      return;
    }

    toast.info('내보내기는 일괄 등록된 학생만 가능합니다.');

    try {
      const result = await exportData();
      if (result.data) {
        const students = result.data.students;

        if (!students || students.length === 0) {
          toast.warn('내보내기 할 학생이 없습니다.');
          return;
        }

        downloadExcel(students);
        toast.success('학생 목록이 성공적으로 내보내기되었습니다.');
      }
    } catch (err) {
      console.error('내보내기 실패:', err);
      toast.error('내보내기에 실패했습니다.');
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

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [['내보내기는 일괄 등록된 학생만 가능합니다.']],
      { origin: 'A1' }
    );
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

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
