import { TeacherAuthorization } from '../entities/TeacherAuthorization';

export interface IAdmTchrAuthCreateRepository {
  create(teacherId: string, imgUrl: string): Promise<TeacherAuthorization>;
  findAll(): Promise<TeacherAuthorization[]>;
}
