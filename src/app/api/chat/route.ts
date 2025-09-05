import { type NextRequest } from 'next/server';
import { streamText, stepCountIs, type CoreMessage } from 'ai';
import { gpt4_1 } from '@/lib/ai-sdk-config';
import { TEST_ORDER_GUIDE_SYSTEM_PROMPT } from './system-prompt';
import { tools } from './tools';

interface ChatRequestBody {
  messages: CoreMessage[];
}

/**
 * Chat API for Order Guide Tool Testing
 *
 * Implements Vercel AI SDK best practices for tool calling:
 * - Uses stepCountIs(5) to support interactive multi-step flows
 * - Allows AI to analyze, present suggestions, wait for confirmation, and create guides
 * - Ensures AI always responds after tool calls
 * - Provides proper streaming support
 * - Includes comprehensive error handling
 */

// Optimized settings for tool testing
const MODEL_SETTINGS = {
  temperature: 0.3, // Low for consistent tool calling
  maxOutputTokens: 2000, // Sufficient for responses
  topP: 0.9, // Slightly constrained for consistency
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = (await request.json()) as ChatRequestBody;
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Use streamText with proper tool configuration
    const result = await streamText({
      model: gpt4_1,
      system: TEST_ORDER_GUIDE_SYSTEM_PROMPT,
      messages,
      tools,
      toolChoice: 'auto',
      stopWhen: stepCountIs(5), // Allow multiple steps for interactive flow:
      // 1) Analyze data with tools, 2) Present suggestions, 3) User confirmation,
      // 4) Create order guides with tool, 5) Confirm creation
      temperature: MODEL_SETTINGS.temperature,
      maxOutputTokens: MODEL_SETTINGS.maxOutputTokens,
      topP: MODEL_SETTINGS.topP,
      // Log tool activity in development
      onStepFinish: async ({ toolCalls, toolResults, text, finishReason }) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Step]', {
            finishReason,
            hasToolCalls: toolCalls?.length > 0,
            hasToolResults: toolResults?.length > 0,
            hasText: text?.length > 0,
          });

          // Log tool calls
          if (toolCalls && toolCalls.length > 0) {
            console.log('[Tool Calls]', {
              timestamp: new Date().toISOString(),
              calls: toolCalls.map(call => ({
                name: call.toolName,
                // Access the input for typed tools
                args: 'input' in call ? call.input : undefined,
              })),
            });
          }

          // Log tool results
          if (toolResults && toolResults.length > 0) {
            console.log('[Tool Results]', {
              timestamp: new Date().toISOString(),
              results: toolResults.map(result => ({
                name: result.toolName,
                // Access the output for typed tools
                output: 'output' in result ? result.output : undefined,
              })),
            });
          }
        }
      },
    });

    // Stream the response in SSE format for the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let charCount = 0; // Only track count, not content

          // Stream all text parts (includes text after tool execution)
          for await (const textPart of result.textStream) {
            charCount += textPart.length;
            const data = JSON.stringify({ content: textPart });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          console.log('[Stream] Completed, total chars:', charCount);

          // Signal stream completion
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('[Stream] Error:', error);
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
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('rate limit')) {
        return Response.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      }

      if (message.includes('unauthorized')) {
        return Response.json({ error: 'Unauthorized access.' }, { status: 401 });
      }

      if (message.includes('timeout')) {
        return Response.json({ error: 'Request timeout. Please try again.' }, { status: 408 });
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
    tools: Object.keys(tools),
    model: 'gpt-4o',
    features: ['streaming', 'tool-calling'],
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
