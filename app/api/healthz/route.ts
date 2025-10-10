import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic liveness check - if we can respond, the app is alive
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
