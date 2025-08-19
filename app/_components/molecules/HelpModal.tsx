'use client';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">도움말</h2>
                <button
                  onClick={onClose}
                  className="text-white transition-colors hover:text-gray-200"
                  aria-label="닫기"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-md mb-2 font-semibold text-gray-800">
                    수식 입력 방법
                  </h3>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">분수 표기법:</span> 1/3 → ¼
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    기타 기호
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>+ : 덧셈</div>
                    <div>- : 뺄셈</div>
                    <div>× : 곱셈</div>
                    <div>/ : 나눗셈</div>
                    <div>√ : 제곱근</div>
                    <div>^ : 거듭제곱</div>
                    <div>π : 파이</div>
                    <div>( ) : 괄호</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4">
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-violet-500 px-4 py-2 font-medium text-white transition-colors hover:bg-violet-600"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
