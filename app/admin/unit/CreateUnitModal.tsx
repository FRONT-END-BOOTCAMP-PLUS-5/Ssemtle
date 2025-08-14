'use client';

import { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { UnitDto } from '@/backend/admin/units/dtos/UnitDto';

interface CreateUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// 과목 생성 요청 타입
interface CreateUnitRequest {
  name: string;
  vidUrl: string;
}

// 과목 생성 응답 타입
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

  // 과목 생성 API 호출
  const { mutate: createUnit, isPending } = usePosts<
    CreateUnitRequest,
    CreateUnitResponse
  >({
    onSuccess: (data) => {
      console.log('과목 생성 성공:', data);
      // 폼 초기화
      setFormData({ name: '', vidUrl: '' });
      setErrors({});
      // 성공 콜백 실행
      onSuccess();
      // 모달 닫기
      onClose();
    },
    onError: (error) => {
      console.error('과목 생성 실패:', error);
      alert('과목 생성에 실패했습니다.');
    },
  });

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUnitRequest> = {};

    if (!formData.name.trim()) {
      newErrors.name = '과목명을 입력해주세요.';
    }

    if (!formData.vidUrl.trim()) {
      newErrors.vidUrl = '영상 URL을 입력해주세요.';
    } else if (!isValidUrl(formData.vidUrl)) {
      newErrors.vidUrl = '올바른 URL 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL 유효성 검사 함수
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // API 호출
    createUnit({
      postData: formData,
      path: '/admin/units',
    });
  };

  // 입력 필드 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 입력 시 에러 메시지 제거
    if (errors[name as keyof CreateUnitRequest]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <>
      <div
        className="bg-opacity-50 fixed inset-0 z-40 bg-black"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          {/* 모달 헤더 */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">과목 등록</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isPending}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* 모달 바디 - 폼 */}
          <form onSubmit={handleSubmit}>
            {/* 과목명 입력 필드 */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                과목명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 일차함수"
                className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                disabled={isPending}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* 영상 URL 입력 필드 */}
            <div className="mb-6">
              <label
                htmlFor="vidUrl"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                영상 URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="vidUrl"
                name="vidUrl"
                value={formData.vidUrl}
                onChange={handleChange}
                placeholder="https://example.com/video"
                className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none ${
                  errors.vidUrl
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                disabled={isPending}
              />
              {errors.vidUrl && (
                <p className="mt-1 text-sm text-red-500">{errors.vidUrl}</p>
              )}
            </div>

            {/* 버튼 그룹 */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={isPending}
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-400 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? '등록 중...' : '등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
