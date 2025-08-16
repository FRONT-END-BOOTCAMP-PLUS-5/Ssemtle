import { PrismaClient } from '@prisma/client';
import type { ITeacherStudentRepository } from '../../domains/repositories/ITeacherStudentRepository';
import type { User } from '../../domains/entities/User';
import type { TeacherStudent } from '../../domains/entities/TeacherStudent';

export class PrTeacherStudentRepository implements ITeacherStudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async bulkCreateStudents(
    students: Array<{ userId: string; password: string; name: string }>,
    teacherId: string
  ): Promise<Array<{ user: User; teacherStudent: TeacherStudent }>> {
    return await this.prisma.$transaction(async (tx) => {
      const results: Array<{ user: User; teacherStudent: TeacherStudent }> = [];

      for (const student of students) {
        const user = await tx.user.create({
          data: {
            userId: student.userId,
            password: student.password,
            name: student.name,
            role: 'student',
            point: 0,
            streak: 0,
          },
        });

        const teacherStudent = await tx.teacherStudent.create({
          data: {
            teacherId,
            studentId: user.id,
          },
        });

        results.push({
          user: {
            id: user.id,
            userId: user.userId,
            password: user.password,
            name: user.name,
            role: user.role,
            point: user.point,
            streak: user.streak,
            createdAt: user.createdAt,
          },
          teacherStudent: {
            id: teacherStudent.id,
            teacherId: teacherStudent.teacherId,
            studentId: teacherStudent.studentId,
            createdAt: teacherStudent.createdAt,
          },
        });
      }

      return results;
    });
  }

  async isUserIdExists(userId: string): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: { userId },
      select: { id: true },
    });
    return !!existingUser;
  }

  async isStudentNameExists(name: string, teacherId: string): Promise<boolean> {
    const existingStudent = await this.prisma.teacherStudent.findFirst({
      where: {
        teacherId,
        student: {
          name,
          role: 'student',
        },
      },
      select: { id: true },
    });
    return !!existingStudent;
  }
}
