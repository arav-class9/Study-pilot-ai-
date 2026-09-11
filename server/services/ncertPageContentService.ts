import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface GetPageContentInput {
  classLevel: string;
  subject: string;
  chapterName: string;
  pageNumber: number;
}

export interface GeneratedPageContentResult {
  pageNumber: number;
  sectionTitle: string;
  heading?: string;
  paragraphs: string[];
  keyConcepts: string[];
  formulas?: string[];
  ncertHighlights: string[];
  activities?: {
    activityNumber: string;
    title: string;
    procedure: string;
    observation: string;
    conclusion: string;
  }[];
  inTextQuestions?: {
    question: string;
    answerHint?: string;
  }[];
  vocabulary?: {
    term: string;
    definition: string;
  }[];
  diagramNote?: string;
  pageType: 'theory' | 'activity' | 'numerical_example' | 'summary' | 'exercise';
}

export async function fetchOrGenerateNCERTPageContent(input: GetPageContentInput): Promise<GeneratedPageContentResult> {
  const systemInstruction = `You are the official NCERT Editorial Board Chief for Indian School Education.
Your task is to reconstruct the authentic, high-fidelity textbook page content for a specific page of an official NCERT textbook.
The text must read like a genuine NCERT school book page: clean, engaging, pedagogically rigorous, containing accurate definitions, activities (like Activity 1.1, 1.2), diagrams descriptions, formulas, and in-text questions.`;

  const promptText = `CLASS: NCERT Class ${input.classLevel}
SUBJECT: ${input.subject}
CHAPTER: ${input.chapterName}
PAGE NUMBER: Page ${input.pageNumber}

Reconstruct the authentic text and layout of this exact page in the NCERT textbook.
Include:
1. sectionTitle (e.g. "1.2 Types of Chemical Reactions" or "4.3 Solution of Quadratic Equations")
2. heading (subtopic on this page)
3. paragraphs (3-5 well-written explanatory paragraphs in authentic NCERT style)
4. keyConcepts (3-5 core takeaways)
5. formulas (chemical equations or mathematical formulas present on this page, if any)
6. ncertHighlights (2-4 memorable NCERT box notes, "Do you know?", or teacher tips)
7. activities (if an activity appears on this page, describe procedure, observation, and conclusion)
8. inTextQuestions (1-2 questions usually found at the bottom of the NCERT page)
9. vocabulary (1-3 key terms with clear definitions)
10. diagramNote (description of the textbook figure, e.g. "Figure 1.2: Burning of magnesium ribbon in air")
11. pageType ("theory" | "activity" | "numerical_example" | "summary" | "exercise")`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pageNumber: { type: Type.INTEGER },
            sectionTitle: { type: Type.STRING },
            heading: { type: Type.STRING },
            paragraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            formulas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            ncertHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  activityNumber: { type: Type.STRING },
                  title: { type: Type.STRING },
                  procedure: { type: Type.STRING },
                  observation: { type: Type.STRING },
                  conclusion: { type: Type.STRING },
                },
                required: ['activityNumber', 'title', 'procedure', 'observation', 'conclusion'],
              },
            },
            inTextQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answerHint: { type: Type.STRING },
                },
                required: ['question'],
              },
            },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            diagramNote: { type: Type.STRING },
            pageType: { type: Type.STRING, enum: ['theory', 'activity', 'numerical_example', 'summary', 'exercise'] },
          },
          required: ['sectionTitle', 'paragraphs', 'keyConcepts', 'ncertHighlights'],
        },
      },
    });

    const parsed = JSON.parse(response.text);
    return {
      pageNumber: input.pageNumber,
      sectionTitle: parsed.sectionTitle || `${input.chapterName} - Page ${input.pageNumber}`,
      heading: parsed.heading || '',
      paragraphs: Array.isArray(parsed.paragraphs) && parsed.paragraphs.length > 0
        ? parsed.paragraphs
        : [`This page covers foundational NCERT concepts for ${input.chapterName}.`],
      keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
      formulas: Array.isArray(parsed.formulas) ? parsed.formulas : [],
      ncertHighlights: Array.isArray(parsed.ncertHighlights) ? parsed.ncertHighlights : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      inTextQuestions: Array.isArray(parsed.inTextQuestions) ? parsed.inTextQuestions : [],
      vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
      diagramNote: parsed.diagramNote || '',
      pageType: parsed.pageType || 'theory',
    };
  } catch (err: any) {
    console.error('fetchOrGenerateNCERTPageContent error:', err);
    return {
      pageNumber: input.pageNumber,
      sectionTitle: `${input.chapterName} • Section Overview`,
      heading: `Key Principles of ${input.chapterName}`,
      paragraphs: [
        `In this section of Class ${input.classLevel} ${input.subject}, students examine the fundamental definitions and empirical models underlying ${input.chapterName}.`,
        `NCERT emphasizes establishing conceptual clarity before undertaking complex multi-step numerical problem solving and board exam assertions.`,
        `Notice how the experimental observations connect directly with theoretical mathematical formulations in the curriculum.`,
      ],
      keyConcepts: [
        `Systematic definition of fundamental variables in ${input.chapterName}`,
        `Standard SI units and dimensional consistency`,
        `Direct application to CBSE Board Examination pattern questions`,
      ],
      ncertHighlights: [
        `NCERT Exemplar Alert: Pay close attention to standard state conditions and balanced chemical/algebraic notation.`,
      ],
      inTextQuestions: [
        {
          question: `Why is it essential to verify conservation laws when analyzing reactions or equations on Page ${input.pageNumber}?`,
          answerHint: `Matter and charge can neither be created nor destroyed during standard closed transformations.`,
        },
      ],
      pageType: 'theory',
    };
  }
}
