import { NextRequest, NextResponse } from 'next/server';
import { CreateTeacherAuthUseCase } from '@/backend/admin/teacher/usecases/CreateTeacherAuthUseCase';
import { SelectTeacherAuthListUseCase } from '@/backend/admin/teacher/usecases/SelectTeacherAuthListUseCase';
import { PrAdmTchrAuthRepository } from '@/backend/common/infrastructures/repositories/PrAdmTchrAuthRepository';
import prisma from '@/libs/prisma';

// 교사 인증 요청 생성
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { teacherId, imgUrl } = requestBody;

    const teacherAuthRepository = new PrAdmTchrAuthRepository(prisma);
    const createTeacherAuthUseCase = new CreateTeacherAuthUseCase(
      teacherAuthRepository
    );

    const teacherAuth = await createTeacherAuthUseCase.execute({
      teacherId,
      imgUrl,
    });

    return NextResponse.json(
      {
        message: '교사 인증 요청이 성공적으로 생성되었습니다.',
        data: {
          id: teacherAuth.id,
          teacherId: teacherAuth.teacherId,
          imgUrl: teacherAuth.imgUrl,
          createdAt: teacherAuth.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Teacher auth creation error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// 교사 인증 요청 목록 조회
export async function GET() {
  try {
    const teacherAuthRepository = new PrAdmTchrAuthRepository(prisma);
    const selectTeacherAuthUseCase = new SelectTeacherAuthListUseCase(
      teacherAuthRepository
    );

    const result = await selectTeacherAuthUseCase.getAllTeacherAuths();

    return NextResponse.json({
      message: '교사 인증 요청 목록 조회가 완료되었습니다.',
      data: {
        teacherAuths: result.teacherAuths.map((auth) => ({
          id: auth.id,
          teacherId: auth.teacherId,
          imgUrl: auth.imgUrl,
          createdAt: auth.createdAt,
        })),
        total: result.total,
      },
    });
  } catch (error) {
    console.error('Teacher auth list error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
