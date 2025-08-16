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

    return teacherStudents.map((ts) => ({
      user: {
        id: ts.student.id,
        userId: ts.student.userId,
        password: ts.student.password,
        name: ts.student.name,
        role: ts.student.role,
        point: ts.student.point,
        streak: ts.student.streak,
        createdAt: ts.student.createdAt,
      },
      teacherStudent: {
        id: ts.id,
        teacherId: ts.teacherId,
        studentId: ts.studentId,
        createdAt: ts.createdAt,
      },
    }));
  }

  async addExistingStudent(
    userId: string,
    teacherId: string
  ): Promise<{ user: User; teacherStudent: TeacherStudent }> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 기존 사용자 조회
      const existingUser = await tx.user.findUnique({
        where: { userId },
      });

      if (!existingUser) {
        throw new Error('존재하지 않는 사용자입니다.');
      }

      // 2. 이미 등록되어 있는지 확인
      const existingRelation = await tx.teacherStudent.findFirst({
        where: {
          teacherId,
          studentId: existingUser.id,
        },
      });

      if (existingRelation) {
        throw new Error('이미 등록된 학생입니다.');
      }

      // 3. 선생님-학생 관계 생성
      const teacherStudent = await tx.teacherStudent.create({
        data: {
          teacherId,
          studentId: existingUser.id,
        },
      });

      return {
        user: {
          id: existingUser.id,
          userId: existingUser.userId,
          password: existingUser.password,
          name: existingUser.name,
          role: existingUser.role,
          point: existingUser.point,
          streak: existingUser.streak,
          createdAt: existingUser.createdAt,
        },
        teacherStudent: {
          id: teacherStudent.id,
          teacherId: teacherStudent.teacherId,
          studentId: teacherStudent.studentId,
          createdAt: teacherStudent.createdAt,
        },
      };
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
}
