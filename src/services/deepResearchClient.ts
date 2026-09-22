import { callBackendAI } from './aiClient';

export interface DeepResearchSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  sourceType: 'NCERT' | 'Government' | 'University' | 'Scientific Org' | 'Official Doc' | 'Educational' | 'News' | 'Reference';
  authorityScore: number;
  recencyDate?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  keyFactsExtracted: string[];
}

export interface DeepResearchClaim {
  claimText: string;
  supportingSources: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  conflictStatus: 'CONSENSUS' | 'RESOLVED_DIFFERENCE' | 'CONTRADICTION';
  explanation?: string;
}

export interface DeepResearchContradiction {
  topicAspect: string;
  sourceA: string;
  sourceB: string;
  cause: string;
  resolutionText: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'root' | 'subtopic' | 'concept' | 'formula' | 'exam_point';
  description?: string;
}

export interface KnowledgeGraphEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DeepResearchResult {
  id: string;
  timestamp: string;
  query: string;
  normalizedQuery: string;
  intentAnalysis: {
    topic: string;
    subject: string;
    classLevel: string;
    purpose: string;
    depth: string;
    isTimeSensitive: boolean;
    language: string;
    subtopics: string[];
  };
  researchStagesExecuted: {
    stage: number;
    name: string;
    description: string;
    completed: boolean;
  }[];
  sources: DeepResearchSource[];
  claims: DeepResearchClaim[];
  contradictions: DeepResearchContradiction[];
  knowledgeGraph: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
  };
  diagramRecommendation?: {
    title: string;
    description: string;
    keyLabelsToIdentify: string[];
    svgType?: string;
  };
  educationalNotes: {
    title: string;
    summary: string;
    sections: {
      heading: string;
      content: string;
      bulletPoints?: string[];
      formulas?: string[];
      ncertReference?: string;
      isAdditionalInfo?: boolean;
    }[];
    ncertCorner: {
      textbookReference: string;
      exactQuote: string;
      keyLearningOutcomes: string[];
    };
    examHighYield: {
      importantQuestions: string[];
      commonTraps: string[];
      marksWeightageAdvice: string;
    };
    glossary: { term: string; definition: string }[];
  };
  cacheStatus: 'FRESH_SEARCH' | 'CACHED_RESEARCH';
}

export async function executeDeepResearchAPI(params: {
  query: string;
  classLevel?: string;
  subject?: string;
  depth?: 'quick' | 'detailed' | 'deep' | 'very_deep';
  language?: string;
}): Promise<DeepResearchResult> {
  return await callBackendAI<DeepResearchResult>('/api/ai/deep-research', {
    method: 'POST',
    body: params,
    timeoutMs: 45000,
  });
}
