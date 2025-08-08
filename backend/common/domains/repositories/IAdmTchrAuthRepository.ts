import { TeacherAuthorization } from '../entities/TeacherAuthorization';

export interface IAdmTchrAuthRepository {
  create(teacherId: string, imgUrl: string): Promise<TeacherAuthorization>;
  findAll(): Promise<TeacherAuthorization[]>;
}
