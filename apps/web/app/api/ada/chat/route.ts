/**
 * ADA Chat API Route
 * 
 * POST /api/ada/chat
 * 
 * Server-side chat endpoint that:
 * 1. Receives user message
 * 2. Saves to Supabase memory
 * 3. Builds workspace context
 * 4. Calls OpenAI-compatible LLM
 * 5. Saves ADA response
 * 6. Returns response to frontend
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@/lib/supabase/server';
import { addMessage } from '@/lib/ada/memory';
import { buildAdaContext } from '@/lib/ada/context-builder';

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_API_BASE_URL;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  return new OpenAI({
    apiKey,
    baseURL: baseURL || undefined,
  });
}

// Get model configuration
function getModelConfig() {
  return {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.7,
    max_completion_tokens: 2000,
  };
}

// Request body schema
interface ChatRequest {
  workspaceId: string;
  message: string;
}

// Response schema
interface ChatResponse {
  message: string;
}

// Error response schema
interface ErrorResponse {
  error: string;
  details?: string;
}

function detectPreferredLanguage(message: string): "en" | "es" {
  const normalized = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[!?.,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const spanishSignals = [
    /\bel\b/,
    /\bla\b/,
    /\blos\b/,
    /\blas\b/,
    /\buna\b/,
    /\bpara\b/,
    /\bcon\b/,
    /\bcerrar\b/,
    /\bcierra\b/,
    /\bmision\b/,
    /\bobjetivo\b/,
    /\balcance\b/,
    /\brestricciones\b/,
    /\bestado\b/,
    /\bproyecto\b/,
    /\bcual\b/,
    /\bahora\b/,
    /\bsi\b/,
  ];
  const englishSignals = [
    /\bthe\b/,
    /\bclose\b/,
    /\bmission\b/,
    /\bobjective\b/,
    /\bscope\b/,
    /\bconstraints\b/,
    /\bproject\b/,
    /\bstatus\b/,
    /\bcurrent\b/,
    /\bnow\b/,
    /\bcontinue\b/,
    /\byes\b/,
  ];

  const spanishScore = spanishSignals.filter((pattern) => pattern.test(normalized)).length;
  const englishScore = englishSignals.filter((pattern) => pattern.test(normalized)).length;

  return spanishScore > englishScore ? "es" : "en";
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as ChatRequest;

    // Validate input
    if (!body.workspaceId || typeof body.workspaceId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid workspaceId' } as ErrorResponse,
        { status: 400 }
      );
    }

    if (!body.message || typeof body.message !== 'string' || body.message.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid message' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerClient();

    // Save user message to database
    await addMessage(supabase, {
      workspace_id: body.workspaceId,
      role: 'user',
      content: body.message.trim(),
    });

    // Build workspace context
    const context = await buildAdaContext(supabase, body.workspaceId);
    const preferredLanguage = detectPreferredLanguage(body.message.trim());

    // Initialize OpenAI client
    const openai = getOpenAIClient();
    const modelConfig = getModelConfig();

    // Prepare messages for OpenAI API
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: context.systemMessage,
      },
      {
        role: 'system',
        content:
          preferredLanguage === 'es'
            ? 'Responde en español. Si el usuario escribe en español, no cambies a inglés salvo que el usuario lo pida explícitamente.'
            : 'Respond in English. If the user writes in English, do not switch to Spanish unless the user explicitly asks for it.',
      },
      ...context.conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      messages,
      temperature: modelConfig.temperature,
      max_completion_tokens: modelConfig.max_completion_tokens,
    });

    // Extract ADA response
    const adaResponse = completion.choices[0]?.message?.content;

    if (!adaResponse) {
      throw new Error('No response from LLM');
    }

    // Save ADA response to database
    await addMessage(supabase, {
      workspace_id: body.workspaceId,
      role: 'ada',
      content: adaResponse,
    });

    // Return response
    return NextResponse.json({
      message: adaResponse,
    } as ChatResponse);
  } catch (error) {
    console.error('ADA Chat API Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // OpenAI API errors
      if ('status' in error && typeof error.status === 'number') {
        return NextResponse.json(
          {
            error: 'LLM API error',
            details: error.message,
          } as ErrorResponse,
          { status: error.status }
        );
      }

      // Supabase errors
      if ('code' in error) {
        return NextResponse.json(
          {
            error: 'Database error',
            details: error.message,
          } as ErrorResponse,
          { status: 500 }
        );
      }

      // Generic errors
      return NextResponse.json(
        {
          error: 'Internal server error',
          details: error.message,
        } as ErrorResponse,
        { status: 500 }
      );
    }

    // Unknown error type
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'An unknown error occurred',
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
