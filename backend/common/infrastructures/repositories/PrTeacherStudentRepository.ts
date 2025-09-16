import {
  PrismaClient,
  type User as PrismaUser,
  type TeacherStudent as PrismaTeacherStudent,
} from '@/app/generated/prisma/client';
import type { ITeacherStudentRepository } from '../../domains/repositories/ITeacherStudentRepository';
import type { User } from '../../domains/entities/User';
import type { TeacherStudent } from '../../domains/entities/TeacherStudent';
import bcrypt from 'bcryptjs';

export class PrTeacherStudentRepository implements ITeacherStudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async bulkCreateStudents(
    students: Array<{ userId: string; password: string; name: string }>,
    teacherId: string
  ): Promise<Array<{ user: User; teacherStudent: TeacherStudent }>> {
    return await this.prisma.$transaction(async (tx) => {
      const results: Array<{ user: User; teacherStudent: TeacherStudent }> = [];

      for (const student of students) {
        const hashedPassword = await bcrypt.hash(student.password, 10);

        const user = await tx.user.create({
          data: {
            userId: student.userId,
            password: hashedPassword,
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

        results.push(this.mapToResult(user, teacherStudent));
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

  async findByTeacherId(
    teacherId: string
  ): Promise<Array<{ user: User; teacherStudent: TeacherStudent }>> {
    const teacherStudents = await this.prisma.teacherStudent.findMany({
      where: { teacherId },
      include: {
        student: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return teacherStudents.map((ts) => this.mapToResult(ts.student, ts));
  }

  async addExistingStudent(
    userId: string,
    teacherId: string
  ): Promise<{ user: User; teacherStudent: TeacherStudent }> {
    return await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { userId },
      });

      if (!existingUser) {
        throw new Error('존재하지 않는 사용자입니다.');
      }

      const existingRelation = await tx.teacherStudent.findFirst({
        where: {
          teacherId,
          studentId: existingUser.id,
        },
      });

      if (existingRelation) {
        throw new Error('이미 등록된 학생입니다.');
      }

      const teacherStudent = await tx.teacherStudent.create({
        data: {
          teacherId,
          studentId: existingUser.id,
        },
      });

      return this.mapToResult(existingUser, teacherStudent);
    });
  }

  async isStudentAlreadyRegistered(
    userId: string,
    teacherId: string
  ): Promise<boolean> {
    const existingUser = await this.prisma.user.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!existingUser) {
      return false;
    }

    const existingRelation = await this.prisma.teacherStudent.findFirst({
      where: {
        teacherId,
        studentId: existingUser.id,
      },
      select: { id: true },
    });

    return !!existingRelation;
  }

  async findBulkCreatedStudents(
    teacherId: string
  ): Promise<Array<{ user: User; teacherStudent: TeacherStudent }>> {
    const teacherStudents = await this.prisma.teacherStudent.findMany({
      where: {
        teacherId,
        student: {
          role: 'student',
        },
      },
      include: {
        student: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 대문자 영문 6자리 패턴으로 필터링
    const bulkCreatedStudents = teacherStudents.filter((ts) =>
      /^[A-Z]{6}$/.test(ts.student.userId)
    );

    return bulkCreatedStudents.map((ts) => this.mapToResult(ts.student, ts));
  }

  async deleteStudent(
    studentId: string,
    teacherId: string
  ): Promise<{ user: User; teacherStudent: TeacherStudent }> {
    return await this.prisma.$transaction(async (tx) => {
      const teacherStudent = await tx.teacherStudent.findFirst({
        where: {
          teacherId,
          studentId,
        },
        include: {
          student: true,
        },
      });

      if (!teacherStudent) {
        throw new Error('등록되지 않은 학생입니다.');
      }

      await tx.teacherStudent.delete({
        where: {
          id: teacherStudent.id,
        },
      });

      return this.mapToResult(teacherStudent.student, teacherStudent);
    });
  }

  private mapToResult(
    user: PrismaUser,
    teacherStudent: PrismaTeacherStudent
  ): { user: User; teacherStudent: TeacherStudent } {
    return {
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
    };
  }
}
