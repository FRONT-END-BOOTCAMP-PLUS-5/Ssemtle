import SignUpForm from '@/app/_components/auth/SignUpForm';

function SignUpMessage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const { message } = searchParams;

  if (!message) return null;

  if (message === 'success') {
    return (
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="text-sm text-green-600">
          회원가입이 완료되었습니다. 로그인해주세요.
        </div>
      </div>
    );
  }

  return null;
}

export default async function StudentSignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen">
      <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              학생 회원가입
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              새로운 계정을 만들어 학습을 시작하세요
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="rounded-2xl bg-white/90 px-6 py-8 shadow-lg outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px]">
            <SignUpMessage searchParams={params} />
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
