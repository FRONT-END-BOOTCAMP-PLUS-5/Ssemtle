'use client';
import Image from 'next/image';

export default function ApprovalListPage() {
  return (
    <div className="flex h-[932px] w-[430px] flex-col items-center overflow-hidden bg-white">
      <div className="mt-12 mb-8">
        <div className="text-[32px] tracking-tight text-neutral-500">
          선생님 승인
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-hidden px-4">
        <div className="flex h-[265px] w-[360px] flex-col items-start justify-start gap-3 rounded-xl bg-purple-200 p-4">
          <Image
            className="h-[184px] w-[320px] rounded-xl bg-blend-luminosity"
            src="/images/teacher-profile.png"
            alt="선생님 프로필"
            width={320}
            height={184}
          />
          <div className="flex items-center justify-start gap-2 self-stretch">
            <div className="flex flex-1 flex-col items-start justify-start gap-1">
              <div className="font-['Inter'] text-base font-semibold text-zinc-800">
                Jerome Bell
              </div>
            </div>
            <div className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-white p-3 outline outline-2 outline-offset-[-2px] outline-red-200 transition-colors hover:bg-red-50 hover:outline-red-300">
              <div className="w-10 text-center font-['Inter'] text-sm font-semibold text-red-500 group-hover:text-red-600">
                거절
              </div>
            </div>
            <div className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-violet-600 p-3 transition-colors hover:bg-violet-700">
              <div className="w-10 text-center font-['Inter'] text-sm font-semibold text-white">
                승인
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
