import { generateContentWithRetry } from '../gemini.ts';

export interface ChatMessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatMessagePart[];
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface MultiTurnChatRequest {
  messages: ChatMessage[];
  roleId?: string;
  systemInstruction?: string;
  taskComplexity?: 'general' | 'complex' | 'fast';
  classLevel?: string;
  subject?: string;
  useSearchGrounding?: boolean;
}

export interface MultiTurnChatResponse {
  reply: string;
  modelUsed: string;
  roleId: string;
  timestamp: string;
  groundingSources?: GroundingSource[];
  searchQueries?: string[];
}

const DEFAULT_PERSONA_INSTRUCTIONS: Record<string, { model: string; instruction: string }> = {
  socratic: {
    model: 'gemini-3.8-flash',
    instruction:
      'You are StudyPilot AI, an encouraging Socratic Study Coach for Class 9-12 CBSE & State Board students. Guide the student step-by-step. Ask guiding questions, explain concepts conceptually with clear analogies, and format math/science using LaTeX notation ($...$ or $$...$$).',
  },
  stem_complex: {
    model: 'gemini-4-argon',
    instruction:
      'You are StudyPilot AI Senior STEM Professor. Provide deep, rigorous, step-by-step mathematical proofs, physics derivations, and chemistry mechanisms for complex questions. Show every step clearly with LaTeX mathematical equations.',
  },
  quick_revision: {
    model: 'gemini-3.1-flash-lite',
    instruction:
      'You are StudyPilot AI Express Revision Coach. Provide instant, high-density, bulleted answers and key memory triggers for fast exam review. Keep responses concise and focused on high-yield points.',
  },
  essay_critic: {
    model: 'gemini-3.8-flash',
    instruction:
      'You are StudyPilot AI English Literature & Writing Mentor. Analyze grammar, essay structure, character analysis, and literary devices for Class 9-12 English curriculum. Provide constructive feedback and polished examples.',
  },
};

export async function processMultiTurnChat(
  req: MultiTurnChatRequest
): Promise<MultiTurnChatResponse> {
  const personaKey = req.roleId || 'socratic';
  const personaConfig = DEFAULT_PERSONA_INSTRUCTIONS[personaKey] || DEFAULT_PERSONA_INSTRUCTIONS.socratic;

  // Determine model based on taskComplexity or personaConfig
  let selectedModel = personaConfig.model;
  if (req.taskComplexity === 'complex') {
    selectedModel = 'gemini-4-argon';
  } else if (req.taskComplexity === 'fast') {
    selectedModel = 'gemini-3.1-flash-lite';
  } else if (req.taskComplexity === 'general') {
    selectedModel = 'gemini-3.8-flash';
  }

  const systemInstruction =
    req.systemInstruction ||
    `${personaConfig.instruction}\n\nStudent Profile: Class ${req.classLevel || '10'}, Subject: ${req.subject || 'General Studies'}.`;

  // Format history messages for generateContent
  const formattedContents = (req.messages || []).map((m) => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: (m.parts || []).map((p) => {
      if (p.inlineData) {
        return {
          inlineData: p.inlineData,
        };
      }
      return {
        text: p.text || '',
      };
    }),
  }));

  if (formattedContents.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  const fallbackModel =
    selectedModel === 'gemini-4-argon'
      ? 'gemini-3.8-flash'
      : selectedModel === 'gemini-3.8-flash'
      ? 'gemini-3.1-flash-lite'
      : 'gemini-3.8-flash';

  const response = await generateContentWithRetry({
    primaryModel: selectedModel,
    fallbackModel,
    contents: formattedContents,
    config: {
      systemInstruction,
    },
    useSearchGrounding: req.useSearchGrounding !== false,
    maxRetries: 2,
  });

  const groundingChunks = response.groundingMetadata?.groundingChunks || [];
  const groundingSources: GroundingSource[] = groundingChunks
    .map((chunk: any) => ({
      title: chunk.web?.title || 'Academic Source',
      uri: chunk.web?.uri || '#',
    }))
    .filter((s: GroundingSource) => Boolean(s.uri && s.uri !== '#'));

  const searchQueries: string[] = response.groundingMetadata?.webSearchQueries || [];

  return {
    reply: response.text || 'I could not generate a response. Please try rephrasing your question.',
    modelUsed: response.modelUsed || selectedModel,
    roleId: personaKey,
    timestamp: new Date().toISOString(),
    groundingSources,
    searchQueries,
  };
}
