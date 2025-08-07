import OpenAI from 'openai';

/**
 * OpenAI client configured for Instacart's AI Gateway
 *
 * This client is configured to use Instacart's AI Gateway proxy instead of
 * directly connecting to OpenAI's API. The AI Gateway handles authentication
 * and routing, so no API key is required.
 */
export const openai = new OpenAI({
  apiKey: '', // AI Gateway does not need or want an API key
  baseURL: process.env.OPENAI_BASE_URL || 'https://aigateway.instacart.tools/proxy/instacart-business-ai/openai/v1',
  timeout: 60000,
  maxRetries: 3,
});

/**
 * Type-safe wrapper for OpenAI chat completions
 *
 * @param messages - Array of chat messages
 * @param model - OpenAI model to use (defaults to gpt-4)
 * @param options - Additional options for the completion
 * @returns Promise resolving to the chat completion response
 */
export async function createChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  model: string = 'gpt-4',
  options?: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParams, 'messages' | 'model'>
) {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      ...options,
    });

    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`Failed to create chat completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Streaming chat completion wrapper
 *
 * @param messages - Array of chat messages
 * @param model - OpenAI model to use (defaults to gpt-4)
 * @param options - Additional options for the completion
 * @returns Promise resolving to a streaming response
 */
export async function createStreamingChatCompletion(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  model: string = 'gpt-4',
  options?: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParams, 'messages' | 'model' | 'stream'>
) {
  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      stream: true,
      ...options,
    });

    return stream;
  } catch (error) {
    console.error('OpenAI Streaming API Error:', error);
    throw new Error(
      `Failed to create streaming chat completion: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export default openai;
