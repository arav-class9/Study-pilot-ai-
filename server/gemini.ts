import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not set. AI features will fallback to smart offline logic if unavailable.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface GenerateContentRetryOptions {
  contents: any;
  config?: any;
  primaryModel?: string;
  fallbackModel?: string;
  maxRetries?: number;
}

/**
 * Robust Gemini content generator that automatically handles 503 (high demand), 
 * 429 rate limits, and transient network errors with exponential backoff and model fallback.
 */
export async function generateContentWithRetry(options: GenerateContentRetryOptions): Promise<{ text: string }> {
  const ai = getGeminiClient();
  const primaryModel = options.primaryModel || 'gemini-3.1-flash-lite';
  const fallbackModel = options.fallbackModel || 'gemini-3.8-flash';
  const maxRetries = options.maxRetries ?? 2;

  // Build unique sequence of models to try
  const modelsToTry = Array.from(
    new Set([
      primaryModel,
      fallbackModel,
      'gemini-3.1-flash-lite',
    ])
  );

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });

        const text = response.text || '';
        return { text };
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || String(error);
        const errorCode = error?.status || error?.code || error?.error?.code;
        
        const isQuotaExhausted =
          errorCode === 429 ||
          errorCode === 'RESOURCE_EXHAUSTED' ||
          errorMessage.includes('429') ||
          errorMessage.includes('RESOURCE_EXHAUSTED') ||
          errorMessage.includes('quota') ||
          errorMessage.includes('rate limit');

        const isTransient =
          errorCode === 503 ||
          errorCode === 'UNAVAILABLE' ||
          errorMessage.includes('high demand') ||
          errorMessage.includes('UNAVAILABLE') ||
          errorMessage.includes('503') ||
          errorMessage.includes('overloaded');

        console.warn(`[Gemini API] Attempt ${attempt + 1}/${maxRetries + 1} for model ${model}:`, errorMessage);

        if (isQuotaExhausted) {
          // Immediately try next model without waiting in vain for rate-limit window
          console.warn(`[Gemini API] Switching immediately from ${model} due to quota limit.`);
          break;
        }

        if (isTransient && attempt < maxRetries) {
          // Exponential backoff with jitter
          const delayMs = (attempt + 1) * 700 + Math.random() * 300;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          // If not transient or out of retries for this model, break and try next model
          break;
        }
      }
    }
  }

  throw lastError || new Error('Failed to generate AI content after retries and model fallbacks');
}
