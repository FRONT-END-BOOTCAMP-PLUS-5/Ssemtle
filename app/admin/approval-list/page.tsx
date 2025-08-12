'use client';
import Image from 'next/image';
import { useGets } from '@/hooks/useGets';
import {
  TeacherAuthDto,
  TeacherAuthListResponseDto,
} from '@/backend/admin/teachers/dtos/TeacherAuthDto';

export default function ApprovalListPage() {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGets<TeacherAuthListResponseDto>(
    ['teacher-auths'],
    '/admin/teachers',
    true,
    undefined,
    undefined,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const handleApprove = async (teacherAuth: TeacherAuthDto) => {
    console.log('승인:', teacherAuth);
    alert(`${teacherAuth.name} 선생님을 승인했습니다.`);
  };

  const handleReject = async (teacherAuth: TeacherAuthDto) => {
    console.log('거절:', teacherAuth);
    alert(`${teacherAuth.name} 선생님을 거절했습니다.`);
  };

  if (isLoading) {
    return (
      <div className="flex h-[932px] w-[430px] flex-col items-center justify-center overflow-hidden bg-white">
        <div className="text-lg font-semibold text-gray-600">
          선생님 승인 목록을 불러오는 중...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[932px] w-[430px] flex-col items-center justify-center overflow-hidden bg-white">
        <div className="mb-4 text-lg font-semibold text-red-600">
          데이터를 불러오는데 실패했습니다
        </div>
        <div className="mb-4 text-sm text-gray-600">
          {error?.message || '서버 오류가 발생했습니다.'}
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-violet-600 px-4 py-2 text-white transition-colors hover:bg-violet-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const teacherAuths = response?.data?.teacherAuths || [];

  if (teacherAuths.length === 0) {
    return (
      <div className="flex h-[932px] w-[430px] flex-col items-center justify-center overflow-hidden bg-white">
        <div className="text-lg font-semibold text-gray-600">
          승인 대기 중인 선생님이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[932px] w-[430px] flex-col items-center overflow-hidden bg-white">
      <div className="mt-12 mb-8">
        <div className="text-[32px] tracking-tight text-neutral-500">
          선생님 승인
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">
          총 {response?.data?.total || 0}건의 승인 요청
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-4">
        {teacherAuths.map((teacherAuth) => (
          <div
            key={teacherAuth.id}
            className="flex h-[265px] w-[360px] flex-col items-start justify-start gap-3 rounded-xl bg-purple-200 p-4"
          >
            <div className="relative h-[184px] w-[320px] overflow-hidden rounded-xl">
              <Image
                className="h-[184px] w-full object-cover bg-blend-luminosity"
                src={teacherAuth.imgUrl || '/images/teacher-profile.png'}
                alt={`${teacherAuth.name} 선생님 프로필`}
                width={320}
                height={184}
                onError={(e) => {
                  e.currentTarget.src = '/images/teacher-profile.png';
                }}
              />
            </div>

            <div className="flex h-[41px] w-full items-center justify-start gap-2 self-stretch">
              <div className="flex flex-1 flex-col items-start justify-start gap-1">
                <div className="font-['Inter'] text-base font-semibold text-zinc-800">
                  {teacherAuth.name}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {teacherAuth.teacherId} | 신청일:{' '}
                  {new Date(teacherAuth.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>

              <button
                onClick={() => handleReject(teacherAuth)}
                className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-white p-3 outline outline-2 outline-offset-[-2px] outline-red-200 transition-colors hover:bg-red-50 hover:outline-red-300"
              >
                <div className="w-10 text-center font-['Inter'] text-sm font-semibold text-red-500 transition-colors hover:text-red-600">
                  거절
                </div>
              </button>

              <button
                onClick={() => handleApprove(teacherAuth)}
                className="flex cursor-pointer items-center justify-center gap-1 rounded-lg bg-violet-600 p-3 transition-colors hover:bg-violet-700"
              >
                <div className="w-10 text-center font-['Inter'] text-sm font-semibold text-white">
                  승인
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-full items-center justify-center pb-4">
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200"
        >
          새로고침
        </button>
      </div>
    </div>
  );
}
