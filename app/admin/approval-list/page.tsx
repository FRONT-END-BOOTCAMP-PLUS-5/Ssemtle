'use client';
import Image from 'next/image';

export default function ApprovalListPage() {
  return (
    <div className="w-[430PX] h-[932px] relative bg-white overflow-hidden flex flex-col items-center justify-center">
      {/* 페이지 제목 */}
      <div className="w-[176px] h-[56px] left-[127px] top-[136px] absolute justify-start text-neutral-500 text-[32px]  tracking-tight">
        선생님 승인
      </div>

      {/* 승인 리스트 컨테이너 */}
      <div className="left-[35px] top-[214px] absolute inline-flex flex-col justify-center items-center gap-2.5">
        <div className="w-96 h-[859px]">
          {/* 첫 번째 승인 카드 - 승인/거절 버튼 모두 있음 */}
          <div className="w-[344px] h-[265px] p-4 left-0 top-0 absolute bg-purple-200 rounded-xl inline-flex flex-col justify-start items-start gap-3">
            {/* 선생님 프로필 이미지 */}
            <Image
              className="w-80 h-44 relative bg-blend-luminosity rounded-xl"
              src="https://placehold.co/320x184"
              alt="선생님 프로필"
              width={320}
              height={184}
            />
            {/* 선생님 정보 및 버튼 영역 */}
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              {/* 선생님 이름 */}
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                <div className="self-stretch justify-start text-zinc-800 text-base font-semibold font-['Inter']">
                  Jerome Bell
                </div>
              </div>
              {/* 거절 버튼 */}
              <div className="p-3 bg-white rounded-lg outline outline-2 outline-offset-[-2px] outline-red-200 flex justify-center items-center gap-1">
                <div className="w-10 text-center justify-start text-red-500 text-sm font-semibold font-['Inter']">
                  거절
                </div>
              </div>
              {/* 승인 버튼 */}
              <div className="p-3 bg-violet-600 rounded-lg flex justify-center items-center gap-1">
                <div className="w-10 text-center justify-start text-white text-sm font-semibold font-['Inter']">
                  승인
                </div>
              </div>
            </div>
          </div>

          {/* 두 번째 승인 카드 - 거절된 상태 */}
          <div className="w-96 h-64 p-4 left-0 top-[297px] absolute bg-purple-200 rounded-xl inline-flex flex-col justify-start items-start gap-3">
            {/* 선생님 프로필 이미지 */}
            <Image
              className="w-80 h-44 relative bg-blend-luminosity rounded-xl"
              src="https://placehold.co/320x184"
              alt="선생님 프로필"
              width={320}
              height={184}
            />
            {/* 선생님 정보 및 버튼 영역 */}
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              {/* 선생님 이름 */}
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                <div className="self-stretch justify-start text-zinc-800 text-base font-semibold font-['Inter']">
                  Jerome Bell
                </div>
              </div>
              {/* 거절됨 상태 버튼 */}
              <div className="p-3 bg-red-50 rounded-lg outline outline-2 outline-offset-[-2px] outline-red-300 flex justify-center items-center gap-1">
                <div className="w-10 text-center justify-start text-red-600 text-sm font-semibold font-['Inter']">
                  거절
                </div>
              </div>
              {/* 승인 버튼 */}
              <div className="p-3 bg-violet-600 rounded-lg flex justify-center items-center gap-1">
                <div className="w-10 text-center justify-start text-white text-sm font-semibold font-['Inter']">
                  승인
                </div>
              </div>
            </div>
          </div>

          {/* 세 번째 승인 카드 - 승인된 상태 */}
          <div className="w-96 h-64 p-4 left-0 top-[594px] absolute bg-purple-200 rounded-xl inline-flex flex-col justify-start items-start gap-3">
            {/* 선생님 프로필 이미지 */}
            <Image
              className="w-80 h-44 relative bg-blend-luminosity rounded-xl"
              src="https://placehold.co/320x184"
              alt="선생님 프로필"
              width={320}
              height={184}
            />
            {/* 선생님 정보 및 버튼 영역 */}
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              {/* 선생님 이름 */}
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                <div className="self-stretch justify-start text-zinc-800 text-base font-semibold font-['Inter']">
                  Jerome Bell
                </div>
              </div>
              {/* 승인됨 상태 버튼 */}
              <div className="p-3 bg-violet-600 rounded-lg flex justify-center items-center gap-1">
                <div className="w-10 text-center justify-start text-white text-sm font-semibold font-['Inter']">
                  승인
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 홈 인디케이터 */}
      <div
        data-device="iPhone"
        data-orientation="Portrait"
        className="w-96 h-8 left-[27px] top-[900px] absolute"
      >
        <div className="w-36 h-[5px] left-[260px] top-[24px] absolute origin-top-left rotate-180 bg-black rounded-[100px]" />
      </div>
    </div>
  );
}
