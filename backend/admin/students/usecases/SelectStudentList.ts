import type { ITeacherStudentRepository } from '../../../common/domains/repositories/ITeacherStudentRepository';
import type { User } from '../../../common/domains/entities/User';
import type { TeacherStudent } from '../../../common/domains/entities/TeacherStudent';

export class SelectStudentList {
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
      return await this.teacherStudentRepository.findByTeacherId(teacherId);
    } catch (error) {
      console.error('학생 목록 조회 오류:', error);
      throw new Error('학생 목록을 조회하는 중 오류가 발생했습니다.');
    }
  }
}
