import { PrismaClient } from '@prisma/client';
import { TeacherAuthorization } from '@/backend/common/domains/entities/TeacherAuthorization';
import { IAdmTchrAuthCreateRepository } from '@/backend/common/domains/repositories/IAdmTchrAuthCreateRepository';

export class PrAdmTchrAuthCreateRepository implements IAdmTchrAuthCreateRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private mapToEntity(data: TeacherAuthorization): TeacherAuthorization {
    return {
      id: data.id,
      teacherId: data.teacherId,
      imgUrl: data.imgUrl,
      createdAt: data.createdAt,
    };
  }

  async create(teacherId: string, imgUrl: string): Promise<TeacherAuthorization> {
    try {
      // 사용자 존재 여부 검증
      const isUserExists = await this.prisma.user.findUnique({
        where: { id: teacherId },
        select: { id: true },
      });

      if (!isUserExists) {
        console.error('[PrAdmTchrAuthCreateRepository.create] 사용자를 찾을 수 없음', { 
          teacherId 
        });
        throw new Error('존재하지 않는 사용자입니다.');
      }

      const created = await this.prisma.teacherAuthorization.create({
        data: {
          teacherId,
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

      if (error instanceof Error && error.message === '존재하지 않는 사용자입니다.') {
        throw error;
      }
      throw new Error('교사 인증 요청을 저장하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }
}
