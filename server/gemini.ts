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
 * 429 rate limits, and transient network errors with multi-model fallback and backoff.
 */
export async function generateContentWithRetry(options: GenerateContentRetryOptions): Promise<{ text: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  const ai = getGeminiClient();
  
  const primaryModel = options.primaryModel || 'gemini-3.8-flash';
  const fallbackModel = options.fallbackModel || 'gemini-flash-latest';
  const maxRetries = options.maxRetries ?? 1;

  // Build unique sequence of models to try in order of preference
  const modelsToTry = Array.from(
    new Set([
      primaryModel,
      fallbackModel,
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash',
    ].filter(Boolean))
  );

  let lastError: any = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const model = modelsToTry[mIdx];
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

        // If high demand (503) or quota (429), switch immediately to the next available fallback model
        if ((isTransient || isQuotaExhausted) && mIdx < modelsToTry.length - 1) {
          console.warn(`[Gemini API] Switching from ${model} to next model ${modelsToTry[mIdx + 1]}...`);
          break; // Break inner loop to try next model immediately
        }

        if (attempt < maxRetries && (isQuotaExhausted || isTransient)) {
          const delayMs = (attempt + 1) * 800 + Math.random() * 400;
          console.warn(`[Gemini API] Retrying in ${Math.round(delayMs)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error('Failed to generate AI content after retries and model fallbacks');
}
