'use client';
import {
  TeacherAuthDto,
  TeacherAuthApprovalRequestDto,
  TeacherAuthApprovalResponseDto,
} from '@/backend/admin/teachers/dtos/TeacherAuthDto';
import { usePuts } from '@/hooks/usePuts';
import { toast } from 'react-toastify';

interface TechApprovalProps {
  teacherAuth: TeacherAuthDto;
  onSuccess?: () => void;
}

export default function TechApproval({
  teacherAuth,
  onSuccess,
}: TechApprovalProps) {
  const approval = usePuts<
    TeacherAuthApprovalRequestDto,
    TeacherAuthApprovalResponseDto
  >({
    onSuccess: (data) => {
      toast.success(data.message);
      onSuccess?.();
    },
    onError: () => {
      toast.error('승인 처리 중 오류가 발생했습니다.');
    },
  });

  const handleApprove = () => {
    approval.mutate({
      putData: { id: teacherAuth.id },
      path: '/admin/teachers',
    });
  };

  return (
    <button
      onClick={handleApprove}
      disabled={approval.isPending}
      className="flex h-[36px] w-[96px] cursor-pointer items-center justify-center gap-1 rounded-lg bg-violet-600 p-3 transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="w-10 text-center font-['Inter'] text-sm font-semibold text-white">
        {approval.isPending ? '처리중' : '승인'}
      </div>
    </button>
  );
}
