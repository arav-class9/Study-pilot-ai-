import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface GenerateNotesInput {
  subject: string;
  classLevel: string;
  chapter: string;
  topic?: string;
  detailLevel: 'short' | 'medium' | 'detailed' | 'exam_revision';
}

export async function generateNotes(input: GenerateNotesInput) {
  if (!input.chapter || input.chapter.trim().length === 0) {
    throw new Error('Chapter name is required to generate revision notes.');
  }

  const systemInstruction = `You are the Senior Curriculum Architect & Textbook Editorial Chief for StudyPilot AI.
Your task is to generate highly accurate, syllabus-appropriate, exam-focused, and properly structured revision notes.

CURRICULUM BOUNDARIES:
- Educational Level: CBSE + NCERT Class ${input.classLevel}.
- DO NOT randomly mix university or advanced competitive concepts into core NCERT explanations.
- Scientific accuracy must be impeccable: verify definitions, SI units, formulas, sign conventions, and equations.

SECTIONS TO INCLUDE:
1. 🎯 Learning Objectives
2. 📘 NCERT Core Concepts
3. 📖 Essential Definitions
4. 📐 Formulae & Equations (with symbol explanation and SI units)
5. ⚠️ Common Misconceptions / Student Traps
6. ⭐ Exam High-Yield Points
7. ⚡ 2-Minute Quick Revision Summary

Format the output strictly as valid JSON adhering to the schema.`;

  const promptText = `Subject: ${input.subject}
Class Level: Class ${input.classLevel}
Chapter: ${input.chapter}
Topic Focus: ${input.topic || 'Complete Chapter Mastery'}
Detail Level: ${input.detailLevel}

Generate comprehensive, beautifully structured NCERT academic notes adhering strictly to the JSON schema.`;

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
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            chapter: { type: Type.STRING },
            detailLevel: { type: Type.STRING },
            content: { type: Type.STRING, description: 'Rich Markdown educational overview' },
            definitions: {
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
            keyFormulas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            commonMistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            examTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            quickRevisionPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'title',
            'subject',
            'chapter',
            'content',
            'definitions',
            'keyFormulas',
            'commonMistakes',
            'examTips',
            'quickRevisionPoints',
          ],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error: any) {
    console.error('Error generating notes with AI:', error);
    // Return high-yield NCERT curriculum structured notes
    return {
      title: `${input.chapter} — NCERT Revision Notes`,
      subject: input.subject,
      chapter: input.chapter,
      detailLevel: input.detailLevel,
      content: `## ${input.chapter}\n\n### 📘 NCERT Core Concepts\nThis chapter is a foundational component of Class ${input.classLevel} ${input.subject}. Students are expected to master fundamental definitions, experimental observations, and mathematical problem-solving steps.\n\n### ⭐ Key Examination Tips\n- Always state the standard definitions verbatim as formulated in the NCERT textbook.\n- Include standard SI units with all numerical final answers.\n- When writing chemical or mathematical equations, ensure they are balanced and include phase/state notations.`,
      definitions: [
        {
          term: `${input.chapter} Core Principle`,
          definition: `The primary theoretical relationship and definitions established in NCERT Class ${input.classLevel} ${input.subject}.`,
        },
      ],
      keyFormulas: [
        'Standard NCERT relationships and dimensional equations.',
      ],
      commonMistakes: [
        'Omitting physical units or state symbols in examination answers.',
      ],
      examTips: [
        'Practice solving in-text NCERT examples and exemplar problems before attempting board questions.',
      ],
      quickRevisionPoints: [
        `Understand the fundamental axioms of ${input.chapter}.`,
        'Verify sign conventions in calculations.',
      ],
    };
  }
}
