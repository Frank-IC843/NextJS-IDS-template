import { type NextRequest } from 'next/server';
import { streamText, generateText, type ModelMessage } from 'ai';
import { gpt4, gpt4Turbo, gpt35Turbo, gpt4_1 } from '@/lib/ai-sdk-config';
import { SYSTEM_PROMPT } from './system-prompt';

interface ChatRequestBody {
  messages: ModelMessage[];
  stream?: boolean;
  model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  businessInfo?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Chat API - Powered by Vercel AI SDK
 *
 * Provides chat completions with optimized settings for business analytics
 * and financial reporting.
 *
 * @route POST /api/chat
 * @route GET /api/chat - Health check
 * @route OPTIONS /api/chat - CORS preflight
 */

/**
 * Default LLM settings optimized for business analytics and financial reporting
 *
 * These settings prioritize:
 * - Accuracy and factual correctness for financial data
 * - Consistency in formatting and structure
 * - Reduced hallucination risk when dealing with numbers
 * - Clear, professional language suitable for business reports
 *
 * Temperature Guide:
 * - 0.0-0.2: Maximum accuracy, minimal creativity (technical docs, legal)
 * - 0.3-0.5: Balanced accuracy with slight variation (business reports) ← We use this
 * - 0.6-0.8: More creative while maintaining coherence (marketing content)
 * - 0.9-1.0: Maximum creativity (brainstorming, creative writing)
 */
const DEFAULT_OPTIONS = {
  temperature: 0.3, // Low-moderate for accuracy with slight variation
  max_tokens: 5000, // Sufficient for detailed reports
  top_p: 0.9, // Slightly constrained for consistency
  frequency_penalty: 0.3, // Reduce repetition in reports
  presence_penalty: 0.1, // Slight penalty to avoid redundancy
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { messages, stream = false, model = 'gpt-4', businessInfo, ...userOptions } = body;

    // Merge user options with defaults
    const options = { ...DEFAULT_OPTIONS, ...userOptions };

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Create dynamic system prompt with business information
    let systemPrompt = SYSTEM_PROMPT;
    if (businessInfo?.trim()) {
      systemPrompt += `\n\nBUSINESS CONTEXT:\n${businessInfo.trim()}\n\nUse this business context to provide more relevant and personalized insights, recommendations, and analysis. Tailor your responses to this specific business type, industry, and priorities.`;
    }

    // Handle streaming response
    if (stream) {
      const result = await streamText({
        model: gpt4_1,
        system: systemPrompt,
        messages,
        temperature: options.temperature,
        maxOutputTokens: options.max_tokens,
        topP: options.top_p,
        frequencyPenalty: options.frequency_penalty,
        presencePenalty: options.presence_penalty,
      });

      // Convert to SSE format for streaming
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const textPart of result.textStream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: textPart })}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Handle regular completion
    const result = await generateText({
      model: modelInstance,
      system: systemPrompt,
      messages,
      temperature: options.temperature,
      maxOutputTokens: options.max_tokens,
      topP: options.top_p,
      frequencyPenalty: options.frequency_penalty,
      presencePenalty: options.presence_penalty,
    });

    // Return response in standard format
    return Response.json({
      message: result.text,
      usage: result.usage
        ? {
            prompt_tokens: result.usage.inputTokens,
            completion_tokens: result.usage.outputTokens,
            total_tokens: result.usage.totalTokens,
          }
        : undefined,
      model,
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('rate limit')) {
        return Response.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      }

      if (errorMessage.includes('timeout')) {
        return Response.json({ error: 'Request timeout. Please try again.' }, { status: 408 });
      }

      if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
        return Response.json({ error: 'Unauthorized access.' }, { status: 401 });
      }
    }

    // Generic error response
    return Response.json(
      {
        error: 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'chat-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    sdk: 'vercel-ai',
  });
}

/**
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
