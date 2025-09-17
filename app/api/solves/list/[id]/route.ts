// app/api/solves/list/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ZodError } from 'zod';
import { ListSolvesQuery } from '@/libs/zod/solves';
import { normalizeDateQueryForSchema } from '@/utils/normalizeDateParams';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';
import { ListSolvesRequestDto } from '@/backend/solves/dtos/SolveDto';
import { ListSolvesUseCase } from '@/backend/solves/usecases/SolvesUsecases';
import { PrismaClient } from '@/app/generated/prisma/client';

const prisma = new PrismaClient();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveInternalUserId(
  idOrHandle: string
): Promise<string | null> {
  const raw = idOrHandle.trim();
  if (raw.length === 0) return null;

  // 1) UUID면 그대로
  if (UUID_RE.test(raw)) return raw;

  // 2) 핸들이면 user.userId(= DB user_id)로 내부 id 조회
  const user = await prisma.user.findUnique({
    where: { userId: raw }, // ⚠️ Prisma 모델에서 user_id가 매핑된 필드명 (예: userId)
    select: { id: true },
  });

  return user ? user.id : null;
}

// Next.js 15: 동적 params는 Promise
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    // 0) 인증(로그인만 확인; 조회 대상은 세션과 무관)
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1) 경로 [id] → 내부 UUID로 변환
    const { id } = await ctx.params;
    const decodedId = decodeURIComponent(id ?? '');
    const internalUserId = await resolveInternalUserId(decodedId);
    if (!internalUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2) 쿼리 정규화(YYYY-MM-DD → ISO Z)
    const url = new URL(req.url);
    const normalized = normalizeDateQueryForSchema(url.searchParams);

    // 3) 기본값 세팅 후 Zod 검증(스키마는 기존 그대로)
    const queryParams = {
      from: normalized.from ?? undefined,
      to: normalized.to ?? undefined,
      only: (normalized.only as 'all' | 'wrong') ?? 'all',
      limit: Number.parseInt(normalized.limit ?? '20', 10),
      cursor: normalized.cursor ?? undefined,
      direction: (normalized.direction as 'next' | 'prev') ?? 'next',
      sortDirection:
        (normalized.sortDirection as 'newest' | 'oldest') ?? 'newest',
    };
    const validated = ListSolvesQuery.parse(queryParams);

    // 4) DTO 매핑 (세션 ID 쓰지 않음)
    const request: ListSolvesRequestDto = {
      userId: internalUserId,
      from: validated.from,
      to: validated.to,
      only: validated.only as 'all' | 'wrong',
      limit: validated.limit,
      cursor: validated.cursor,
      direction: validated.direction as 'next' | 'prev',
      sortDirection: validated.sortDirection as 'newest' | 'oldest',
    };

    // 5) 유스케이스 실행
    const repository = new PrSolveRepository();
    const useCase = new ListSolvesUseCase(repository);
    const result = await useCase.execute(request);

    // 6) 응답
    return NextResponse.json({
      items: result.items,
      nextCursor: result.nextCursor,
      prevCursor: result.prevCursor,
      completedDay: result.completedDay,
      batchInfo: result.batchInfo,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === 'Invalid cursor') {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
