import { NextRequest, NextResponse } from 'next/server';
import { loadConversation } from '@/lib/utils/storage';

// Force Node.js runtime for Vercel (needed for file system operations)
export const runtime = 'nodejs';

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Load conversation history
    const messages = await loadConversation(sessionId);

    return NextResponse.json({
      session_id: sessionId,
      messages,
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

