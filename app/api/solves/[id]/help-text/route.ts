import { NextResponse } from 'next/server';
import { PrSolveRepository } from '@/backend/common/infrastructures/repositories/PrSolveRepository';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  console.log('✅ helpText 조회 요청:', params.id); // ✅ 추가
  try {
    const idNum = Number(params.id);
    if (!Number.isInteger(idNum)) {
      return NextResponse.json({ error: '유효하지 않은 id' }, { status: 400 });
    }

    const repo = new PrSolveRepository();
    const data = await repo.findHelpTextById(idNum);

    if (!data) {
      return NextResponse.json({ error: '해당 풀이를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ helpText: data.helpText }, { status: 200 });
  } catch (err) {
    console.error('❌ helpText 조회 오류:', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
