import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';
import { verifyNumericalSolution, verifyMCQQuestion } from './verification.js';
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
  const systemInstruction = `You are StudyPilot AI, an elite, patient, and pedagogical AI Academic Coach specializing in CBSE/NCERT, ICSE, IGCSE, and K-12 STEM & Humanities (Classes 6 to 12).
When solving academic questions for students:
1. Identify the core underlying academic concept clearly.
2. Explain the intuition before jumping into algebra/mechanics/equations.
3. Solve step-by-step. For every step, explain *why* that step is taken.
4. If it is a numerical/scientific problem, explicitly breakdown: Given parameters, Standard Formula, Value Substitution, Stepwise Calculation, Final Answer with standard SI units.
5. If it is a multiple choice question (MCQ), state the correct option clearly and explain why other options are distractor traps.
6. If the uploaded image or text is blurry, truncated, or unreadable, set "unclearImageWarning": true and provide the exact message in conceptExplanation: "I can't read part of the question clearly. Please upload a clearer image."
7. Highlight 1 or 2 common student mistakes/misconceptions for this topic.
8. Provide 1 similar practice drill with a helpful hint and the final answer to reinforce learning.
9. Ground the explanation strictly in rigorous curriculum standards.`;

  const promptText = `Subject: ${input.subject || 'General Academic'}
Target Class: Class ${input.classLevel || '10'}
Chapter Reference: ${input.chapter || 'Curriculum'}
Student Question / Problem:
${input.questionText || (input.imageBase64 ? 'Please analyze and solve the question in the attached image.' : 'Explain fundamental academic concepts')}

Provide a structured, step-by-step educational solution for the student in valid JSON format.`;

  const generator = async (validatedInput: DoubtInput) => {
    const contents: any = [];
    if (validatedInput.imageBase64) {
      const cleanBase64 = validatedInput.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: validatedInput.imageMimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }
    contents.push({
      text: promptText,
    });

    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.6-flash',
      fallbackModel: 'gemini-3.6-flash',
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
      sourceTitle: validatedInput.chapter ? `Curriculum • ${validatedInput.chapter}` : `Curriculum • Class ${validatedInput.classLevel || '10'}`,
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
    finalData.verificationMessage = safetyResult.status === 'verified' ? 'Verified by AI Verification Engine' : 'Needs review by student.';
    return finalData;
  } else {
    // Fallback if AI Safety Layer rejects or fails entirely
    console.error('Safety Layer Fallback triggered for solveDoubt');
    return {
      question: input.questionText || 'Uploaded Academic Question',
      detectedSubject: input.subject || 'Science',
      detectedTopic: 'Core Principles',
      concept: "System Error or Unsafe Request",
      conceptExplanation: "The request could not be processed due to a timeout, safety violation, or system error. Please try again with a clearer question.",
      isNumerical: false,
      unclearImageWarning: !!input.imageBase64,
      stepByStep: [
        {
          stepNumber: 1,
          title: 'Error Encountered',
          explanation: safetyResult.error || 'The AI verification system blocked this request or failed.',
          whyItWorks: 'Safety First',
        }
      ],
      finalAnswer: 'Unable to resolve question.',
      commonMistakes: [],
      similarPracticeQuestion: {
        question: 'Try asking a standard syllabus question.',
        hint: 'N/A',
        answer: 'N/A',
      },
      verificationStatus: safetyResult.status || 'verification_failed',
      verificationConfidence: 0,
      verificationMessage: safetyResult.error || 'Request failed.',
      source: {
        sourceType: 'system',
        sourceTitle: 'System Guardrail',
      },
    };
  }
}
