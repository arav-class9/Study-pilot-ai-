import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface NotesChatInput {
  question: string;
  notesContent: string;
  chapterName: string;
  subject: string;
  classLevel?: string;
}

export async function chatWithNotes(input: NotesChatInput) {
  const systemInstruction = `You are StudyPilot AI, an expert CBSE/NCERT and K-12 academic study assistant.
You are helping a student chat with their study notes for Chapter: "${input.chapterName}" (${input.subject}, Class ${input.classLevel || '10'}).
Your task is to answer the student's specific question strictly and accurately based on the provided study notes content below. If the answer is not directly in the notes, use your expert academic knowledge to supplement while explaining clearly. Keep your tone encouraging, pedagogical, and clear. Use bullet points or LaTeX equations where helpful.

STUDY NOTES CONTENT:
${input.notesContent}`;

  const promptText = `Student Question: ${input.question}

Please answer the question based on the study notes provided. Return a JSON response with:
1. "answer": The detailed, clear, and structured answer explaining the concept using the notes.
2. "relatedKeyConcept": A brief title of the core concept addressed.
3. "followUpSuggestions": An array of 2 short follow-up questions the student might want to ask next.`;

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
            answer: { type: Type.STRING },
            relatedKeyConcept: { type: Type.STRING },
            followUpSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['answer', 'relatedKeyConcept', 'followUpSuggestions'],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error('Notes chat generation error:', error);
    return {
      answer: `Based on your notes for ${input.chapterName}, here is what you need to know: ${input.question}. Review the key formulas and summary points in your notes to master this topic!`,
      relatedKeyConcept: input.chapterName,
      followUpSuggestions: ['Can you summarize the main formula?', 'What are common exam traps?'],
    };
  }
}
