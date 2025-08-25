'use client';
import {
  TeacherAuthDto,
  TeacherAuthApprovalRequestDto,
  TeacherAuthApprovalResponseDto,
} from '@/backend/admin/teachers/dtos/TeacherAuthDto';
import { useDeletes } from '@/hooks/useDeletes';
import { toast } from 'react-toastify';

interface TechRejectProps {
  teacherAuth: TeacherAuthDto;
  onSuccess?: () => void;
}

export default function TechReject({
  teacherAuth,
  onSuccess,
}: TechRejectProps) {
  const rejectMutation = useDeletes<
    TeacherAuthApprovalRequestDto,
    TeacherAuthApprovalResponseDto
  >({
    onSuccess: (data) => {
      toast.success(data.message);
      onSuccess?.();
    },
    onError: () => {
      toast.error('거절 처리 중 오류가 발생했습니다.');
    },
  });

  const handleReject = () => {
    rejectMutation.mutate({
      deleteData: { id: teacherAuth.id },
      path: '/admin/teachers',
    });
  };

  return (
    <button
      onClick={handleReject}
      disabled={rejectMutation.isPending}
      className="flex h-[36px] w-[96px] cursor-pointer items-center justify-center gap-1 rounded-lg bg-white p-3 outline outline-offset-[-2px] outline-red-200 transition-colors hover:bg-red-50 hover:outline-red-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="w-10 text-center font-['Inter'] text-sm font-semibold text-red-500 transition-colors hover:text-red-600">
        {rejectMutation.isPending ? '처리중' : '거절'}
      </div>
    </button>
  );
}
