import { type NextRequest } from 'next/server';
import { streamText, type CoreMessage } from 'ai';
import { gpt4_1 } from '@/lib/ai-sdk-config';
import { TEST_ORDER_GUIDE_SYSTEM_PROMPT } from './system-prompt';
import { tools } from './tools';

interface ChatRequestBody {
  messages: CoreMessage[];
}

/**
 * Simplified Chat API for testing Order Guide tool calls
 *
 * Features:
 * - Streamlined for testing createBusinessOrderGuide tool
 * - Supports both streaming and non-streaming responses
 * - Clean error handling
 * - Optimized for performance
 */

// Optimized settings for tool testing
const MODEL_SETTINGS = {
  temperature: 0.2, // Low for consistent tool calling
  maxOutputTokens: 5000, // Reduced for faster responses
  topP: 0.8, // More focused outputs
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as ChatRequestBody;
    const { messages } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Use streamText for both streaming and non-streaming
    // (it's more efficient and allows us to avoid duplicate code)
    const result = await streamText({
      model: gpt4_1,
      system: TEST_ORDER_GUIDE_SYSTEM_PROMPT,
      messages,
      tools,
      toolChoice: 'auto',
      ...MODEL_SETTINGS,
      // Log tool calls in development
      onStepFinish: async ({ toolCalls, toolResults }) => {
        if (process.env.NODE_ENV === 'development') {
          if (toolCalls && toolCalls.length > 0) {
            console.log('[Tool Calls]', {
              timestamp: new Date().toISOString(),
              count: toolCalls.length,
              calls: toolCalls.map(call => ({
                id: 'toolCallId' in call ? call.toolCallId : undefined,
                name: call.toolName,
                args: 'args' in call ? call.args : undefined,
              })),
            });
          }
          if (toolResults && toolResults.length > 0) {
            console.log('[Tool Results]', {
              timestamp: new Date().toISOString(),
              count: toolResults.length,
              results: toolResults.map(result => ({
                id: 'toolCallId' in result ? result.toolCallId : undefined,
                name: result.toolName,
                result: 'result' in result ? result.result : undefined,
              })),
            });
          }
        }
      },
    });

    // Handle streaming response
    // Return the stream directly for SSE
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const textPart of result.textStream) {
            const data = JSON.stringify({ content: textPart });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Stream error:', error);
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

    // Simplified error handling
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('rate limit')) {
        return Response.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      }

      if (message.includes('unauthorized')) {
        return Response.json({ error: 'Unauthorized access.' }, { status: 401 });
      }
    }

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
