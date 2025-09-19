import { TeacherAuthorization } from '@/backend/common/domains/entities/TeacherAuthorization';
import { IAdmTchrAuthRepository } from '@/backend/common/domains/repositories/IAdmTchrAuthRepository';
import { IEmailService } from '@/backend/common/domains/repositories/IEmailService';

export class DeleteTeacherAuthUsecase {
  private teacherAuthRepository: IAdmTchrAuthRepository;
  private emailService: IEmailService;

  constructor(
    teacherAuthRepository: IAdmTchrAuthRepository,
    emailService: IEmailService
  ) {
    this.teacherAuthRepository = teacherAuthRepository;
    this.emailService = emailService;
  }

  async execute(id: number): Promise<TeacherAuthorization> {
    if (!id) {
      throw new Error('삭제할 교사 인증 요청의 ID가 필요합니다.');
    }

    try {
      const teacherAuth = await this.teacherAuthRepository.findById(id);
      if (!teacherAuth) {
        throw new Error('존재하지 않는 교사 인증 요청입니다.');
      }

      const deletedAuth = await this.teacherAuthRepository.delete(id);

      const userRole = await this.teacherAuthRepository.getUserRole(
        teacherAuth.teacherId
      );
      if (userRole && userRole !== 'teacher') {
        await this.teacherAuthRepository.deleteUser(teacherAuth.teacherId);
      }

      // 이메일 발송은 실패해도 본 흐름을 막지 않도록 비동기 처리
      this.emailService
        .sendTeacherRejectionEmail(teacherAuth.email, teacherAuth.name)
        .catch((e) =>
          console.error('[DeleteTeacherAuthUsecase] 이메일 발송 실패:', e)
        );

      return deletedAuth;
    } catch (error) {
      console.error('교사 인증 요청 삭제 실패:', error);
      if (error instanceof Error) throw error;
      throw new Error('교사 인증 요청 삭제 중 오류가 발생했습니다.');
    }
  }
}
