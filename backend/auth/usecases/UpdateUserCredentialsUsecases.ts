// ABOUTME: User credential update use cases (username & password)
import bcrypt from 'bcryptjs';
import { IUserRepository } from '@/backend/common/domains/repositories/IUserRepository';

export class ChangeUsernameUseCase {
  private readonly userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(params: {
    id: string;
    newUserId: string;
  }): Promise<
    | {
        success: true;
        user: { id: string; userId: string; name: string; role: string };
      }
    | { success: false; error: string }
  > {
    const { id, newUserId } = params;

    if (!id || !newUserId?.trim()) {
      return { success: false, error: 'id와 새로운 아이디를 입력해주세요.' };
    }

    // 중복 체크
    const exists = await this.userRepository.findByUserId(newUserId);
    if (exists) {
      return { success: false, error: '이미 사용 중인 아이디입니다.' };
    }

    // 존재 확인
    const user = await this.userRepository.findById(id);
    if (!user) {
      return { success: false, error: '존재하지 않는 사용자입니다.' };
    }

    const updated = await this.userRepository.updateUserId(id, newUserId);
    return {
      success: true,
      user: {
        id: updated.id,
        userId: updated.userId,
        name: updated.name,
        role: updated.role,
      },
    };
  }
}

export class ChangePasswordUseCase {
  private readonly userRepository: IUserRepository;
  private readonly saltRounds = 12;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(params: {
    id: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: true } | { success: false; error: string }> {
    const { id, currentPassword, newPassword } = params;

    if (!id || !currentPassword || !newPassword) {
      return {
        success: false,
        error: 'id, 현재 비밀번호, 새 비밀번호를 모두 입력해주세요.',
      };
    }
    if (newPassword.length < 6) {
      return {
        success: false,
        error: '새 비밀번호는 6자리 이상이어야 합니다.',
      };
    }

    const user = await this.userRepository.findById(id);
    if (!user) return { success: false, error: '존재하지 않는 사용자입니다.' };

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
      return { success: false, error: '현재 비밀번호가 올바르지 않습니다.' };

    const hash = await bcrypt.hash(newPassword, this.saltRounds);
    await this.userRepository.updatePasswordHash(id, hash);

    return { success: true };
  }
}
