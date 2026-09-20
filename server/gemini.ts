import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GEMINI_KEY ||
    ''
  );
}

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = getApiKey();
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
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing in Vercel setup. Please add GEMINI_API_KEY in Vercel Environment Variables.');
  }

  const ai = getGeminiClient();
  
  const primaryModel = options.primaryModel || 'gemini-2.5-flash';
  const fallbackModel = (options.fallbackModel && options.fallbackModel !== primaryModel) 
    ? options.fallbackModel 
    : 'gemini-flash-latest';
  const maxRetries = options.maxRetries ?? 1;

  // Build unique sequence of models to try in order of preference
  const modelsToTry = Array.from(
    new Set([
      primaryModel,
      fallbackModel,
      'gemini-2.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
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

/**
 * Strips markdown code fences (```json ... ```) and safely parses JSON with embedded object/array fallback extraction.
 */
export function safeJsonParse<T = any>(text?: string, fallback?: T): T {
  if (!text || typeof text !== 'string') {
    if (fallback !== undefined) return fallback;
    throw new Error('Empty or invalid string provided for JSON parsing');
  }

  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/i, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(clean);
  } catch {
    // Try to extract first JSON code block
    const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {}
    }

    // Try finding enclosing JSON object { ... }
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(clean.substring(firstBrace, lastBrace + 1));
      } catch {}
    }

    // Try finding enclosing JSON array [ ... ]
    const firstBracket = clean.indexOf('[');
    const lastBracket = clean.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(clean.substring(firstBracket, lastBracket + 1));
      } catch {}
    }

    if (fallback !== undefined) return fallback;
    throw new Error(`Failed to parse JSON response: ${clean.substring(0, 100)}...`);
  }
}
