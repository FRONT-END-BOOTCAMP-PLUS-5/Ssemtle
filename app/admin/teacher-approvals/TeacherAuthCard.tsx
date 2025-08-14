'use client';
import Image from 'next/image';
import { TeacherAuthDto } from '@/backend/admin/teachers/dtos/TeacherAuthDto';
import TechApproval from './TechApproval';
import TechReject from './TechReject';

interface TeacherAuthCardProps {
  teacherAuth: TeacherAuthDto;
  onSuccess?: () => void;
}

export default function TeacherAuthCard({
  teacherAuth,
  onSuccess,
}: TeacherAuthCardProps) {
  return (
    <div className="flex h-[265px] w-[360px] flex-col items-center justify-center gap-3 rounded-xl border border-[#7949FF] bg-white p-4">
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

      <div className="flex h-[41px] w-full items-center gap-2">
        <div className="flex flex-1 flex-col items-start justify-start gap-1">
          <div className="font-['Inter'] text-base font-semibold text-zinc-800">
            {teacherAuth.name}
          </div>
          <div className="text-xs text-gray-500">
            ID: {teacherAuth.teacherId}
          </div>
        </div>

        <div className="ml-auto inline-flex items-center gap-2">
          <TechReject teacherAuth={teacherAuth} onSuccess={onSuccess} />
          <TechApproval teacherAuth={teacherAuth} onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}
