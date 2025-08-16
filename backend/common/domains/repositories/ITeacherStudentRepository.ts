import type { User } from '../../../common/domains/entities/User';
import type { TeacherStudent } from '../../../common/domains/entities/TeacherStudent';

export interface ITeacherStudentRepository {
  bulkCreateStudents(
    students: Array<{ userId: string; password: string; name: string }>,
    teacherId: string
  ): Promise<Array<{ user: User; teacherStudent: TeacherStudent }>>;
  isUserIdExists(userId: string): Promise<boolean>;
  isStudentNameExists(name: string, teacherId: string): Promise<boolean>;
}
