import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';
import { validateNCERTPageQuestion, NCERTPageQuizValidationError } from './ncertPageQuizService.js';

export interface PageExcerpt {
  pageNumber: number;
  chapterNumber: number;
  chapterTitle: string;
  sectionTitle: string;
  excerptText: string;
}

export interface GenerateFullBookTestInput {
  bookTitle: string;
  classLevel: string;
  subject: string;
  pages: PageExcerpt[];
  questionCount?: number;
}

export async function generateFullBookTest(input: GenerateFullBookTestInput) {
  const { bookTitle, classLevel, subject, pages } = input;
  const targetCount = Math.max(5, Math.min(25, input.questionCount || 10));

  if (!pages || pages.length === 0) {
    throw new NCERTPageQuizValidationError(
      'At least one textbook chapter/page excerpt must be provided to create a test.',
      400
    );
  }

  // Compile textbook excerpts with strict page labels
  const excerptsText = pages
    .slice(0, 15) // Max 15 key pages to keep prompt focused and within token limits
    .map(
      (p) =>
        `[PAGE ${p.pageNumber} | CH ${p.chapterNumber}: ${p.chapterTitle} | ${p.sectionTitle}]:\n"""\n${p.excerptText.substring(0, 800)}\n"""`
    )
    .join('\n\n');

  const systemInstruction = `You are a Senior CBSE Examination Controller and Textbook Author.
Your task is to generate a comprehensive ${targetCount}-question Mock Test for ${bookTitle} (Class ${classLevel} ${subject.toUpperCase()}).
CRITICAL MANDATORY RULES:
1. Every question MUST be grounded strictly in the provided labeled page excerpts.
2. NEVER invent facts, reactions, or figures that do not appear in the text.
3. Every question MUST include:
   - Exactly 4 distinct, mutually exclusive options
   - Exactly one correct answer (index 0 to 3)
   - "ncertPageReference": The exact page and section from the excerpt (e.g., "Page 6 • Section 1.2.1 Combination Reaction")
   - "quoteFromPage": Verbatim sentence from the excerpt verifying the answer
   - "conceptTag": Topic name
   - "difficulty": "easy", "medium", or "hard"
4. Output strictly valid JSON.`;

  const prompt = `TEXTBOOK EXCERPTS FROM ${bookTitle.toUpperCase()}:
${excerptsText}

Generate exactly ${targetCount} authentic questions strictly from these pages. Ensure each question cites the exact page number and contains the verifying quote.`;

  const response = await generateContentWithRetry({
    primaryModel: 'gemini-3.8-flash',
    fallbackModel: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                ncertPageReference: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
                conceptTag: { type: Type.STRING },
                quoteFromPage: { type: Type.STRING },
              },
              required: [
                'question',
                'options',
                'correctAnswerIndex',
                'explanation',
                'ncertPageReference',
                'difficulty',
                'conceptTag',
                'quoteFromPage',
              ],
            },
          },
        },
        required: ['questions'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];

  const validatedQuestions: any[] = [];
  rawQuestions.forEach((q: any, idx: number) => {
    // Find matching page reference if missing
    const matchedPage = pages.find((p) =>
      q.ncertPageReference && q.ncertPageReference.includes(String(p.pageNumber))
    ) || pages[idx % pages.length];

    const validated = validateNCERTPageQuestion(
      q,
      {
        pageContent: matchedPage.excerptText,
        pageNumber: matchedPage.pageNumber,
        chapterName: matchedPage.chapterTitle,
        subject,
        classLevel,
      },
      idx
    );

    if (validated) {
      validated.ncertPageReference =
        q.ncertPageReference || `Page ${matchedPage.pageNumber} • ${matchedPage.sectionTitle}`;
      validated.quoteFromPage = q.quoteFromPage || '';
      validatedQuestions.push(validated);
    }
  });

  if (validatedQuestions.length === 0) {
    throw new NCERTPageQuizValidationError(
      'Failed to generate valid board test questions from textbook pages.',
      422
    );
  }

  return {
    bookTitle,
    classLevel,
    subject,
    totalQuestions: validatedQuestions.length,
    questions: validatedQuestions,
  };
}
