import TeacherSignUpForm from '@/app/_components/auth/TeacherSignUpForm';
import { createMetadata } from '@/libs/metadata';

export const metadata = createMetadata({
  title: '교사 회원가입',
  description:
    '교사 계정을 만들고 학생들의 학습을 체계적으로 관리하세요. 단원평가 생성, 학생 진도 관리 등의 기능을 이용할 수 있습니다.',
  path: '/signup/teacher',
  keywords: [
    '교사 회원가입',
    '선생님 가입',
    '교사 계정',
    '학생 관리',
    '교육 관리',
  ],
});

export default function TeacherSignUpPage() {
  return (
    <div className="flex w-full justify-center">
      <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              교사 회원가입
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              교사 계정을 만들고 인증을 요청하세요
            </p>
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-700">
                교사 회원가입 후 관리자 승인이 필요합니다.
                <br />
                승인 완료까지 일시적으로 제한된 기능만 이용 가능합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 w-sm">
          <div className="w-full rounded-2xl bg-white/90 px-6 py-8 shadow-lg outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px]">
            <TeacherSignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
