import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasPasswordHash: !!process.env.CHAT_PASSWORD_HASH,
    passwordHashPrefix: process.env.CHAT_PASSWORD_HASH?.substring(0, 10) || 'NOT SET',
    envLoaded: process.env.NODE_ENV,
  });
}

