import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for Vercel (needed for crypto and file system operations)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Model to use (OpenRouter format: provider/model-name)
// Examples: 'openai/gpt-4-turbo', 'anthropic/claude-3-opus', 'meta-llama/llama-3-70b'
const MODEL = process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to avoid build-time issues with Node.js modules
    const { randomUUID } = await import('crypto');
    const OpenAI = (await import('openai')).default;
    const { buildPrompt } = await import('@/lib/utils/context');
    const { loadConversation, saveConversation } = await import('@/lib/utils/storage');

    const { message, session_id } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Generate session ID if not provided
    const sessionId = session_id || randomUUID();

    // Load conversation history
    const conversation = await loadConversation(sessionId);

    // Build the system prompt
    const systemPrompt = await buildPrompt();

    // Initialize OpenAI client (configured for OpenRouter)
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    });

    // Prepare messages for OpenAI
    type ChatCompletionMessage = {
      role: 'system' | 'user' | 'assistant';
      content: string;
    };
    const messages: ChatCompletionMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Add conversation history (limit to last 20 messages to manage context)
    const recentConversation = conversation.slice(-20);
    for (const msg of recentConversation) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: messages,
      temperature: 0.4,
      max_tokens: 2000,
      top_p: 0.9,
    });

    const assistantResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    // Update conversation history
    const timestamp = new Date().toISOString();
    const updatedConversation: ChatMessage[] = [
      ...conversation,
      {
        role: 'user',
        content: message,
        timestamp,
      },
      {
        role: 'assistant',
        content: assistantResponse,
        timestamp,
      },
    ];

    // Save conversation
    await saveConversation(sessionId, updatedConversation);

    return NextResponse.json({
      response: assistantResponse,
      session_id: sessionId,
    }, { headers: corsHeaders() });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured', details: error.message },
          { status: 500, headers: corsHeaders() }
        );
      }
      
      // Return actual error message in development/for debugging
      return NextResponse.json(
        { error: 'Failed to process chat message', details: error.message, name: error.name },
        { status: 500, headers: corsHeaders() }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat message', details: 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

