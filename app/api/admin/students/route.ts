import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/libs/prisma';
import { BulkCreateStudentsUsecase } from '@/backend/admin/students/usecases/BulkCreateStudentsUsecase';
import { PrTeacherStudentRepository } from '@/backend/common/infrastructures/repositories/PrTeacherStudentRepository';

//학생 일괄 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentNames, teacherId } = body;

    if (!teacherId) {
      return NextResponse.json(
        { error: '선생님 ID가 필요합니다.' },
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json(
        { error: '선생님 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: '학생 목록 조회 기능은 향후 구현 예정입니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('학생 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
