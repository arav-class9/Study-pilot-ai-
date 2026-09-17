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
  
  const primaryModel = options.primaryModel || 'gemini-3.6-flash';
  const fallbackModel = options.fallbackModel || 'gemini-3.6-flash';
  const maxRetries = options.maxRetries ?? 3; // Let's give it 3 retries.

  // Build unique sequence of models to try
  const modelsToTry = Array.from(
    new Set([
      primaryModel,
      fallbackModel,
      'gemini-3.6-flash'
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

        // For this issue, if we hit a rate limit, let's just back off and retry since 
        // gemini-3.6-flash is our only available model in this environment.
        if (isQuotaExhausted || isTransient) {
          // Exponential backoff with jitter
          const delayMs = (attempt + 1) * 2000 + Math.random() * 1000;
          console.warn(`[Gemini API] Waiting ${delayMs}ms before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          // If not transient/quota, break and throw
          break;
        }
      }
    }
  }

  throw lastError || new Error('Failed to generate AI content after retries and model fallbacks');
}
