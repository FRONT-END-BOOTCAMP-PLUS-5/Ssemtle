'use client';

import { useSession } from 'next-auth/react';
import { useDeletes } from '@/hooks/useDeletes';
import type { StudentDto } from '@/backend/admin/students/dtos/StudentDto';

interface DeleteStudentIconProps {
  student: StudentDto;
  onSuccess: () => void;
  className?: string;
}

export default function DeleteStudentIcon({
  student,
  onSuccess,
  className = 'flex h-6 w-6 items-center justify-center text-rose-500 transition-colors hover:text-rose-600',
}: DeleteStudentIconProps) {
  const { data: session } = useSession();

  const { mutate: deleteStudent, isPending } = useDeletes<unknown, StudentDto>({
    onSuccess: () => {
      alert(`${student.name} 학생이 성공적으로 삭제되었습니다.`);
      onSuccess();
    },
    onError: (err) => {
      console.error('학생 삭제 실패:', err);
      alert('학생 삭제에 실패했습니다.');
    },
  });

  const handleDelete = () => {
    if (!session?.user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    deleteStudent({
      path: `/admin/students/${session.user.id}/${student.id}`,
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className={className}
      title="학생 삭제"
    >
      <svg
        className="h-4 w-4 cursor-pointer"
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
  );
}
