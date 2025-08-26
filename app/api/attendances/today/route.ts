import { NextResponse } from 'next/server';
import { auth } from '@/auth';

import { PrAttendanceRepository } from '@/backend/common/infrastructures/repositories/PrAttendanceRepository';
import { GetTodayAttendanceUsecase } from '@/backend/attendances/usecases/GetTodayAttendanceUsecase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/attendances/today
 * - 오늘 날짜 기준 solves 개수를 조회하여, 출석 목표 대비 진행률을 반환
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const repository = new PrAttendanceRepository();
    const usecase = new GetTodayAttendanceUsecase(repository);

    const result = await usecase.execute({
      userId: session.user.id,
      dailyTarget: 10,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in GET /api/attendances/today:', error);
    return NextResponse.json(
      {
        success: false,
        message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 }
    );
  }
}
