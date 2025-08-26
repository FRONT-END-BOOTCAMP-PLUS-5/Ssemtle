'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePuts } from '@/hooks/usePuts';
import type { StudentDto } from '@/backend/admin/students/dtos/StudentDto';
import FormModal from '@/app/_components/admin-modal/FormModal';

interface RegisterRequest {
  userId: string;
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterModalProps) {
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setUserId('');
    }
  }, [isOpen]);

  const { mutate: registerStudent, isPending } = usePuts<
    RegisterRequest,
    StudentDto
  >({
    onSuccess: (data) => {
      console.log('학생 등록 성공:', data);
      alert('학생이 성공적으로 등록되었습니다.');
      onSuccess();
      onClose();
      setUserId('');
    },
    onError: (err) => {
      console.error('학생 등록 실패:', err);
      alert('학생 등록에 실패했습니다.');
    },
  });

  const handleSubmit = () => {
    if (!session?.user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!userId.trim()) {
      alert('사용자 ID를 입력해주세요.');
      return;
    }

    const requestData: RegisterRequest = {
      userId: userId.trim(),
    };

    registerStudent({
      putData: requestData,
      path: `/admin/students/${session.user.id}`,
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      title="학생 등록"
      onClose={onClose}
      isBusy={isPending}
    >
      <div className="flex flex-col items-start justify-start gap-6 self-stretch">
        <div className="flex flex-col items-start justify-start gap-4 self-stretch px-2">
          <div className="flex flex-col items-start justify-start gap-2 self-stretch">
            <div className="flex flex-col items-start justify-start gap-2 self-stretch rounded-md">
              <div className="bg-Component---Fill outline-Component---Border inline-flex h-12 items-center justify-start gap-2 self-stretch overflow-hidden rounded-lg px-3 py-2.5 outline outline-1 outline-offset-[-1px]">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="등록할 사용자의 ID를 입력하세요"
                  className="text-color-grey-20 flex-1 justify-start border-none bg-transparent font-['Inter'] text-xs leading-snug font-medium outline-none"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="inline-flex h-14 cursor-pointer items-center justify-center gap-3 self-stretch overflow-hidden rounded-lg bg-[#6366F1] px-7 py-4 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-colors hover:bg-[#5855EB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="text-Text---Button justify-start text-lg font-medium text-white">
              {isPending ? '등록 중...' : '등록하기'}
            </div>
          </button>
        </div>
        <div className="h-9 self-stretch py-2" />
      </div>
    </FormModal>
  );
}
