import { NextResponse } from 'next/server';
import prisma from '@/libs/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'failed',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
