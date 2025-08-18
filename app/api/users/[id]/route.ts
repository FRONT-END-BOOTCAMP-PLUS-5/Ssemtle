// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { GetUserInfoUseCase } from '@/backend/auth/usecases/GetUserInfoUsecase';
import { PrUserRepository } from '@/backend/common/infrastructures/repositories/PrUserRepository';

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const userId = id;

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const usecase = new GetUserInfoUseCase(new PrUserRepository());
  const user = await usecase.execute(userId);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}
