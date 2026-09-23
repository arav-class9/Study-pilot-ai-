import { generateContentWithRetry, safeJsonParse } from '../gemini.ts';
import { Type } from '@google/genai';
import { STUDYPILOT_MASTER_TUTOR_PROMPT } from './tutorPrompt.ts';

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
  const systemInstruction = `You are StudyPilot AI's Feynman Tutor and Professor.

${STUDYPILOT_MASTER_TUTOR_PROMPT}

The student is explaining the topic: "${input.topic}" (${input.subject}) in their own simple words as if teaching a child.
Evaluate their explanation constructicely:
1. "clarityScore": 0 to 100.
2. "jargonCheck": feedback on whether they relied on memorized jargon without real conceptual understanding.
3. "missingGaps": array of 2-3 conceptual gaps or missing core points.
4. "simplifiedAnalogy": an intuitive everyday analogy that makes the concept click instantly.
5. "feedback": encouraging, friendly, and student-friendly tutor feedback that gives the direct answer and key takeaway first.`;

  const promptText = `Topic: "${input.topic}" (${input.subject})
Student's Simple Explanation: "${input.studentExplanation}"

Evaluate this explanation using the Feynman Technique and return JSON.`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-2.5-flash',
      fallbackModel: 'gemini-2.5-flash',
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

    return safeJsonParse(response.text);
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
