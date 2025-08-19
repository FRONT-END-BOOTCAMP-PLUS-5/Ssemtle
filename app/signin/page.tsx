import SignInForm from '@/app/_components/auth/SignInForm';

function SignInError({ error }: { error?: string }) {
  if (!error) return null;

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'CredentialsSignin':
        return '아이디 또는 비밀번호가 올바르지 않습니다.';
      case 'Configuration':
        return '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="text-sm text-red-600">{getErrorMessage(error)}</div>
    </div>
  );
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen">
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

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="rounded-2xl bg-white/90 px-6 py-8 shadow-lg outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px]">
            <SignInError error={error} />

            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}
