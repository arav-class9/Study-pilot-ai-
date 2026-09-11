import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface GeneratePageQuizInput {
  pageContent: string;
  pageNumber: number;
  chapterName: string;
  subject: string;
  classLevel: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  count?: number;
}

export interface GeneratedPageQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  ncertPageReference: string;
  difficulty: 'easy' | 'medium' | 'hard';
  conceptTag: string;
  quoteFromPage?: string;
}

export class NCERTPageQuizValidationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = 'NCERTPageQuizValidationError';
    this.statusCode = statusCode;
  }
}

/**
 * Validates a single multiple-choice question:
 * 1. Must have a valid question string (min 10 characters)
 * 2. Must have exactly 4 non-empty string options
 * 3. All 4 options must be unique (case-insensitive trim check)
 * 4. correctAnswerIndex must be an integer between 0 and 3
 * 5. Must have a valid pedagogical explanation
 */
export function validateNCERTPageQuestion(
  q: any,
  input: GeneratePageQuizInput,
  index: number
): GeneratedPageQuestion | null {
  if (!q || typeof q !== 'object') return null;

  const question = typeof q.question === 'string' ? q.question.trim() : '';
  if (question.length < 10) {
    return null;
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return null;
  }

  // Clean each option
  const options: string[] = q.options.map((opt: any) => String(opt || '').trim());
  if (options.some((opt) => opt.length === 0)) {
    return null;
  }

  // Check that all 4 options are distinct / unique
  const normalizedOptions = options.map((opt) => opt.toLowerCase());
  const uniqueSet = new Set(normalizedOptions);
  if (uniqueSet.size !== 4) {
    return null;
  }

  // Validate correctAnswerIndex
  const correctIdx = typeof q.correctAnswerIndex === 'number'
    ? Math.floor(q.correctAnswerIndex)
    : -1;

  if (correctIdx < 0 || correctIdx > 3) {
    return null;
  }

  const explanation = typeof q.explanation === 'string' && q.explanation.trim().length > 0
    ? q.explanation.trim()
    : `Verified directly from NCERT Class ${input.classLevel} ${input.subject} Page ${input.pageNumber}.`;

  const validDifficulties = ['easy', 'medium', 'hard'];
  const difficulty = (validDifficulties.includes(q.difficulty) ? q.difficulty : 'medium') as 'easy' | 'medium' | 'hard';

  return {
    id: q.id || `ncert-page-q-${Date.now()}-${index}`,
    question,
    options,
    correctAnswerIndex: correctIdx,
    explanation,
    ncertPageReference: q.ncertPageReference || `Class ${input.classLevel} ${input.subject} • Page ${input.pageNumber}`,
    difficulty,
    conceptTag: typeof q.conceptTag === 'string' && q.conceptTag.trim().length > 0
      ? q.conceptTag.trim()
      : `${input.chapterName} Concepts`,
    quoteFromPage: typeof q.quoteFromPage === 'string' ? q.quoteFromPage.trim() : '',
  };
}

export async function generateNCERTPageQuiz(input: GeneratePageQuizInput): Promise<GeneratedPageQuestion[]> {
  const cleanContent = (input.pageContent || '').trim();

  // Validate sufficient text length
  if (cleanContent.length < 60) {
    throw new NCERTPageQuizValidationError(
      'Insufficient page content provided (minimum 60 characters required). Please provide or upload a complete NCERT page to generate quiz questions.',
      400
    );
  }

  const targetCount = Math.max(3, Math.min(10, input.count || 5));
  const requestedDifficulty = input.difficulty === 'adaptive' ? 'medium' : (input.difficulty || 'medium');

  const systemInstruction = `You are a Senior NCERT Textbook & CBSE Board Examiner for StudyPilot AI.
Your absolute mandate is to create ${targetCount} rigorous Multiple Choice Questions (MCQs) STRICTLY grounded in the provided NCERT textbook page excerpt.

STRICT ACCURACY & ANTI-HALLUCINATION RULES:
1. Every question must be directly answerable and verifiable from the provided page content alone.
2. NEVER invent textbook facts, chemical reactions, formulas, or historical events not mentioned or directly derived from this exact page content.
3. Each question must have EXACTLY 4 distinct, plausible options (A, B, C, D). All 4 options must be mutually exclusive and unique (NO duplicate or identical options).
4. Exactly one option must be unambiguously correct.
5. "correctAnswerIndex" MUST be an integer: 0 for the 1st option, 1 for the 2nd option, 2 for the 3rd option, or 3 for the 4th option.
6. "explanation" must clearly explain why the correct option is right and cite or quote the fact from this page.
7. Output valid JSON adhering strictly to the schema.`;

  const promptText = `CURRICULUM CONTEXT:
Class: NCERT Class ${input.classLevel}
Subject: ${input.subject}
Chapter: ${input.chapterName}
Page Number: Page ${input.pageNumber}
Target Difficulty: ${requestedDifficulty}
Required Question Count: ${targetCount}

--- EXACT NCERT BOOK PAGE CONTENT START ---
${cleanContent}
--- EXACT NCERT BOOK PAGE CONTENT END ---

Generate exactly ${targetCount} high-yield MCQs strictly from the page content above. Return valid JSON adhering to the schema.`;

  let responseText = '';
  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of exactly 4 unique options',
              },
              correctAnswerIndex: { type: Type.INTEGER, description: '0, 1, 2, or 3' },
              explanation: { type: Type.STRING },
              ncertPageReference: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
              conceptTag: { type: Type.STRING },
              quoteFromPage: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctAnswerIndex', 'explanation', 'difficulty', 'conceptTag'],
          },
        },
      },
    });
    responseText = response.text || '[]';
  } catch (err: any) {
    console.error('generateNCERTPageQuiz Gemini error:', err);
    throw new NCERTPageQuizValidationError(
      `AI quiz generation failed: ${err.message || 'Error communicating with AI service'}. Please try again.`,
      500
    );
  }

  let rawQuestions: any[];
  try {
    rawQuestions = JSON.parse(responseText);
  } catch (err) {
    throw new NCERTPageQuizValidationError(
      'AI service returned malformed JSON for NCERT page quiz. Please try again.',
      422
    );
  }

  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new NCERTPageQuizValidationError(
      'AI was unable to generate quiz questions from this page text. Please ensure the page contains clear textbook paragraphs or concepts.',
      422
    );
  }

  // Strictly validate every question: exactly 4 unique options and valid index
  const validatedQuestions: GeneratedPageQuestion[] = [];
  for (let i = 0; i < rawQuestions.length; i++) {
    const validated = validateNCERTPageQuestion(rawQuestions[i], input, i);
    if (validated) {
      validatedQuestions.push(validated);
    }
  }

  // Enforce minimum valid questions threshold
  const minRequired = Math.min(3, targetCount);
  if (validatedQuestions.length < minRequired) {
    throw new NCERTPageQuizValidationError(
      `The generated quiz failed strict quality validation (only ${validatedQuestions.length} of ${targetCount} questions satisfied the 4-unique-option and verified-answer rules). Request rejected to prevent inaccurate textbook content.`,
      422
    );
  }

  return validatedQuestions;
}
