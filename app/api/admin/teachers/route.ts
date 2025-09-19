import { NextRequest, NextResponse } from 'next/server';
import { CreateTeacherAuthUsecase } from '@/backend/admin/teachers/usecases/CreateTeacherAuthUsecase';
import { SelectTeacherAuthListUsecase } from '@/backend/admin/teachers/usecases/SelectTeacherAuthListUsecase';
import { DeleteTeacherAuthUsecase } from '@/backend/admin/teachers/usecases/DeleteTeacherAuthUsecase';
import { PrAdmTchrAuthRepository } from '@/backend/common/infrastructures/repositories/PrAdmTchrAuthRepository';
import { ResendEmailService } from '@/backend/common/infrastructures/services/ResendEmailService';
import { ApproveTeacherAuthUsecase } from '@/backend/admin/teachers/usecases/ApproveTeacherAuthUsecase';
import prisma from '@/libs/prisma';

// 교사 인증 요청 생성
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { teacherId, name, email, imgUrl } = requestBody;

    const teacherAuthRepository = new PrAdmTchrAuthRepository(prisma);
    const createTeacherAuthUseCase = new CreateTeacherAuthUsecase(
      teacherAuthRepository
    );

    const teacherAuth = await createTeacherAuthUseCase.execute({
      teacherId,
      name,
      email,
      imgUrl,
    });

    return NextResponse.json(
      {
        message: '교사 인증 요청이 성공적으로 생성되었습니다.',
        data: {
          id: teacherAuth.id,
          teacherId: teacherAuth.teacherId,
          name: teacherAuth.name,
          email: teacherAuth.email,
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
    const selectTeacherAuthUseCase = new SelectTeacherAuthListUsecase(
      teacherAuthRepository
    );

    const result = await selectTeacherAuthUseCase.getAllTeacherAuths();

    return NextResponse.json({
      message: '교사 인증 요청 목록 조회가 완료되었습니다.',
      data: {
        teacherAuths: result.teacherAuths.map((auth) => ({
          id: auth.id,
          teacherId: auth.teacherId,
          name: auth.name,
          email: auth.email,
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

// 교사 인증 요청 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    const teacherAuthRepository = new PrAdmTchrAuthRepository(prisma);
    const emailService = new ResendEmailService();
    const deleteTeacherAuthUseCase = new DeleteTeacherAuthUsecase(
      teacherAuthRepository,
      emailService
    );

    const deletedAuth = await deleteTeacherAuthUseCase.execute(id);

    return NextResponse.json({
      message: '교사 인증 요청이 성공적으로 삭제되었습니다.',
      data: {
        id: deletedAuth.id,
        teacherId: deletedAuth.teacherId,
      },
    });
  } catch (error) {
    console.error('Teacher auth delete error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// 교사 인증 요청 승인
export async function PUT(request: NextRequest) {
  try {
    const { id } = await request.json();
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: '유효한 ID를 입력해주세요.' },
        { status: 400 }
      );
    }

    const teacherAuthRepository = new PrAdmTchrAuthRepository(prisma);
    const approveTeacherAuthUseCase = new ApproveTeacherAuthUsecase(
      teacherAuthRepository
    );

    const approvedAuth = await approveTeacherAuthUseCase.execute(numericId);

    return NextResponse.json({
      message: '교사 인증이 성공적으로 승인되었습니다.',
      data: {
        id: approvedAuth.id,
        teacherId: approvedAuth.teacherId,
      },
    });
  } catch (error) {
    console.error('Teacher auth approval error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
