import type { ITeacherStudentRepository } from '../../../common/domains/repositories/ITeacherStudentRepository';
import type { User } from '../../../common/domains/entities/User';
import type { TeacherStudent } from '../../../common/domains/entities/TeacherStudent';

export class CreateStudentUsecase {
  private teacherStudentRepository: ITeacherStudentRepository;

  constructor(teacherStudentRepository: ITeacherStudentRepository) {
    this.teacherStudentRepository = teacherStudentRepository;
  }

  async execute(
    userId: string,
    teacherId: string
  ): Promise<{ user: User; teacherStudent: TeacherStudent }> {
    if (!userId || userId.trim() === '') {
      throw new Error('사용자 ID가 필요합니다.');
    }

    if (!teacherId || teacherId.trim() === '') {
      throw new Error('선생님 ID가 필요합니다.');
    }

    try {
      return await this.teacherStudentRepository.addExistingStudent(
        userId,
        teacherId
      );
    } catch (error) {
      console.error('기존 학생 등록 오류:', error);
      throw error;
    }
  }
}
