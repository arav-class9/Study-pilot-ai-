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
  useSearchGrounding?: boolean;
}

export interface GeneratedContentResult {
  text: string;
  groundingMetadata?: any;
  modelUsed?: string;
}

/**
 * Robust Gemini content generator that automatically handles 503 (high demand), 
 * 429 rate limits, and transient network errors with multi-model fallback and backoff.
 */
export async function generateContentWithRetry(options: GenerateContentRetryOptions): Promise<GeneratedContentResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing in Vercel setup. Please add GEMINI_API_KEY in Vercel Environment Variables.');
  }

  const ai = getGeminiClient();
  
  // Normalize legacy/deprecated models to active supported models
  const mapModel = (m?: string): string => {
    if (!m) return 'gemini-3.8-flash';
    if (m === 'gemini-3.8-flash' || m === 'gemini-2.0-flash' || m === 'gemini-1.5-flash' || m === 'gemini-flash-latest') {
      return 'gemini-3.8-flash';
    }
    if (m === 'gemini-3.1-flash-lite' || m === 'gemini-2.0-flash-lite' || m === 'gemini-3.5-flash-lite') {
      return 'gemini-3.1-flash-lite';
    }
    if (m === 'gemini-3.8-flash' || m === 'gemini-2.0-pro' || m === 'gemini-1.5-pro') {
      return 'gemini-3.8-flash';
    }
    return m;
  };

  const primaryModel = mapModel(options.primaryModel || 'gemini-3.8-flash');
  const fallbackModel = options.fallbackModel ? mapModel(options.fallbackModel) : 'gemini-3.1-flash-lite';
  const maxRetries = options.maxRetries ?? 2;

  // Build unique sequence of active models to try in order of preference
  const modelsToTry = Array.from(
    new Set([
      primaryModel,
      fallbackModel,
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
    ].filter(Boolean))
  );

  let lastError: any = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const model = modelsToTry[mIdx];
    
    // Prepare clean config: gemini-3.8-flash does not accept deprecated sampling params
    const cleanConfig = options.config ? { ...options.config } : {};
    if (cleanConfig && (model.startsWith('gemini-3.8') || model.startsWith('gemini-4'))) {
      delete cleanConfig.temperature;
      delete cleanConfig.topP;
      delete cleanConfig.topK;
      delete cleanConfig.candidateCount;
    }

    // Attach Google Search Grounding tool on gemini-3.8-flash if requested AND responseSchema is NOT used
    if (options.useSearchGrounding && model === 'gemini-3.8-flash' && !cleanConfig.responseSchema) {
      cleanConfig.tools = cleanConfig.tools || [];
      if (!cleanConfig.tools.some((t: any) => t.googleSearch)) {
        cleanConfig.tools.push({ googleSearch: {} });
      }
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: cleanConfig,
        });

        const text = response.text || '';
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        return { text, groundingMetadata, modelUsed: model };
      } catch (error: any) {
        lastError = error;
        const errorMessage = error?.message || String(error);
        const errorCode = error?.status || error?.code || error?.error?.code;

        const isDeprecatedOrNotFound =
          errorCode === 404 ||
          errorCode === 'NOT_FOUND' ||
          errorMessage.includes('404') ||
          errorMessage.includes('NOT_FOUND') ||
          errorMessage.includes('no longer available') ||
          errorMessage.includes('not found');
        
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

        // If error occurs and tools (like googleSearch) were attached, strip tools on retry to rule out tool restrictions
        if (cleanConfig.tools && cleanConfig.tools.length > 0) {
          delete cleanConfig.tools;
        }

        // If model is deprecated or not found, switch immediately without retrying
        if (isDeprecatedOrNotFound && mIdx < modelsToTry.length - 1) {
          console.warn(`[Gemini API] Model ${model} is not available (404), switching immediately to fallback model ${modelsToTry[mIdx + 1]}...`);
          break;
        }

        // Add backoff delay before switching model or retrying to clear temporary demand spikes
        if (isTransient || isQuotaExhausted) {
          const delayMs = (attempt + 1) * 800 + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        // If high demand (503) or quota (429), switch to next available fallback model if attempts exhausted
        if ((isTransient || isQuotaExhausted) && attempt >= maxRetries && mIdx < modelsToTry.length - 1) {
          console.warn(`[Gemini API] Attempts exhausted for ${model}, switching to fallback model ${modelsToTry[mIdx + 1]}...`);
          break; // Break inner loop to try next model
        }

        if (attempt < maxRetries && (isQuotaExhausted || isTransient)) {
          const delayMs = (attempt + 1) * 1000 + Math.random() * 500;
          console.warn(`[Gemini API] Retrying ${model} in ${Math.round(delayMs)}ms...`);
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
