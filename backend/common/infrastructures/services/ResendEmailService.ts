// Resend API를 통한 이메일 발송 구현 (Infra 전용)
import { IEmailService } from '@/backend/common/domains/repositories/IEmailService';
import { Resend } from 'resend';

export class ResendEmailService implements IEmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = new Resend(apiKey);
  }

  async sendTeacherRejectionEmail(
    email: string,
    teacherName: string
  ): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('[ResendEmailService] RESEND_API_KEY 미설정');
        return false;
      }

      const subject = '[Ssemtle] 교사 인증 요청 결과 안내';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Ssemtle 교사 인증 요청 결과 안내</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; color: #333; margin: 0;">
              안녕하세요, <strong>${teacherName}</strong>님.
            </p>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; color: #856404; margin: 0;">
              죄송합니다. 제출해주신 교사 인증 요청이 승인되지 않았습니다.
            </p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">다음 단계 안내</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>다시 승인을 요청하시려면, 번거로우시겠지만 재가입 절차를 진행해 주시면 감사하겠습니다.</li>
            </ul>
          </div>
      `;
      const text = `
Ssemtle 교사 인증 요청 결과 안내

안녕하세요, ${teacherName}님.

죄송합니다. 제출해주신 교사 인증 요청이 승인되지 않았습니다.

다음 단계 안내:
- 다시 승인을 요청하시려면, 재가입 절차를 진행해 주시면 감사하겠습니다.

      `;

      const result = await this.resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ||
          'Ssemtle Notifications <no-reply@ssemtle.com>',
        to: [email],
        subject,
        html,
        text,
        replyTo: 'no-reply@ssemtle.com',
      });

      if (result.error) {
        console.error('[ResendEmailService] Resend 오류:', result.error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('[ResendEmailService] 발송 실패:', e);
      return false;
    }
  }
}
