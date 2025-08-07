import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion, createStreamingChatCompletion } from '@/lib/openai-client';

/**
 * POST /api/chat - Handle chat completions
 *
 * Example usage with Next.js 15 App Router API routes
 */
const SYSTEM_PROMPT = `You are Instacart Business' Order and Spend Analysis AI Assistant. You help business customers analyze their ordering patterns, spending trends, and optimize their procurement processes.

Your role includes:
- Analyzing order history and spending patterns
- Providing insights on cost optimization opportunities
- Helping with budget planning and forecasting
- Identifying popular products and categories
- Suggesting ways to streamline ordering processes
- Answering questions about business account features
- Providing data-driven recommendations for better purchasing decisions

You should be professional, data-focused, and provide actionable insights. When you don't have access to specific data, acknowledge this and suggest how the user might find or provide that information.

Always maintain a helpful, business-oriented tone and focus on practical solutions that can help businesses save time and money through smarter ordering on Instacart.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, stream = false, model = 'gpt-4', ...options } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Add system prompt to the beginning of messages
    const messagesWithSystem = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

    // Handle streaming response
    if (stream) {
      const streamResponse = await createStreamingChatCompletion(messagesWithSystem, model, options);

      // Create a readable stream for the response
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
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
    const response = await createChatCompletion(messagesWithSystem, model, options);

    // Type guard to ensure we have a ChatCompletion response
    if ('choices' in response) {
      return NextResponse.json({
        message: response.choices[0]?.message?.content || '',
        usage: response.usage,
        model: response.model,
      });
    } else {
      throw new Error('Unexpected response type from OpenAI API');
    }
  } catch (error) {
    console.error('Chat API Error:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json({ error: 'Request timeout. Please try again.' }, { status: 408 });
      }
      if (error.message.includes('unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to process chat request',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat - Get API status
 */
export async function GET() {
  return NextResponse.json({
    status: 'OpenAI Chat API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}

/**
 * OPTIONS /api/chat - Handle CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
