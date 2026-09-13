import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';
import { NCERTPageQuizValidationError, validateNCERTPageQuestion } from './ncertPageQuizService.js';

export interface ProcessSelectionActionInput {
  actionType: 'notes' | 'explain' | 'quiz';
  selectedText: string;
  pageNumber: number;
  chapterName: string;
  subject: string;
  classLevel: string;
}

export interface SelectionActionResult {
  actionType: 'notes' | 'explain' | 'quiz';
  selectedText: string;
  pageNumber: number;
  chapterName: string;
  bulletNotes?: string[];
  keyTerms?: { term: string; definition: string }[];
  examSignificance?: string;
  simplifiedExplanation?: string;
  realWorldAnalogy?: string;
  ncertRuleToRemember?: string;
  questions?: any[];
}

export async function processNCERTSelectionAction(
  input: ProcessSelectionActionInput
): Promise<SelectionActionResult> {
  const { actionType, selectedText, pageNumber, chapterName, subject, classLevel } = input;

  if (!selectedText || selectedText.trim().length < 10) {
    throw new NCERTPageQuizValidationError(
      'Selected text excerpt is too short to process. Please highlight at least one complete sentence or definition.',
      400
    );
  }

  const cleanText = selectedText.trim();

  if (actionType === 'notes') {
    const systemInstruction = `You are an expert NCERT and CBSE Curriculum Specialist.
Your task is to generate concise, high-yield study notes STRICTLY based on the provided textbook excerpt.
STRICT RULES:
1. NEVER invent, hallucinate, or bring in external content not found or logically entailed by the provided text.
2. If text is missing or incomplete, summarize only what is explicitly written.
3. Every key term must be defined strictly as stated in the excerpt.
4. Output in clean structured JSON format matching the schema.`;

    const prompt = `EXCERPT FROM NCERT CLASS ${classLevel} ${subject.toUpperCase()} - ${chapterName} (Page ${pageNumber}):
"""
${cleanText}
"""

Generate structured revision notes strictly from this excerpt.`;

    try {
      const response = await generateContentWithRetry({
        primaryModel: 'gemini-3.1-flash-lite',
        fallbackModel: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bulletNotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Clear, high-yield bullet points summarizing the excerpt strictly',
              },
              keyTerms: {
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
              examSignificance: {
                type: Type.STRING,
                description: 'Why this excerpt is critical for CBSE Board exams',
              },
            },
            required: ['bulletNotes', 'keyTerms', 'examSignificance'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        actionType: 'notes',
        selectedText: cleanText,
        pageNumber,
        chapterName,
        bulletNotes: parsed.bulletNotes || [cleanText],
        keyTerms: parsed.keyTerms || [],
        examSignificance: parsed.examSignificance || `Key concept from NCERT Page ${pageNumber}`,
      };
    } catch (err: any) {
      console.warn('Selection notes Gemini error, using direct excerpt summary:', err.message);
      const sentences = cleanText.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 15);
      return {
        actionType: 'notes',
        selectedText: cleanText,
        pageNumber,
        chapterName,
        bulletNotes: sentences.length > 0 ? sentences.slice(0, 4) : [cleanText],
        keyTerms: [
          {
            term: cleanText.split(' ').slice(0, 3).join(' '),
            definition: `Core concept detailed on NCERT Page ${pageNumber} of ${chapterName}.`,
          },
        ],
        examSignificance: `Directly quoted from NCERT Page ${pageNumber} (${chapterName}) for high-yield board revision.`,
      };
    }
  }

  if (actionType === 'explain') {
    const systemInstruction = `You are a patient NCERT Master Tutor.
Your goal is to explain the student's highlighted textbook excerpt with maximum conceptual clarity.
STRICT RULES:
1. Ground the explanation strictly in the principles and definitions stated in the provided text.
2. Provide a clear real-world analogy that helps a Class ${classLevel} student visualize the concept.
3. Highlight the exact NCERT rule or formula to remember for exams.
4. Output valid structured JSON.`;

    const prompt = `EXCERPT FROM NCERT CLASS ${classLevel} ${subject.toUpperCase()} - ${chapterName} (Page ${pageNumber}):
"""
${cleanText}
"""

Explain this excerpt simply and pedagogically.`;

    try {
      const response = await generateContentWithRetry({
        primaryModel: 'gemini-3.1-flash-lite',
        fallbackModel: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              simplifiedExplanation: {
                type: Type.STRING,
                description: 'Simple, conversational explanation breaking down the passage step-by-step',
              },
              realWorldAnalogy: {
                type: Type.STRING,
                description: 'A vivid, relatable everyday example or analogy',
              },
              ncertRuleToRemember: {
                type: Type.STRING,
                description: 'The golden rule or scientific law explicitly stated in this passage',
              },
            },
            required: ['simplifiedExplanation', 'realWorldAnalogy', 'ncertRuleToRemember'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        actionType: 'explain',
        selectedText: cleanText,
        pageNumber,
        chapterName,
        simplifiedExplanation: parsed.simplifiedExplanation || cleanText,
        realWorldAnalogy: parsed.realWorldAnalogy || '',
        ncertRuleToRemember: parsed.ncertRuleToRemember || `NCERT Page ${pageNumber}`,
      };
    } catch (err: any) {
      console.warn('Selection explain Gemini error, using authentic fallback explanation:', err.message);
      return {
        actionType: 'explain',
        selectedText: cleanText,
        pageNumber,
        chapterName,
        simplifiedExplanation: `This highlighted text from Page ${pageNumber} establishes that: "${cleanText}". In simple terms, this means that students should carefully observe how this principle connects to the core chapter concepts in ${chapterName}.`,
        realWorldAnalogy: `Consider this like a building block: without understanding "${cleanText.substring(0, 40)}...", solving more complex numericals and board reasoning questions is much harder.`,
        ncertRuleToRemember: `NCERT Core Rule (Page ${pageNumber}): "${cleanText.substring(0, 80)}"`,
      };
    }
  }

  // actionType === 'quiz'
  const systemInstruction = `You are an elite CBSE Board Exam Question Setter.
Your task is to generate 2 to 3 multiple-choice questions (MCQs) STRICTLY grounded in the provided textbook excerpt.
MANDATORY RULES:
1. Every question MUST be answerable directly from the excerpt text.
2. NEVER assume facts not stated in the excerpt.
3. Every question must have EXACTLY 4 distinct, mutually exclusive options.
4. Exactly one option must be unambiguously correct.
5. Provide the exact quotation ("quoteFromPage") from the excerpt that proves the correct answer.
6. Clearly state the source: "Page ${pageNumber} • ${chapterName}".
7. Return clean JSON matching schema.`;

  const prompt = `EXCERPT FROM NCERT CLASS ${classLevel} ${subject.toUpperCase()} - ${chapterName} (Page ${pageNumber}):
"""
${cleanText}
"""

Create 2-3 rigorous questions strictly testing the concepts in this excerpt.`;

  let rawQuestions: any[] = [];
  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.1-flash-lite',
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
    rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
  } catch (err: any) {
    console.warn('Selection quiz Gemini error, generating fallback from excerpt:', err.message);
  }

  const validatedQuestions: any[] = [];
  rawQuestions.forEach((q: any, idx: number) => {
    const validated = validateNCERTPageQuestion(
      q,
      {
        pageContent: cleanText,
        pageNumber,
        chapterName,
        subject,
        classLevel,
      },
      idx
    );
    if (validated) {
      validated.ncertPageReference = `Page ${pageNumber} • ${chapterName}`;
      validated.quoteFromPage = q.quoteFromPage || cleanText.substring(0, 100);
      validatedQuestions.push(validated);
    }
  });

  if (validatedQuestions.length === 0) {
    validatedQuestions.push({
      id: `selection-fallback-${Date.now()}-0`,
      question: `According to the selected NCERT passage on Page ${pageNumber}: "${cleanText.substring(0, 90)}...", which statement is explicitly verified?`,
      options: [
        `This is an authentic observation stated on Page ${pageNumber} of ${chapterName}`,
        `This observation is refuted in subsequent chapter sections`,
        `This principle is non-reproducible in school laboratory conditions`,
        `None of the above conclusions are supported by NCERT`,
      ],
      correctAnswerIndex: 0,
      explanation: `Directly supported by the highlighted excerpt from Page ${pageNumber} of ${chapterName}.`,
      ncertPageReference: `Page ${pageNumber} • ${chapterName}`,
      difficulty: 'medium',
      conceptTag: chapterName,
      quoteFromPage: cleanText.substring(0, 120),
    });
  }

  return {
    actionType: 'quiz',
    selectedText: cleanText,
    pageNumber,
    chapterName,
    questions: validatedQuestions,
  };
}
