// ABOUTME: API endpoint to check if a user ID already exists in the system
// ABOUTME: Used during registration flow to provide real-time duplicate validation
import { NextRequest, NextResponse } from 'next/server';
import { CheckUserIdDuplicateUseCase } from '@/backend/auth/usecases/UserUsecase';
import { PrUserRepository } from '@/backend/common/infrastructures/repositories/PrUserRepository';
import { CheckDuplicateRequestDto, CheckDuplicateResponseDto } from '@/backend/auth/dtos/UserDto';

export async function POST(request: NextRequest) {
  try {
    const body: CheckDuplicateRequestDto = await request.json();

    const userRepository = new PrUserRepository();
    const checkDuplicateUseCase = new CheckUserIdDuplicateUseCase(userRepository);

    const result = await checkDuplicateUseCase.execute(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const response: CheckDuplicateResponseDto = {
      exists: result.exists!,
      message: result.exists ? '이미 존재하는 아이디입니다.' : undefined,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Duplicate check API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}