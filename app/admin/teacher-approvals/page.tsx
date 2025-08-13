'use client';
import Image from 'next/image';
import { useGets } from '@/hooks/useGets';
import { TeacherAuthListResponseDto } from '@/backend/admin/teachers/dtos/TeacherAuthDto';
import TechApproval from './TechApproval';
import TechReject from './TechReject';

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
                alt={`${teacherAuth.name} 선생님 인증 이미지`}
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
                  ID: {teacherAuth.teacherId}
                </div>
              </div>
              <TechReject teacherAuth={teacherAuth} onSuccess={refetch} />
              <TechApproval teacherAuth={teacherAuth} onSuccess={refetch} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
