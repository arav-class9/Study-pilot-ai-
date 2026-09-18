import { auth } from '../lib/firebase/config';

export interface EvaluationBenchmarkReport {
  timestamp: string;
  totalBenchmarksRun: number;
  passedBenchmarks: number;
  accuracyRatePercentage: number;
  averageLatencyMs: number;
  schemaAdherencePercentage: number;
  hallucinationRatePercentage: number;
  groundingFidelityPercentage: number;
  curriculumAlignmentScore: number;
  benchmarkTests: {
    testName: string;
    category: string;
    status: 'passed' | 'failed';
    latencyMs: number;
    groundingScore?: number;
    notes: string;
  }[];
}

export interface CustomEvaluationParams {
  question: string;
  aiResponse: string;
  referenceSourceText: string;
  subject?: string;
  classLevel?: string;
}

export interface CustomEvaluationResult {
  overallScore: number;
  hallucinationScore: number;
  faithfulnessScore: number;
  relevanceScore: number;
  factualClaimsDetected: {
    claim: string;
    isSupportedBySource: boolean;
    sourceReferenceQuote?: string;
    verdict: 'verified' | 'hallucinated' | 'unverifiable';
  }[];
  hallucinationRisk: 'low' | 'moderate' | 'high';
  verdictSummary: string;
  recommendations: string[];
}

export async function fetchEvaluationBenchmark(): Promise<EvaluationBenchmarkReport> {
  let token = '';
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }

  const res = await fetch('/api/ai/benchmark', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to run AI evaluation benchmark');
  }

  const json = await res.json();
  return json.data;
}

export async function evaluateCustomResponseAPI(
  params: CustomEvaluationParams
): Promise<CustomEvaluationResult> {
  let token = '';
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }

  const res = await fetch('/api/ai/evaluate-response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to evaluate AI response');
  }

  const json = await res.json();
  return json.data;
}
