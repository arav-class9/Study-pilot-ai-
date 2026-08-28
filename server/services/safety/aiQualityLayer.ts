import { VerificationResult, verifyMCQQuestion, verifyNumericalSolution } from '../verification.js';

export interface AISafetyRequest {
  actionName: string;
  userId?: string;
  input: any;
  context?: any;
}

export interface AISafetyResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: 'verified' | 'needs_review' | 'rejected' | 'quota_exhausted' | 'timeout';
  metadata: {
    verifiedAt: string;
    confidenceScore: number;
    safetyChecksPassed: boolean;
  };
}

export async function executeWithSafetyLayer<T>(
  request: AISafetyRequest,
  generatorFunction: (validatedInput: any) => Promise<T>,
  validatorFunction?: (result: T) => VerificationResult | boolean
): Promise<AISafetyResponse<T>> {
  try {
    // 1. Safety Check (e.g. Prompt Injection, empty, etc.)
    if (!request.input || (typeof request.input === 'string' && request.input.trim() === '')) {
      throw new Error('Empty or invalid input provided.');
    }
    
    // 2. Generate Content
    // Handle timeouts and quotas natively or wrapper around generator
    const generationPromise = generatorFunction(request.input);
    
    // 15 seconds timeout wrapper
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI Request Timeout')), 25000);
    });
    
    const result = await Promise.race([generationPromise, timeoutPromise]);
    
    // 3. Verification & Quality Check
    let status: AISafetyResponse<T>['status'] = 'verified';
    let confidence = 90;
    
    if (validatorFunction) {
      const verification = validatorFunction(result);
      if (typeof verification === 'boolean') {
        if (!verification) {
          status = 'needs_review';
          confidence = 50;
        }
      } else {
        if (verification.status === 'needs_review' || verification.status === 'verification_failed') {
          status = 'needs_review';
        }
        confidence = verification.confidenceScore;
      }
    }
    
    return {
      success: true,
      data: result,
      status,
      metadata: {
        verifiedAt: new Date().toISOString(),
        confidenceScore: confidence,
        safetyChecksPassed: true
      }
    };
  } catch (error: any) {
    console.error(`AI Safety Layer [${request.actionName}] Error:`, error);
    const isQuota = error.message?.toLowerCase().includes('quota') || error.message?.toLowerCase().includes('429');
    const isTimeout = error.message?.toLowerCase().includes('timeout');
    
    return {
      success: false,
      error: error.message || 'AI Generation Failed',
      status: isQuota ? 'quota_exhausted' : isTimeout ? 'timeout' : 'rejected',
      metadata: {
        verifiedAt: new Date().toISOString(),
        confidenceScore: 0,
        safetyChecksPassed: false
      }
    };
  }
}
