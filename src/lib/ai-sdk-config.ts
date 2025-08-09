import { createOpenAI } from '@ai-sdk/openai';

/**
 * Vercel AI SDK OpenAI provider configured for Instacart's AI Gateway
 *
 * This mirrors the configuration from openai-client.ts but uses Vercel AI SDK's
 * provider system which enables tool calling, streaming, and other advanced features.
 */
export const openaiProvider = createOpenAI({
  apiKey: '', // AI Gateway does not need or want an API key
  baseURL: process.env.OPENAI_BASE_URL || 'https://aigateway.instacart.tools/proxy/instacart-business-ai-dev/openai/v1',
});

// Export pre-configured models for easy use
export const gpt4 = openaiProvider('gpt-4');
export const gpt4Turbo = openaiProvider('gpt-4-turbo');
export const gpt35Turbo = openaiProvider('gpt-3.5-turbo');

/**
 * You can still use the original OpenAI client from openai-client.ts for
 * operations that don't need Vercel AI SDK features. Both can coexist.
 */
