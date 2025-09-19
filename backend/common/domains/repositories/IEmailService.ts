export interface IEmailService {
  sendTeacherRejectionEmail(
    email: string,
    teacherName: string
  ): Promise<boolean>;
}
