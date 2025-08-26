import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrUserRepository } from '@/backend/common/infrastructures/repositories/PrUserRepository';
import { ChangePasswordUseCase } from '@/backend/auth/usecases/UpdateUserCredentialsUsecases';

const BodySchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
  newPassword: z.string().min(6, '새 비밀번호는 6자리 이상이어야 합니다.'),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // await 필요
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const json = await req.json();
    const { currentPassword, newPassword } = BodySchema.parse(json);

    const repo = new PrUserRepository();
    const usecase = new ChangePasswordUseCase(repo);
    const result = await usecase.execute({ id, currentPassword, newPassword });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.issues?.[0]?.message ?? '잘못된 요청' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
