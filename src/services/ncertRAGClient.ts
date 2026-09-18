import { auth } from '../lib/firebase/config';

export interface RAGTextbookChunk {
  pageNumber: number;
  sectionTitle?: string;
  heading?: string;
  text: string;
  formulas?: string[];
  keyPoints?: string[];
}

export interface TextbookRAGParams {
  query: string;
  bookTitle?: string;
  chapterName: string;
  classLevel: string;
  subject: string;
  language?: 'en' | 'hi' | 'hinglish';
  availablePages?: RAGTextbookChunk[];
  filterPageNumber?: number;
}

export interface CitationItem {
  citationId: string;
  bookTitle: string;
  chapterName: string;
  pageNumber: number;
  sectionTitle?: string;
  exactQuote: string;
  relevanceScore: number;
}

export interface TextbookRAGResult {
  id: string;
  query: string;
  answer: string;
  summaryBulletPoints: string[];
  citations: CitationItem[];
  keyFormulasIdentified: string[];
  groundingConfidenceScore: number;
  hallucinationCheck: {
    status: 'grounded' | 'partially_grounded' | 'unverified';
    hallucinationRisk: 'low' | 'medium' | 'high';
    verifiedClaimsCount: number;
    unsupportedClaimsCount: number;
    explanation: string;
  };
  language: 'en' | 'hi' | 'hinglish';
  suggestedFollowUpQuestions: string[];
}

export async function askTextbookRAG(
  params: TextbookRAGParams
): Promise<TextbookRAGResult> {
  let token = '';
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }

  const response = await fetch('/api/ai/textbook-rag', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to query textbook RAG.');
  }

  const json = await response.json();
  return json.data;
}
