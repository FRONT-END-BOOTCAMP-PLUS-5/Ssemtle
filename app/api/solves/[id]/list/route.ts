// app/api/solves/[id]/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { normalizeDateQueryForSchema } from '@/utils/normalizeDateParams';
import { ListSolvesRequestDto } from '@/backend/solves/dtos/SolveDto';
import { ListSolvesQuery } from '@/libs/zod/solves';
// import { listSolvesByUserUsecase } from '@/backend/solves/usecases/listSolvesByUserUsecase';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // Next.js 15: Promise
) {
  try {
    const { id } = await ctx.params;
    const userId = decodeURIComponent(id ?? '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const url = new URL(req.url);
    const normalized = normalizeDateQueryForSchema(url.searchParams);
    const validated = ListSolvesQuery.parse(normalized);

    const cursor = normalized.cursor || undefined;
    const direction = normalized.direction === 'prev' ? 'prev' : 'next';
    const sortDirection =
      normalized.sortDirection === 'oldest' ? 'oldest' : 'newest';

    const reqDto: ListSolvesRequestDto = {
      userId,
      from: validated.from,
      to: validated.to,
      only: validated.only,
      limit: validated.limit,
      cursor,
      direction,
      sortDirection,
    };

    // const result = await listSolvesByUserUsecase.execute(reqDto);
    // return NextResponse.json(result, { status: 200 });

    return NextResponse.json({ ok: true, reqDto }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Bad Request',
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 400 }
    );
  }
}
