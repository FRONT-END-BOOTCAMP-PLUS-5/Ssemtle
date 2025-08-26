'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePosts } from '@/hooks/usePosts';
import type { StudentDto } from '@/backend/admin/students/dtos/StudentDto';
import FormModal from '@/app/_components/admin-modal/FormModal';

interface BulkRegisterRequest {
  studentNames: string;
}

interface BulkRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkRegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkRegisterModalProps) {
  const { data: session } = useSession();
  const [studentNames, setStudentNames] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setStudentNames('');
    }
  }, [isOpen]);

  const { mutate: bulkRegister, isPending } = usePosts<
    BulkRegisterRequest,
    StudentDto
  >({
    onSuccess: (data) => {
      alert(`성공: ${data.successCount}명, 실패: ${data.failureCount}명`);
      onSuccess();
      onClose();
      setStudentNames('');
    },
    onError: (err) => {
      console.error('일괄 등록 실패:', err);
      alert('일괄 등록에 실패했습니다.');
    },
  });

  const handleSubmit = () => {
    if (!session?.user?.id) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!studentNames.trim()) {
      alert('학생 이름을 입력해주세요.');
      return;
    }

    const requestData: BulkRegisterRequest = {
      studentNames: studentNames.trim(),
    };

    bulkRegister({
      postData: requestData,
      path: `/admin/students/${session.user.id}`,
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      title="학생 일괄 등록"
      onClose={onClose}
      isBusy={isPending}
    >
      <div className="flex flex-col items-start justify-start gap-6 self-stretch">
        <div className="flex flex-col items-start justify-start gap-4 self-stretch px-2">
          <div className="flex flex-col items-start justify-start gap-2 self-stretch">
            <div className="flex flex-col items-start justify-start gap-2 self-stretch rounded-md">
              <div className="mb-3 flex self-stretch rounded-lg border border-blue-200 bg-blue-50 p-3">
                <span className="flex text-sm font-semibold text-blue-800">
                  모든 학생의 초기 비밀번호: 1234
                </span>
              </div>
              <div className="bg-Component---Fill outline-Component---Border inline-flex h-12 items-center justify-start gap-2 self-stretch overflow-hidden rounded-lg px-3 py-2.5 outline outline-1 outline-offset-[-1px]">
                <input
                  type="text"
                  value={studentNames}
                  onChange={(e) => setStudentNames(e.target.value)}
                  placeholder="등록할 학생 이름을 입력해 주세요. ex)홍길동, 이순신"
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
