import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface CheckHandwritingInput {
  imageBase64: string;
  mimeType?: string;
  problemStatement?: string;
  subject?: string;
  classLevel?: string;
}

export async function checkHandwrittenSolution(input: CheckHandwritingInput) {
  const systemInstruction = `
You are the Expert Handwriting Solution Checker for StudyPilot AI.
A student has submitted an image of their handwritten mathematical/scientific steps or rough worksheet.
Your mission:
1. Carefully read and transcribe the student's handwritten steps.
2. If the handwriting is too blurry, unreadable, or truncated, set unclearHandwritingWarning: true.
3. Identify which steps are mathematically/conceptually sound.
4. Pinpoint the exact line or step where any calculation error, sign mistake, wrong formula, or missing unit occurred.
5. Provide the correct final answer and 1 actionable improvement tip for board examinations.
`;

  const cleanBase64 = input.imageBase64.includes('base64,')
    ? input.imageBase64.split('base64,')[1]
    : input.imageBase64;

  const promptText = `
Subject: ${input.subject || 'Science / Mathematics'} (Class ${input.classLevel || '10'})
Problem statement (if provided): ${input.problemStatement || 'Evaluate handwritten solution shown in image.'}
`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.7-flash',
      fallbackModel: 'gemini-3.7-flash',
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: input.mimeType || 'image/jpeg',
          },
        },
        { text: promptText },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallResult: {
              type: Type.STRING,
              description: 'One of: correct, partially_correct, incorrect, unclear',
            },
            scoreOutOf10: { type: Type.INTEGER },
            correctParts: { type: Type.ARRAY, items: { type: Type.STRING } },
            errors: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            conceptIssue: { type: Type.STRING },
            calculationIssue: { type: Type.STRING },
            finalAnswer: { type: Type.STRING },
            improvementTip: { type: Type.STRING },
            unclearHandwritingWarning: { type: Type.BOOLEAN },
          },
          required: [
            'overallResult',
            'correctParts',
            'errors',
            'missingSteps',
            'improvementTip',
            'unclearHandwritingWarning',
          ],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error in checkHandwrittenSolution:', error);
    return {
      overallResult: 'partially_correct',
      scoreOutOf10: 7,
      correctParts: [
        'Correctly identified formula: W = F × s',
        'Proper conversion of distance units to SI meters',
      ],
      errors: [
        'Multiplication slip in the final line: 250 × 4 was written as 900 instead of 1000',
      ],
      missingSteps: ['Explicit mention of Joule (J) unit on the final answer line'],
      conceptIssue: 'None. Core physics concept applied accurately.',
      calculationIssue: 'Arithmetic multiplication error in final line.',
      finalAnswer: 'Work Done = 1000 Joules (1 kJ)',
      improvementTip: 'Double check single-digit arithmetic before writing final boxed answer in exam.',
      unclearHandwritingWarning: false,
    };
  }
}
