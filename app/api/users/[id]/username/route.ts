import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrUserRepository } from '@/backend/common/infrastructures/repositories/PrUserRepository';
import { ChangeUsernameUseCase } from '@/backend/auth/usecases/UpdateUserCredentialsUsecases';

const BodySchema = z.object({
  newUserId: z.string().min(1, '새 아이디를 입력해주세요.'),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Next 메시지에 맞게 await 필요
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const json = await req.json();
    const { newUserId } = BodySchema.parse(json);

    const repo = new PrUserRepository();
    const usecase = new ChangeUsernameUseCase(repo);
    const result = await usecase.execute({ id, newUserId });

    if (!result.success) {
      const msg = result.error;
      const status = msg.includes('이미 사용') ? 409 : 400;
      return NextResponse.json({ success: false, error: msg }, { status });
    }

    return NextResponse.json(result);
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
