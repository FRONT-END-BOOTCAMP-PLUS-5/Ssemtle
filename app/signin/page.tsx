import SignInForm from '@/app/_components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="flex w-full justify-center">
      <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              로그인
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              계정에 로그인하여 학습을 시작하세요
            </p>
          </div>
        </div>

        <div className="mt-8 w-sm">
          <div className="w-full rounded-2xl bg-white/90 px-6 py-8 shadow-lg outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px]">
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}
