import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/libs/prisma';
import { DeleteStudent } from '@/backend/admin/students/usecases/DeleteStudent';
import { PrTeacherStudentRepository } from '@/backend/common/infrastructures/repositories/PrTeacherStudentRepository';

//학생 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string; id: string }> }
) {
  try {
    const { teacherId, id: studentId } = await params;

    const repository = new PrTeacherStudentRepository(prisma);
    const usecase = new DeleteStudent(repository);

    const result = await usecase.execute(studentId, teacherId);

    const response = {
      id: result.user.id,
      userId: result.user.userId,
      name: result.user.name,
      message: '학생이 성공적으로 삭제되었습니다.',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('학생 삭제 오류:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
