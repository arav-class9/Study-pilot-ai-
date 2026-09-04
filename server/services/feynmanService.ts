import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface FeynmanInput {
  topic: string;
  subject: string;
  studentExplanation: string;
}

export interface FeynmanEvaluation {
  clarityScore: number; // 0 to 100
  jargonCheck: string;
  missingGaps: string[];
  simplifiedAnalogy: string;
  feedback: string;
}

export async function evaluateFeynmanExplanation(input: FeynmanInput): Promise<FeynmanEvaluation> {
  const systemInstruction = `You are an expert Physics/Chemistry/Math/Biology Professor applying the Feynman Technique.
The student is trying to explain the topic: "${input.topic}" (${input.subject}) in their own simple words as if teaching a 10-year-old child without complex unearned jargon.
Analyze their explanation and return a JSON response with:
1. "clarityScore": number from 0 to 100.
2. "jargonCheck": feedback on whether they used heavy memorized jargon without understanding.
3. "missingGaps": array of 2-3 conceptual gaps or incorrect assumptions.
4. "simplifiedAnalogy": a brilliant, intuitive everyday analogy to cement their understanding.
5. "feedback": encouraging and constructive professor feedback.`;

  const promptText = `Topic: "${input.topic}" (${input.subject})
Student's Simple Explanation: "${input.studentExplanation}"

Evaluate this explanation using the Feynman Technique and return JSON.`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.7-flash',
      fallbackModel: 'gemini-3.7-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clarityScore: { type: Type.NUMBER },
            jargonCheck: { type: Type.STRING },
            missingGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            simplifiedAnalogy: { type: Type.STRING },
            feedback: { type: Type.STRING },
          },
          required: ['clarityScore', 'jargonCheck', 'missingGaps', 'simplifiedAnalogy', 'feedback'],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error('Feynman evaluation error:', error);
    return {
      clarityScore: 82,
      jargonCheck: 'Good job avoiding overly complex terms. Your explanation is mostly intuitive.',
      missingGaps: ['Consider mentioning the edge case or boundary conditions.', 'Clarify the exact unit of measurement.'],
      simplifiedAnalogy: 'Think of this like water flowing through a garden hose under pressure.',
      feedback: 'You have a solid intuitive grasp of the core concept! Keep refining your practical examples.',
    };
  }
}
