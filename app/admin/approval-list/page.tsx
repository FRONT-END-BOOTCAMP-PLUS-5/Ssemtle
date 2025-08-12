'use client';
import Image from 'next/image';

export default function ApprovalListPage() {
  return (
    <div className="w-96 h-[932px] relative bg-white overflow-hidden">
      {/* 상단 상태바 */}
      <div
        data-background="False"
        className="w-96 h-12 pt-5 left-0 top-0 absolute inline-flex flex-col justify-start items-start"
      >
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex-1 pl-4 pr-1.5 flex justify-center items-center gap-2.5">
            <div className="text-center justify-start text-black text-base font-['SF_Pro'] leading-snug">
              9:41
            </div>
          </div>
          <div className="w-32 h-2.5" />
          <div className="flex-1 pl-1.5 pr-4 flex justify-center items-center gap-1.5">
            <div className="w-5 h-3 bg-black" />
            <div className="w-4 h-3 bg-black" />
            <div className="w-6 h-3 opacity-30 rounded border border-black" />
            <div className="w-[1.33px] h-1 opacity-40 bg-black" />
            <div className="w-5 h-2 bg-black rounded-sm" />
          </div>
        </div>
      </div>

      {/* 헤더 영역 */}
      <div className="w-96 h-16 left-0 top-[48px] absolute bg-white">
        {/* 로고 아이콘 */}
        <div className="w-6 h-6 left-[26px] top-[16px] absolute bg-violet-900 border-black" />
        {/* 앱 이름 */}
        <div className="w-28 h-8 left-[155px] top-[12px] absolute text-center justify-center text-violet-900 text-base font-['SF_Pro'] leading-snug">
          semtle
        </div>
      </div>

      {/* 페이지 제목 */}
      <div className="left-[127px] top-[136px] absolute justify-start text-neutral-500 text-4xl font-semibold font-['Poppins'] tracking-tight">
        선생님 승인
      </div>

      {/* 승인 리스트 컨테이너 */}
      <div className="left-[35px] top-[214px] absolute inline-flex flex-col justify-center items-center gap-2.5">
        <div className="w-96 h-[859px] relative">
          {/* 첫 번째 승인 카드 - 승인/거절 버튼 모두 있음 */}
          <div className="w-96 h-64 p-4 left-0 top-0 absolute bg-purple-200 rounded-xl inline-flex flex-col justify-start items-start gap-3">
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
