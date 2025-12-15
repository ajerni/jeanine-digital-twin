import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildPrompt } from '@/lib/utils/context';
import { loadConversation, saveConversation } from '@/lib/utils/storage';
import { randomUUID } from 'crypto';

// Model to use (OpenRouter format: provider/model-name)
// Examples: 'openai/gpt-4-turbo', 'anthropic/claude-3-opus', 'meta-llama/llama-3-70b'
const MODEL = process.env.OPENAI_MODEL || 'openai/gpt-4o-mini';

// Lazy initialization of OpenAI client (configured for OpenRouter)
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  });
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, session_id } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate session ID if not provided
    const sessionId = session_id || randomUUID();

    // Load conversation history
    const conversation = await loadConversation(sessionId);

    // Build the system prompt
    const systemPrompt = await buildPrompt();

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
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
    const openai = getOpenAIClient();
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
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

