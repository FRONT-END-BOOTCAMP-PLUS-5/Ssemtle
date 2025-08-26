import type { ITeacherStudentRepository } from '../../../common/domains/repositories/ITeacherStudentRepository';
import type { User } from '../../../common/domains/entities/User';
import type { TeacherStudent } from '../../../common/domains/entities/TeacherStudent';

export class BulkCreateStudentsUsecase {
  private teacherStudentRepository: ITeacherStudentRepository;

  constructor(teacherStudentRepository: ITeacherStudentRepository) {
    this.teacherStudentRepository = teacherStudentRepository;
  }

  async execute(
    studentNames: string,
    teacherId: string
  ): Promise<{
    createdStudents: Array<{ user: User; teacherStudent: TeacherStudent }>;
    failedStudents: Array<{ name: string; reason: string }>;
  }> {
    if (!studentNames || studentNames.trim() === '') {
      throw new Error('학생 이름 목록이 비어있습니다.');
    }

    if (!teacherId || teacherId.trim() === '') {
      throw new Error('선생님 ID가 필요합니다.');
    }

    const names = studentNames
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length === 0) {
      throw new Error('유효한 학생 이름이 없습니다.');
    }

    const createdStudents: Array<{
      user: User;
      teacherStudent: TeacherStudent;
    }> = [];
    const failedStudents: Array<{ name: string; reason: string }> = [];

    for (const name of names) {
      try {
        const isNameExists =
          await this.teacherStudentRepository.isStudentNameExists(
            name,
            teacherId
          );

        if (isNameExists) {
          failedStudents.push({
            name,
            reason: '이미 등록된 학생 이름입니다.',
          });
          continue;
        }

        const userId = await this.generateUniqueUserId();

        const results = await this.teacherStudentRepository.bulkCreateStudents(
          [{ userId, password: '1234', name }],
          teacherId
        );

        createdStudents.push(results[0]);
      } catch (error) {
        console.error(`학생 ${name} 등록 오류:`, error);
        failedStudents.push({
          name,
          reason: '시스템 오류로 등록에 실패했습니다.',
        });
      }
    }

    return {
      createdStudents,
      failedStudents,
    };
  }

  private async generateUniqueUserId(): Promise<string> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const userId = this.generateRandomUserId();
      const isExists =
        await this.teacherStudentRepository.isUserIdExists(userId);

      if (!isExists) {
        return userId;
      }

      attempts++;
    }

    throw new Error('고유한 사용자 ID를 생성할 수 없습니다.');
  }

  private generateRandomUserId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';

    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }
}
