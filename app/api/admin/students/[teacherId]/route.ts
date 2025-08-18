import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/libs/prisma';
import { BulkCreateStudentsUsecase } from '@/backend/admin/students/usecases/BulkCreateStudentsUsecase';
import { SelectStudentList } from '@/backend/admin/students/usecases/SelectStudentList';
import { CreateStudentUsecase } from '@/backend/admin/students/usecases/CreateStudentUsecase';
import { ExportBulkStudents } from '@/backend/admin/students/usecases/ExportBulkStudents';
import { PrTeacherStudentRepository } from '@/backend/common/infrastructures/repositories/PrTeacherStudentRepository';

//학생 일괄 등록
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params;
    const body = await request.json();
    const { studentNames } = body;

    if (!studentNames) {
      return NextResponse.json(
        { error: '학생 이름 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    const repository = new PrTeacherStudentRepository(prisma);
    const usecase = new BulkCreateStudentsUsecase(repository);

    const result = await usecase.execute(studentNames, teacherId);

    const response = {
      successCount: result.createdStudents.length,
      failureCount: result.failedStudents.length,
      createdStudents: result.createdStudents.map(
        ({ user, teacherStudent }) => ({
          id: user.id,
          userId: user.userId,
          name: user.name,
          teacherStudentId: teacherStudent.id,
        })
      ),
      failedStudents: result.failedStudents,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('학생 일괄 등록 오류:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

//학생 목록 조회(엑셀 내보내기 추가)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const repository = new PrTeacherStudentRepository(prisma);

    if (type === 'bulk') {
      // 일괄 등록 학생만 내보내기
      const usecase = new ExportBulkStudents(repository);
      const result = await usecase.execute(teacherId);

      const response = {
        students: result.map(({ user }) => ({
          userId: user.userId,
          password: '1234',
          name: user.name,
          point: user.point,
          streak: user.streak,
          createdAt: user.createdAt,
        })),
        total: result.length,
      };

      return NextResponse.json(response, { status: 200 });
    } else {
      // 전체 학생 목록 조회
      const usecase = new SelectStudentList(repository);
      const result = await usecase.execute(teacherId);

      const response = {
        students: result.map(({ user }) => ({
          id: user.id,
          userId: user.userId,
          name: user.name,
          point: user.point,
          streak: user.streak,
          createdAt: user.createdAt,
        })),
        total: result.length,
      };

      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    console.error('학생 조회 오류:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

//기존 사용자를 학생으로 등록
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const repository = new PrTeacherStudentRepository(prisma);
    const usecase = new CreateStudentUsecase(repository);

    const result = await usecase.execute(userId, teacherId);

    const response = {
      id: result.user.id,
      userId: result.user.userId,
      name: result.user.name,
      point: result.user.point,
      streak: result.user.streak,
      teacherStudentId: result.teacherStudent.id,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('기존 학생 등록 오류:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
