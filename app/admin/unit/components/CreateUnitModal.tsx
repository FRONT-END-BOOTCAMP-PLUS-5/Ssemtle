'use client';

import { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { UnitDto } from '@/backend/admin/units/dtos/UnitDto';
import FormModal from '@/app/_components/admin-modal/FormModal';
import TextField from '@/app/_components/admin-modal/TextField';

interface CreateUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateUnitRequest {
  name: string;
  vidUrl: string;
}

interface CreateUnitResponse {
  message: string;
  data: UnitDto;
}

export default function CreateUnitModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUnitModalProps) {
  const [formData, setFormData] = useState<CreateUnitRequest>({
    name: '',
    vidUrl: '',
  });
  const [errors, setErrors] = useState<Partial<CreateUnitRequest>>({});

  const { mutate: createUnit, isPending } = usePosts<
    CreateUnitRequest,
    CreateUnitResponse
  >({
    onSuccess: () => {
      setFormData({ name: '', vidUrl: '' });
      setErrors({});
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error('과목 생성 실패:', error);
      alert('과목 생성에 실패했습니다.');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUnitRequest> = {};
    if (!formData.name.trim()) newErrors.name = '과목명을 입력해주세요.';
    if (!formData.vidUrl.trim()) newErrors.vidUrl = '영상 URL을 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    createUnit({
      postData: formData,
      path: '/admin/units',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateUnitRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal
      isOpen={isOpen}
      title="과목등록"
      onClose={onClose}
      isBusy={isPending}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-start justify-start gap-6"
      >
        <div className="flex w-full flex-col items-start justify-start gap-4 px-2">
          <TextField
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="과목명을 입력하세요"
            disabled={isPending}
            error={errors.name}
          />
          <TextField
            id="vidUrl"
            name="vidUrl"
            value={formData.vidUrl}
            onChange={handleChange}
            placeholder="영상 URL을 입력하세요"
            disabled={isPending}
            error={errors.vidUrl}
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-lg bg-[#6366F1] px-7 py-4 text-lg leading-normal font-medium text-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-colors hover:bg-[#5855EB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            과목등록
          </button>
        </div>
      </form>
    </FormModal>
  );
}
