import { createOpenAI } from '@ai-sdk/openai';

/**
 * Vercel AI SDK OpenAI provider configured for Instacart's AI Gateway
 *
 * This provider powers the future dashboard generation flow with tool calling
 * and structured model responses.
 */
export const openaiProvider = createOpenAI({
  apiKey: '', // AI Gateway does not need or want an API key
  baseURL: process.env.OPENAI_BASE_URL || 'https://aigateway.instacart.tools/proxy/instacart-business-ai-dev/openai/v1',
});

// Export pre-configured models for easy use
export const gpt4_1 = openaiProvider('gpt-4o');
