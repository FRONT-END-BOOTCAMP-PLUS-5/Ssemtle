import type { User } from '../../../common/domains/entities/User';
import type { TeacherStudent } from '../../../common/domains/entities/TeacherStudent';

export interface ITeacherStudentRepository {
  bulkCreateStudents(
    students: Array<{ userId: string; password: string; name: string }>,
    teacherId: string
  ): Promise<Array<{ user: User; teacherStudent: TeacherStudent }>>;
  isUserIdExists(userId: string): Promise<boolean>;
  isStudentNameExists(name: string, teacherId: string): Promise<boolean>;
  findByTeacherId(
    teacherId: string
  ): Promise<Array<{ user: User; teacherStudent: TeacherStudent }>>;
  addExistingStudent(
    userId: string,
    teacherId: string
  ): Promise<{ user: User; teacherStudent: TeacherStudent }>;
  isStudentAlreadyRegistered(
    userId: string,
    teacherId: string
  ): Promise<boolean>;
  deleteStudent(
    studentId: string,
    teacherId: string
  ): Promise<{ user: User; teacherStudent: TeacherStudent }>;
  findBulkCreatedStudents(
    teacherId: string
  ): Promise<Array<{ user: User; teacherStudent: TeacherStudent }>>;
}
