import type { ITeacherStudentRepository } from '../../../common/domains/repositories/ITeacherStudentRepository';
import type { User } from '../../../common/domains/entities/User';
import type { TeacherStudent } from '../../../common/domains/entities/TeacherStudent';

export class DeleteStudent {
  private teacherStudentRepository: ITeacherStudentRepository;

  constructor(teacherStudentRepository: ITeacherStudentRepository) {
    this.teacherStudentRepository = teacherStudentRepository;
  }

  async execute(
    studentId: string,
    teacherId: string
  ): Promise<{ user: User; teacherStudent: TeacherStudent }> {
    if (!studentId || studentId.trim() === '') {
      throw new Error('학생 ID가 필요합니다.');
    }

    if (!teacherId || teacherId.trim() === '') {
      throw new Error('선생님 ID가 필요합니다.');
    }

    try {
      return await this.teacherStudentRepository.deleteStudent(
        studentId,
        teacherId
      );
    } catch (error) {
      console.error('학생 삭제 오류:', error);
      throw error;
    }
  }
}
