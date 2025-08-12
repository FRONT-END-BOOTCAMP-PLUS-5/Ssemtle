'use client';

import {
  TeacherAuthDto,
  TeacherAuthApprovalRequestDto,
  TeacherAuthApprovalResponseDto,
} from '@/backend/admin/teachers/dtos/TeacherAuthDto';
import { useDeletes } from '@/hooks/useDeletes';

export function useTeacherReject(onSuccess?: () => void) {
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

  const handleReject = (teacherAuth: TeacherAuthDto) => {
    rejectMutation.mutate({
      deleteData: { id: teacherAuth.id },
      path: '/admin/teachers',
    });
  };

  return {
    handleReject,
    isRejecting: rejectMutation.isPending,
  };
}
