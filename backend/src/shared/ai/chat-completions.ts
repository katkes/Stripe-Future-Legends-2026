import { env } from '../../config/env.js';
import { AppError } from '../../core/errors/app-error.js';

type ChatMessage = { role: 'system' | 'user'; content: string };
type ChatCompletionsResponse = {
  error?: { message?: string };
  choices?: Array<{ message?: { content?: string } }>;
};

/**
 * OpenAI-compatible Chat Completions. Uses OPENAI_API_KEY when set, otherwise
 * the same API key already configured for this repo (`OCR_SPACE_API_KEY`).
 */
export async function completeJson(messages: ChatMessage[]): Promise<string> {
  if (!env.openaiApiKey) {
    throw new AppError(503, 'No API key is configured for recipe AI. Add OPENAI_API_KEY or OCR_SPACE_API_KEY to backend/.env.');
  }

  const result = await fetch(`${env.openaiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.openaiModel,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages,
    }),
  });

  const payload = await result.json() as ChatCompletionsResponse;
  if (!result.ok) {
    const detail = payload.error?.message || `HTTP ${result.status}`;
    throw new AppError(502, `Recipe AI could not complete the request: ${detail}`);
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AppError(502, 'Recipe AI returned an empty response.');
  return content;
}
