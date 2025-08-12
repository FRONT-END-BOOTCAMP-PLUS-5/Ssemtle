'use client';

import {
  TeacherAuthDto,
  TeacherAuthApprovalRequestDto,
  TeacherAuthApprovalResponseDto,
} from '@/backend/admin/teachers/dtos/TeacherAuthDto';
import { usePuts } from '@/hooks/usePuts';
import { useDeletes } from '@/hooks/useDeletes';

export function useTeacherApproval(onSuccess?: () => void) {
  const approval = usePuts<
    TeacherAuthApprovalRequestDto,
    TeacherAuthApprovalResponseDto
  >({
    onSuccess: (data) => {
      console.log('승인 성공:', data);
      alert(data.message);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('승인 처리 실패:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    },
  });

  const rejectMutation = useDeletes<
    TeacherAuthApprovalRequestDto,
    TeacherAuthApprovalResponseDto
  >({
    onSuccess: (data) => {
      console.log('거절 성공:', data);
      alert(data.message);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('거절 처리 실패:', error);
      alert('거절 처리 중 오류가 발생했습니다.');
    },
  });

  const handleApprove = (teacherAuth: TeacherAuthDto) => {
    approval.mutate({
      putData: { id: teacherAuth.id },
      path: '/admin/teachers',
    });
  };

  const handleReject = (teacherAuth: TeacherAuthDto) => {
    rejectMutation.mutate({
      deleteData: { id: teacherAuth.id },
      path: '/admin/teachers',
    });
  };

  return {
    handleApprove,
    handleReject,
    isApproving: approval.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
