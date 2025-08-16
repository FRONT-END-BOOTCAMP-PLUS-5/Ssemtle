'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signUpTeacherSchema,
  type SignUpTeacherFormData,
} from '@/libs/zod/auth';
import { registerTeacher } from '@/libs/api/auth';
import DuplicateChecker from './DuplicateChecker';
import ImageUpload from './ImageUpload';

export default function TeacherSignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpTeacherFormData>({
    userId: '',
    password: '',
    confirmPassword: '',
    name: '',
    teacherName: '',
    imgUrl: '',
  });
  const [errors, setErrors] = useState<Partial<SignUpTeacherFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUserIdAvailable, setIsUserIdAvailable] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user types
    if (errors[name as keyof SignUpTeacherFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, imgUrl: imageUrl }));
    if (errors.imgUrl) {
      setErrors((prev) => ({ ...prev, imgUrl: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data
      const result = signUpTeacherSchema.safeParse(formData);

      if (!result.success) {
        const fieldErrors: Partial<SignUpTeacherFormData> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof SignUpTeacherFormData] =
              issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      // Check if userId is available
      if (!isUserIdAvailable) {
        setErrors({ userId: '사용 가능한 아이디를 입력해주세요' });
        return;
      }

      // Register teacher (2-step process)
      await registerTeacher({
        userId: formData.userId,
        password: formData.password,
        name: formData.name,
        teacherName: formData.teacherName,
        imgUrl: formData.imgUrl,
      });

      // Redirect to pending page on success
      router.push('/signup/teacher/pending');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { error?: string } };
        };
        if (axiosError.response?.data?.error) {
          setErrors({ userId: axiosError.response.data.error });
        } else {
          setErrors({ userId: '회원가입 중 오류가 발생했습니다' });
        }
      } else if (error instanceof Error && error.message) {
        setErrors({ teacherName: error.message });
      } else {
        setErrors({ userId: '회원가입 중 오류가 발생했습니다' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="userId"
            className="block text-sm leading-6 font-medium text-gray-900"
          >
            아이디
          </label>
          <div className="mt-2">
            <input
              id="userId"
              name="userId"
              type="text"
              required
              autoComplete="username"
              value={formData.userId}
              onChange={handleChange}
              className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="아이디를 입력하세요"
              disabled={isLoading}
            />
            <DuplicateChecker
              userId={formData.userId}
              onCheck={setIsUserIdAvailable}
              disabled={isLoading}
            />
            {errors.userId && (
              <p className="mt-2 text-sm text-red-600">{errors.userId}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm leading-6 font-medium text-gray-900"
          >
            비밀번호
          </label>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm leading-6 font-medium text-gray-900"
          >
            비밀번호 확인
          </label>
          <div className="mt-2">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="비밀번호를 다시 입력하세요"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm leading-6 font-medium text-gray-900"
          >
            이름
          </label>
          <div className="mt-2">
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="이름을 입력하세요"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="teacherName"
            className="block text-sm leading-6 font-medium text-gray-900"
          >
            교사명 (증명서상 이름)
          </label>
          <div className="mt-2">
            <input
              id="teacherName"
              name="teacherName"
              type="text"
              required
              value={formData.teacherName}
              onChange={handleChange}
              className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="교사 증명서상의 이름을 입력하세요"
              disabled={isLoading}
            />
            {errors.teacherName && (
              <p className="mt-2 text-sm text-red-600">{errors.teacherName}</p>
            )}
          </div>
        </div>

        <ImageUpload
          onImageUpload={handleImageUpload}
          error={errors.imgUrl}
          disabled={isLoading}
        />

        <div>
          <button
            type="submit"
            disabled={isLoading || !isUserIdAvailable || !formData.imgUrl}
            className="flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-3 text-sm leading-6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? '회원가입 중...' : '교사 회원가입'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <a
              href="/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              로그인
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
