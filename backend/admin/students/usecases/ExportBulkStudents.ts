import type { ITeacherStudentRepository } from '../../../common/domains/repositories/ITeacherStudentRepository';
import type { User } from '../../../common/domains/entities/User';
import type { TeacherStudent } from '../../../common/domains/entities/TeacherStudent';

export class ExportBulkStudents {
  private teacherStudentRepository: ITeacherStudentRepository;

  constructor(teacherStudentRepository: ITeacherStudentRepository) {
    this.teacherStudentRepository = teacherStudentRepository;
  }

  async execute(
    teacherId: string
  ): Promise<Array<{ user: User; teacherStudent: TeacherStudent }>> {
    if (!teacherId || teacherId.trim() === '') {
      throw new Error('선생님 ID가 필요합니다.');
    }

    try {
      return await this.teacherStudentRepository.findBulkCreatedStudents(
        teacherId
      );
    } catch (error) {
      console.error('일괄 등록 학생 내보내기 오류:', error);
      throw error;
    }
  }
}
