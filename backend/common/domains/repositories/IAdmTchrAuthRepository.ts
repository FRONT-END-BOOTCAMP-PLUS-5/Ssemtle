import { TeacherAuthorization } from '../entities/TeacherAuthorization';

export interface IAdmTchrAuthRepository {
  create(teacherId: string, imgUrl: string): Promise<TeacherAuthorization>;
  findAll(): Promise<TeacherAuthorization[]>;
  delete(id: number): Promise<TeacherAuthorization>;
  findById(id: number): Promise<TeacherAuthorization | null>;
  updateUserRole(userId: string, role: string): Promise<void>;
}
