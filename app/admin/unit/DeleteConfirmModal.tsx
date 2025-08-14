'use client';

import FormModal from '@/app/_components/admin-modal/FormModal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  name?: string;
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  name,
  isBusy,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      title="과목 삭제"
      onClose={onCancel}
      isBusy={isBusy}
    >
      <div className="flex w-full flex-col gap-6 px-2">
        <div className="text-sm leading-6 text-gray-700">
          <p className="m-0 break-keep whitespace-normal">
            <span className="font-semibold text-gray-900">“{name}”</span> 과목을
            삭제하시겠습니까?
          </p>
          <p className="m-0 break-keep whitespace-normal">
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>
    </FormModal>
  );
}
