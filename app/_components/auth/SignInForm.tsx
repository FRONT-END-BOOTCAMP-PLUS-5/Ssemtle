'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { signInSchema, type SignInFormData } from '@/libs/zod/auth';

export default function SignInForm() {
  const [errors, setErrors] = useState<Partial<SignInFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string>('');

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setErrors({});
    setAuthError('');

    try {
      const data = {
        id: formData.get('id') as string,
        password: formData.get('password') as string,
      };

      const result = signInSchema.safeParse(data);

      if (!result.success) {
        const fieldErrors: Partial<SignInFormData> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof SignInFormData] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      const signInResult = await signIn('credentials', {
        id: data.id,
        password: data.password,
        redirect: false,
        callbackUrl: '/',
      });

      if (signInResult?.error) {
        setAuthError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else if (signInResult?.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form action={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="id"
            className="block text-sm leading-6 font-medium text-gray-900"
          >
            아이디
          </label>
          <div className="mt-2">
            <input
              id="id"
              name="id"
              type="text"
              required
              autoComplete="username"
              className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="아이디를 입력하세요"
              disabled={isLoading}
            />
            {errors.id && (
              <p className="mt-2 text-sm text-red-600" id="id-error">
                {errors.id}
              </p>
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
              autoComplete="current-password"
              className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600" id="password-error">
                {errors.password}
              </p>
            )}
          </div>
        </div>

        {authError && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-3 text-sm leading-6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">계정이 없으신가요?</p>
          <div className="mt-2 space-x-2">
            <a
              href="/signup/students"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              학생 회원가입
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="/signup/teacher"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              교사 회원가입
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
