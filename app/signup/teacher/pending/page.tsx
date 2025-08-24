import Link from 'next/link';

export default function TeacherPendingPage() {
  return (
    <div style={{ backgroundColor: 'rgb(254,247,255)' }}>
      <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-2xl bg-white/90 px-8 py-12 text-center shadow-lg outline-1 outline-offset-[-1px] outline-zinc-300 backdrop-blur-[2px]">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              교사 인증 대기 중
            </h2>

            <div className="space-y-4 text-sm text-gray-600">
              <p>교사 회원가입이 완료되었습니다!</p>
              <p>관리자가 제출하신 교사 증명서를 검토 중입니다.</p>
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 font-medium text-blue-900">다음 단계</h3>
                <ul className="space-y-2 text-left text-blue-700">
                  <li>• 관리자 승인 대기 (보통 1-2일 소요)</li>
                  <li>• 승인 후 모든 교사 기능 이용 가능</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/signin"
                className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                로그인하기
              </Link>
              <Link
                href="/"
                className="flex w-full justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              >
                홈으로 돌아가기
              </Link>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-xs text-gray-500">
                문의사항이 있으시면 관리자에게 연락해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
