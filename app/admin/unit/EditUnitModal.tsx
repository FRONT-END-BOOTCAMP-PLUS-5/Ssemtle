'use client';

import { useEffect, useState } from 'react';
import { usePuts } from '@/hooks/usePuts';
import { UnitDto } from '@/backend/admin/units/dtos/UnitDto';
import FormModal from '@/app/_components/admin-modal/FormModal';
import TextField from '@/app/_components/admin-modal/TextField';

interface EditUnitModalProps {
  isOpen: boolean;
  unit: UnitDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface UpdateUnitRequest {
  name: string;
  vidUrl: string;
}

interface UpdateUnitResponse {
  message: string;
  data: UnitDto & { createdAt?: string };
}

export default function EditUnitModal({
  isOpen,
  unit,
  onClose,
  onSuccess,
}: EditUnitModalProps) {
  const [formData, setFormData] = useState<UpdateUnitRequest>({
    name: '',
    vidUrl: '',
  });
  const [errors, setErrors] = useState<Partial<UpdateUnitRequest>>({});

  useEffect(() => {
    if (unit && isOpen) {
      setFormData({ name: unit.name, vidUrl: unit.vidUrl });
      setErrors({});
    }
  }, [unit, isOpen]);

  const { mutate: updateUnit, isPending } = usePuts<
    UpdateUnitRequest,
    UpdateUnitResponse
  >({
    onSuccess: () => {
      setErrors({});
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error('과목 수정 실패:', error);
      alert('과목 수정에 실패했습니다.');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateUnitRequest> = {};
    if (!formData.name.trim()) newErrors.name = '과목명을 입력해주세요.';
    if (!formData.vidUrl.trim()) newErrors.vidUrl = '영상 URL을 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;
    if (!validateForm()) return;

    updateUnit({
      putData: formData,
      path: `/admin/units/${unit.id}`,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof UpdateUnitRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen || !unit) return null;

  return (
    <FormModal
      isOpen={isOpen}
      title="과목수정"
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
            className="inline-flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-lg bg-[#6366F1] px-7 py-4 text-lg leading-normal font-medium text-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] disabled:opacity-50"
          >
            수정하기
          </button>
        </div>
      </form>
    </FormModal>
  );
}
