import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex w-full justify-center">
      <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              회원가입
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              계정 유형을 선택하여 회원가입을 진행하세요
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-2xl bg-white/90 px-8 py-12 shadow-lg outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px]">
            <div className="space-y-6">
              <div>
                <Link
                  href="/signup/students"
                  className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">학생으로 시작하기</div>
                    <div className="mt-1 text-sm opacity-90">
                      문제를 풀고 학습을 진행하세요
                    </div>
                  </div>
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">또는</span>
                </div>
              </div>

              <div>
                <Link
                  href="/signup/teacher"
                  className="group relative flex w-full justify-center rounded-lg bg-white px-4 py-6 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 transition-colors ring-inset hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">교사로 시작하기</div>
                    <div className="mt-1 text-sm text-gray-600">
                      학생들을 관리하고 교육하세요
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link
                  href="/signin"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  로그인
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
