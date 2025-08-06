// ABOUTME: User registration API endpoint following clean architecture
// ABOUTME: Handles HTTP requests and delegates business logic to use cases
import { NextRequest, NextResponse } from 'next/server';
import { CreateUserUseCase } from '@/backend/auth/usecases/UserUsecase';
import { PrUserRepository } from '@/backend/common/infrastructures/repositories/PrUserRepository';
import { CreateUserRequestDto } from '@/backend/auth/dtos/UserDto';

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequestDto = await request.json();
    
    const userRepository = new PrUserRepository();
    const createUserUseCase = new CreateUserUseCase(userRepository);
    
    const result = await createUserUseCase.execute(body);

    if (!result.success) {
      const status = result.error?.includes('이미 존재하는') ? 409 : 400;
      return NextResponse.json(
        { error: result.error },
        { status }
      );
    }

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다.',
        user: result.user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}