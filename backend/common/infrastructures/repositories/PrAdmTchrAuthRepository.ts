import { PrismaClient } from '@prisma/client';
import { TeacherAuthorization } from '@/backend/common/domains/entities/TeacherAuthorization';
import { IAdmTchrAuthRepository } from '@/backend/common/domains/repositories/IAdmTchrAuthRepository';

export class PrAdmTchrAuthRepository implements IAdmTchrAuthRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private mapToEntity(data: TeacherAuthorization): TeacherAuthorization {
    return {
      id: data.id,
      teacherId: data.teacherId,
      name: data.name,
      imgUrl: data.imgUrl,
      createdAt: data.createdAt,
    };
  }

  async create(
    teacherId: string,
    name: string,
    imgUrl: string
  ): Promise<TeacherAuthorization> {
    try {
      // 사용자 존재 여부 검증
      const isUserExists = await this.prisma.user.findUnique({
        where: { id: teacherId },
        select: { id: true },
      });

      if (!isUserExists) {
        console.error(
          '[PrAdmTchrAuthCreateRepository.create] 사용자를 찾을 수 없음',
          {
            teacherId,
          }
        );
        throw new Error('존재하지 않는 사용자입니다.');
      }

      const created = await this.prisma.teacherAuthorization.create({
        data: {
          teacherId,
          name,
          imgUrl,
        },
      });

      return this.mapToEntity(created);
    } catch (error) {
      console.error('교사 인증 요청 생성 실패', {
        teacherId,
        imgUrl,
        error,
      });

      if (
        error instanceof Error &&
        error.message === '존재하지 않는 사용자입니다.'
      ) {
        throw error;
      }
      throw new Error(
        '교사 인증 요청을 저장하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
    }
  }

  async findAll(): Promise<TeacherAuthorization[]> {
    try {
      const teacherAuths = await this.prisma.teacherAuthorization.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return teacherAuths.map((auth) => this.mapToEntity(auth));
    } catch (error) {
      console.error('교사 인증 요청 목록 조회 실패', error);
      throw new Error('교사 인증 요청 목록을 조회하는 중 오류가 발생했습니다.');
    }
  }

  async delete(id: number): Promise<TeacherAuthorization> {
    try {
      const deletedAuth = await this.prisma.teacherAuthorization.delete({
        where: { id },
      });

      return this.mapToEntity(deletedAuth);
    } catch (error) {
      console.error('교사 인증 요청 삭제 실패', { id, error });

      if (
        error instanceof Error &&
        error.message.includes('Record to delete does not exist')
      ) {
        throw new Error('존재하지 않는 교사 인증 요청입니다.');
      }

      throw new Error('교사 인증 요청을 삭제하는 중 오류가 발생했습니다.');
    }
  }

  // 선생님 권한 인증
  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role },
      });
    } catch (error) {
      console.error('사용자 role 업데이트 실패', { userId, role, error });
      throw new Error('사용자 권한 변경 중 오류가 발생했습니다.');
    }
  }

  async findById(id: number): Promise<TeacherAuthorization | null> {
    try {
      const teacherAuth = await this.prisma.teacherAuthorization.findUnique({
        where: { id },
      });

      return teacherAuth ? this.mapToEntity(teacherAuth) : null;
    } catch (error) {
      console.error('교사 인증 요청 조회 실패', { id, error });
      throw new Error('교사 인증 요청을 조회하는 중 오류가 발생했습니다.');
    }
  }

  // teacherId로 교사 인증 요청 조회 (중복 검사용)
  async findByTeacherId(
    teacherId: string
  ): Promise<TeacherAuthorization | null> {
    const teacherAuth = await this.prisma.teacherAuthorization.findFirst({
      where: { teacherId },
    });

    return teacherAuth ? this.mapToEntity(teacherAuth) : null;
  }

  async deleteUser(teacherId: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: teacherId },
      });
    } catch (error) {
      console.error('사용자 계정 삭제 실패:', { teacherId, error });
      throw new Error('사용자 계정 삭제 중 오류가 발생했습니다.');
    }
  }

  async getUserRole(teacherId: string): Promise<string | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: teacherId },
        select: { role: true },
      });
      return user?.role || null;
    } catch (error) {
      console.error('사용자 role 조회 실패:', { teacherId, error });
      throw new Error('사용자 정보 조회 중 오류가 발생했습니다.');
    }
  }
}
