import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';
import { verifyNumericalSolution } from './verification.js';
import { executeWithSafetyLayer } from './safety/aiQualityLayer.js';

export interface DoubtInput {
  questionText?: string;
  imageBase64?: string;
  imageMimeType?: string;
  subject?: string;
  classLevel?: string;
  chapter?: string;
}

export async function solveDoubt(input: DoubtInput) {
  const hasText = Boolean(input.questionText && input.questionText.trim().length > 0);
  const hasImage = Boolean(input.imageBase64 && input.imageBase64.trim().length > 0);

  if (!hasText && !hasImage) {
    throw new Error('Please provide either a question description or an image of the academic problem.');
  }

  const systemInstruction = `You are StudyPilot AI, a patient, elite, and pedagogical AI Academic Coach specializing in CBSE/NCERT, ICSE, and K-12 STEM & Humanities (Classes 6 to 12).
When solving academic questions for students:
1. Identify the core underlying academic concept clearly.
2. Explain the conceptual intuition before showing algebraic manipulations or calculations.
3. Solve step-by-step. For every step, explain *why* that step is taken.
4. If it is a numerical or scientific calculation, explicitly provide:
   - Given parameters
   - Standard NCERT formula
   - Value substitution
   - Stepwise calculation
   - Final Answer with standard SI units
5. If it is an MCQ, state the correct option clearly and explain why other options are distractor traps.
6. If the uploaded image or text is blurry, truncated, or unreadable, set "unclearImageWarning": true and set conceptExplanation to: "I can't read part of the question clearly. Please upload a clearer image."
7. Highlight 1 or 2 common student misconceptions for this topic.
8. Provide 1 similar practice drill with a hint and final answer to reinforce learning.
9. Ground the explanation strictly in authentic NCERT curriculum standards.`;

  const promptText = `Subject: ${input.subject || 'Academic Studies'}
Target Class: Class ${input.classLevel || '10'}
Chapter Reference: ${input.chapter || 'Prescribed NCERT Curriculum'}
Student Question / Problem:
${input.questionText || (hasImage ? 'Please analyze and solve the textbook problem shown in the attached image.' : 'Explain foundational principles.')}

Provide a structured, step-by-step educational solution for the student in valid JSON format adhering to the schema.`;

  const generator = async (validatedInput: DoubtInput) => {
    const contents: any = [];
    if (validatedInput.imageBase64) {
      let cleanBase64 = validatedInput.imageBase64;
      let mime = validatedInput.imageMimeType || 'image/jpeg';
      if (cleanBase64.startsWith('data:')) {
        const match = cleanBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mime = match[1];
          cleanBase64 = match[2];
        }
      }
      contents.push({
        inlineData: {
          mimeType: mime,
          data: cleanBase64,
        },
      });
    }
    contents.push({
      text: promptText,
    });

    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: 'The question as detected or typed' },
            detectedSubject: { type: Type.STRING },
            detectedTopic: { type: Type.STRING },
            concept: { type: Type.STRING, description: 'The main scientific/mathematical concept' },
            conceptExplanation: { type: Type.STRING, description: '2-3 sentence concept briefing' },
            isNumerical: { type: Type.BOOLEAN },
            unclearImageWarning: { type: Type.BOOLEAN },
            numericalBreakdown: {
              type: Type.OBJECT,
              properties: {
                given: { type: Type.ARRAY, items: { type: Type.STRING } },
                formula: { type: Type.STRING },
                substitution: { type: Type.STRING },
                calculation: { type: Type.STRING },
                answer: { type: Type.STRING },
                unit: { type: Type.STRING },
              },
            },
            stepByStep: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  calculation: { type: Type.STRING },
                  whyItWorks: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'explanation'],
              },
            },
            finalAnswer: { type: Type.STRING },
            commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
            similarPracticeQuestion: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                hint: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ['question', 'hint', 'answer'],
            },
          },
          required: [
            'question',
            'concept',
            'conceptExplanation',
            'stepByStep',
            'finalAnswer',
            'commonMistakes',
            'similarPracticeQuestion',
          ],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    if (parsed.unclearImageWarning) {
      parsed.conceptExplanation = "I can't read part of the question clearly. Please upload a clearer image.";
    }

    parsed.source = {
      sourceType: validatedInput.imageBase64 ? 'user_uploaded' : 'curriculum',
      sourceTitle: validatedInput.chapter
        ? `NCERT • ${validatedInput.chapter}`
        : `NCERT • Class ${validatedInput.classLevel || '10'}`,
    };
    return parsed;
  };

  const validator = (result: any) => {
    return verifyNumericalSolution(result);
  };

  const safetyResult = await executeWithSafetyLayer(
    { actionName: 'SolveDoubt', input },
    generator,
    validator
  );

  if (safetyResult.success && safetyResult.data) {
    const finalData = safetyResult.data;
    finalData.verificationStatus = safetyResult.status;
    finalData.verificationConfidence = safetyResult.metadata.confidenceScore;
    finalData.verificationMessage =
      safetyResult.status === 'verified'
        ? 'Verified by StudyPilot AI Curriculum Engine'
        : 'Solution formulated; please review steps carefully.';
    return finalData;
  } else {
    throw new Error(safetyResult.error || 'Failed to generate a verified doubt solution. Please try again with a clearer question.');
  }
}
