import { IUserRepository } from '@/backend/common/domains/repositories/IUserRepository';
import { AuthenticatedUserDto } from '../dtos/UserDto';

export class GetUserInfoUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<AuthenticatedUserDto | null> {
    const user = await this.userRepository.findByUserId(userId);
    if (!user) return null;

    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    };
  }
}
