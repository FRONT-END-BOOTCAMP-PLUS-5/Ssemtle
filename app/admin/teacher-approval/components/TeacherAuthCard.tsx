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
    <div className="mx-auto w-full max-w-[280px] rounded-xl border-2 border-[#7949FF] bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <div className="p-0">
        <div className="rounded-t-xl bg-gradient-to-r from-[#7949FF] via-[#8979FF] to-[#7A6AFF] p-2 text-center text-white">
          <div className="mb-0.5 text-xs font-semibold">대한민국 교육부</div>
          <div className="text-xs opacity-90">교원자격증</div>
        </div>

        <div className="p-3 text-center">
          <div className="relative mx-auto mb-2">
            <Image
              src={teacherAuth.imgUrl || '/images/teacher-profile.png'}
              alt={`${teacherAuth.name} 선생님 인증 이미지`}
              width={240}
              height={224}
              className="h-56 w-full rounded-lg border-2 border-gray-300 object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/teacher-profile.png';
              }}
            />
          </div>

          <div className="space-y-1 text-sm">
            <div className="text-lg font-bold text-gray-900">
              {teacherAuth.name}
            </div>
            <div className="h-px w-full bg-gray-400"></div>
            <div className="font-mono text-xs text-gray-600">
              ID: {teacherAuth.teacherId}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <TechReject teacherAuth={teacherAuth} onSuccess={onSuccess} />
            <TechApproval teacherAuth={teacherAuth} onSuccess={onSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
