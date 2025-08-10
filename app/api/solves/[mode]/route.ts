import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mode: string }> | { mode: string } }
) {
  // Handle both Next.js 14 and 15 params format
  const resolvedParams = await Promise.resolve(params);
  const { mode } = resolvedParams;

  // Validate mode
  if (mode !== 'wrong' && mode !== 'all') {
    return NextResponse.json(
      { error: 'Invalid mode. Must be "wrong" or "all"' },
      { status: 400 }
    );
  }

  // Get existing search params
  const { searchParams } = new URL(req.url);

  // Create new URL for redirect
  const redirectUrl = new URL('/api/solves/list', req.url);

  // Preserve existing search params
  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });

  // Set the mode-specific parameter
  if (mode === 'wrong') {
    redirectUrl.searchParams.set('only', 'wrong');
  } else {
    redirectUrl.searchParams.set('only', 'all');
  }

  // Use Next.js redirect for proper handling
  redirect(redirectUrl.toString());
}
