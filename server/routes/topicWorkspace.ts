import { Router, Request, Response } from 'express';
import { Type, Schema } from '@google/genai';
import { generateContentWithRetry, safeJsonParse } from '../gemini.js';

export const topicWorkspaceRouter = Router();

// ==========================================
// 0. GENERATE FORMAL TOPIC DEFINITION & BREAKDOWN
// ==========================================
const definitionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    formalDefinition: {
      type: Type.STRING,
      description: 'Clear, accurate, and easy-to-understand standard definition of the topic.',
    },
    keyUses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-3 concise bullet points explaining where and why this concept is used in science, daily life, or industry.',
    },
    solvedExamples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Short descriptive title of the example or scenario.' },
          explanation: { type: Type.STRING, description: 'Clear explanation of the real-world or textbook example.' },
          calculationOrSteps: { type: Type.STRING, description: 'Step-by-step formula derivation or calculation steps if applicable.' },
        },
        required: ['title', 'explanation'],
      },
      description: 'At least 1-2 concrete solved examples with step-by-step calculation or reasoning if applicable.',
    },
    quickSummary: {
      type: Type.STRING,
      description: 'A punchy 1-line recap summarizing the core idea for quick exam revision.',
    },
    coreConcepts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Key principles, fundamental characteristics, and structural components.',
    },
    keyFormulasOrRules: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Essential equations, laws, SI units, or governing rules.',
    },
    realWorldExamples: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Concrete real-world applications or practical use cases.',
    },
    commonExamPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'High-yield board exam questions, key marks criteria, memory tricks, and frequent traps.',
    },
  },
  required: ['formalDefinition', 'keyUses', 'solvedExamples', 'quickSummary'],
};

topicWorkspaceRouter.post('/generate-definition', async (req: Request, res: Response) => {
  try {
    const { topicName, subject, classLevel, chapter, uploadedContextText } = req.body;

    if (!topicName) {
      res.status(400).json({ error: 'Topic name is required.' });
      return;
    }

    const prompt = `You are a master academic educator creating the official 4-part reference summary for the topic "${topicName}" in ${subject || 'Science'} for ${classLevel || 'Class 9-12'} (Chapter: ${chapter || 'General'}).

${uploadedContextText ? `GROUNDING CONTEXT:\n${uploadedContextText.slice(0, 4000)}\n` : ''}

CRITICAL STRUCTURE REQUIREMENTS:
1. formalDefinition: A clear, accurate, and easy-to-understand standard definition of "${topicName}".
2. keyUses: 2-3 bullet points detailing where and why this concept is used in science, daily life, or industry.
3. solvedExamples: 1-2 concrete, step-by-step solved examples or real-world applications (include formulas/calculations if applicable).
4. quickSummary: A 1-line recap for quick revision.
5. coreConcepts: 2-3 bullet points for core principles.
6. keyFormulasOrRules: 1-3 key formulas or scientific laws.
7. realWorldExamples: 2-3 real-world practical applications.
8. commonExamPoints: 2-3 board exam key points or traps.

Return clean JSON conforming strictly to the schema.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: definitionSchema,
      },
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-flash-latest',
    });

    const parsed = safeJsonParse(response.text, {
      formalDefinition: `${topicName} is a fundamental concept in ${subject || 'Science'} that defines its primary properties, operational mechanics, and structural principles in the ${classLevel || 'Class 9'} syllabus.`,
      keyUses: [
        `Used in scientific research and industrial applications involving ${topicName}.`,
        'Applies to daily physical or chemical processes to predict structural behavior.',
        'Forms the basis for quantitative modeling and problem-solving in exams.',
      ],
      solvedExamples: [
        {
          title: `Example 1: Standard Application of ${topicName}`,
          explanation: `In a standard lab scenario or real-world system, ${topicName} governs energy transfer or cellular function.`,
          calculationOrSteps: 'Step 1: Identify given parameters. Step 2: Apply standard formula. Step 3: Compute final value with SI units.',
        },
      ],
      quickSummary: `${topicName}: Core scientific concept governing system interactions and practical applications in ${subject || 'Science'}.`,
      coreConcepts: [
        `Primary structural and functional unit of ${topicName}.`,
        'Governs energy, matter, or relational interactions within the system.',
      ],
      keyFormulasOrRules: [
        `Standard ${topicName} relation with SI units.`,
      ],
      realWorldExamples: [
        `Practical application of ${topicName} in technology or daily life.`,
      ],
      commonExamPoints: [
        `High-yield board exam definition for ${topicName}.`,
      ],
    });

    res.json({
      success: true,
      definitionBreakdown: parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[TOPIC WORKSPACE] Generate Definition Error:', err);
    res.status(500).json({
      error: 'Failed to generate topic definition breakdown.',
      message: err.message,
    });
  }
});

// ==========================================
// 1. GENERATE AI NOTES
// ==========================================
topicWorkspaceRouter.post('/generate-notes', async (req: Request, res: Response) => {
  try {
    const { topicName, subject, classLevel, chapter, noteType, uploadedContextText } = req.body;

    if (!topicName) {
      res.status(400).json({ error: 'Topic name is required.' });
      return;
    }

    const typeDescMap: Record<string, string> = {
      short: 'Concise summary notes with high-yield bullet points for quick review.',
      detailed: 'Comprehensive, textbook-style detailed notes with in-depth explanations, headings, subheadings, and examples.',
      exam: 'Exam-oriented notes highlighting high-yield exam predictions, frequent board question triggers, and memory tips.',
      definitions: 'Exhaustive list of essential terminology, scientific definitions, and key concepts.',
      key_points: 'Numbered key takeaways, core principles, and bulleted highlights.',
      examples: 'Real-world applications, solved numerical examples, and practical cases.',
      formulas: 'Master formula sheet with variable definitions, units, LaTeX equations, and mathematical derivations.',
      concept_map: 'Structured ASCII or text concept map diagram with clear hierarchical arrows and relationship nodes.',
      summary: 'Executive 3-paragraph summary of the core topic.',
    };

    const typePrompt = typeDescMap[noteType] || typeDescMap['detailed'];

    const prompt = `You are a world-class academic tutor creating official StudyPilot AI study notes.

TOPIC DETAILS:
- Topic Name: ${topicName}
- Subject: ${subject || 'General Science / Studies'}
- Class / Grade: ${classLevel || 'Class 9-12'}
- Chapter: ${chapter || 'General Chapter'}
- Requested Note Style: ${noteType} (${typePrompt})

${uploadedContextText ? `PRIORITIZE THIS UPLOADED TEXTBOOK / CLASSROOM MATERIAL:
---
${uploadedContextText.slice(0, 8000)}
---
Ensure all generated definitions and facts strictly reference and ground on the uploaded material above where relevant.` : ''}

INSTRUCTIONS:
1. Output beautifully structured Markdown.
2. Use LaTeX math formatting ($...$ for inline, $$...$$ for block formulas) for all scientific equations or math.
3. Use clear section headers (H1, H2, H3), bold key terms, and bullet points.
4. Include a dedicated "### 💡 Memory Trick / Exam Tip" callout box.
5. Include a structured "### 🗺️ Concept Map / Structural Flow" ASCII diagram block.

Write clean, highly accurate, engaging study notes now.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-flash-latest',
    });

    res.json({
      success: true,
      notesMarkdown: response.text,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[TOPIC WORKSPACE] Generate Notes Error:', err);
    res.status(500).json({
      error: 'Failed to generate topic notes. Please check AI connection or try again.',
      message: err.message,
    });
  }
});

// ==========================================
// 2. CHECK MY UNDERSTANDING (SELF-EXPLANATION EVAL)
// ==========================================
const explanationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    correctConcepts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of specific concepts the student accurately explained in their response.',
    },
    missingConcepts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Core aspects or key details that were missing from the student explanation.',
    },
    misconceptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Any scientific, mathematical, or factual inaccuracies found in the student explanation.',
    },
    revisionRecommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Targeted study prompts or active recall questions for the student to revise.',
    },
    overallFeedback: {
      type: Type.STRING,
      description: 'Encouraging, constructive pedagogical feedback guiding active learning without giving away total answers directly.',
    },
    score: {
      type: Type.NUMBER,
      description: 'Overall mastery score from 0 to 100 assessing conceptual depth and accuracy.',
    },
  },
  required: ['correctConcepts', 'missingConcepts', 'misconceptions', 'revisionRecommendations', 'overallFeedback', 'score'],
};

topicWorkspaceRouter.post('/check-explanation', async (req: Request, res: Response) => {
  try {
    const { topicName, subject, explanationText, notesContext } = req.body;

    if (!explanationText || explanationText.trim().length < 5) {
      res.status(400).json({ error: 'Please provide a written or transcribed explanation to analyze.' });
      return;
    }

    const prompt = `You are an expert Socratic tutor evaluating a student's self-explanation for the topic "${topicName}" in ${subject || 'Science'}.

STUDENT SELF-EXPLANATION:
"${explanationText}"

${notesContext ? `REFERENCE TOPIC NOTES:\n${notesContext.slice(0, 3000)}` : ''}

EVALUATION GOALS:
1. Identify what the student got RIGHT (correctConcepts).
2. Identify what key concepts they MISSED (missingConcepts).
3. Detect any MISCONCEPTIONS or factual errors (misconceptions).
4. Provide active revision recommendations (revisionRecommendations).
5. Give supportive, encouraging Socratic feedback that guides active learning.
6. Assign a mastery score from 0 to 100.

Return clean JSON conforming to the schema.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: explanationSchema,
      },
      primaryModel: 'gemini-3.8-flash',
    });

    const parsed = safeJsonParse(response.text, {
      correctConcepts: ['Basic understanding of core terms.'],
      missingConcepts: ['Deeper structural details.'],
      misconceptions: [],
      revisionRecommendations: ['Review key definitions.'],
      overallFeedback: 'Good effort! Focus on adding key terms to solidify your understanding.',
      score: 70,
    });

    res.json({
      success: true,
      feedback: parsed,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[TOPIC WORKSPACE] Check Explanation Error:', err);
    res.status(500).json({
      error: 'Failed to analyze explanation.',
      message: err.message,
    });
  }
});

// ==========================================
// 3. GENERATE PRACTICE QUESTION BANK
// ==========================================
const questionBankSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, description: 'One of: mcq, very_short, short, long, assertion_reason, case_study, application, exam_style' },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Four option choices if MCQ or Assertion & Reason' },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          difficulty: { type: Type.STRING, description: 'easy, medium, or hard' },
          sourceNoteRef: { type: Type.STRING, description: 'Reference section or concept tag' },
        },
        required: ['id', 'type', 'question', 'correctAnswer', 'explanation', 'difficulty'],
      },
    },
  },
  required: ['questions'],
};

topicWorkspaceRouter.post('/generate-questions', async (req: Request, res: Response) => {
  try {
    const { topicName, subject, classLevel, difficulty, count, uploadedContextText, sourceFilter } = req.body;

    const numQuestions = Math.min(15, Math.max(3, Number(count) || 5));
    const targetDifficulty = difficulty || 'medium';

    const prompt = `Generate ${numQuestions} high-quality curriculum practice questions for the topic "${topicName}".
Subject: ${subject || 'Science'}
Grade Level: ${classLevel || 'Class 9-12'}
Difficulty Level: ${targetDifficulty}
${sourceFilter === 'uploaded_only' && uploadedContextText ? 'STRICT REQUIREMENT: Generate questions ONLY based on the uploaded notes context provided below.' : ''}

${uploadedContextText ? `PROVIDED STUDY MATERIAL:\n---\n${uploadedContextText.slice(0, 6000)}\n---` : ''}

Include a varied mix of:
- Multiple Choice Questions (MCQ)
- Very Short Answer / Definitions
- Short Answer / Conceptual
- Long Answer / Derivation or Reasoning
- Assertion & Reason
- Case / Competency-based scenario questions

Return clean JSON with "questions" array conforming strictly to schema.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: questionBankSchema,
      },
      primaryModel: 'gemini-3.8-flash',
    });

    const parsed = safeJsonParse(response.text, { questions: [] });

    res.json({
      success: true,
      questions: parsed.questions || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[TOPIC WORKSPACE] Generate Questions Error:', err);
    res.status(500).json({
      error: 'Failed to generate practice questions.',
      message: err.message,
    });
  }
});

// ==========================================
// 4. GENERATE REVISION SHEET
// ==========================================
const revisionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: 'Executive topic summary tailored for revision.' },
    highYieldBullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Must-remember high-yield exam bullet points.' },
    memoryTraps: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Common mistakes, exam traps, and unit conversion traps.' },
    keyFormulas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Essential formulas or scientific laws.' },
  },
  required: ['summary', 'highYieldBullets', 'memoryTraps'],
};

topicWorkspaceRouter.post('/generate-revision', async (req: Request, res: Response) => {
  try {
    const { topicName, subject, mode, notesText, weakAreas } = req.body;

    const revMode = mode || '15min'; // '5min' | '15min' | 'exam_night'

    const prompt = `You are a master exam revision coach creating a personalized "${revMode}" revision sheet for the topic "${topicName}" (${subject || 'Science'}).

WEAK AREAS / PREVIOUS MISTAKES:
${Array.isArray(weakAreas) && weakAreas.length > 0 ? weakAreas.join(', ') : 'None specified.'}

TOPIC NOTES REFERENCE:
${notesText ? notesText.slice(0, 4000) : 'Standard curriculum topic.'}

REVISION MODE INSTRUCTIONS:
- 5min: Ultra-fast 5-bullet memory refresher for quick checks before class.
- 15min: Comprehensive high-yield overview with definitions, key principles, and diagrams.
- exam_night: Intensive exam-night sheet focused heavily on common traps, board mark-scheme rules, and high-probability test questions.

Return clean JSON conforming to the schema.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: revisionSchema,
      },
      primaryModel: 'gemini-3.8-flash',
    });

    const parsed = safeJsonParse(response.text, {
      summary: `Quick revision summary for ${topicName}.`,
      highYieldBullets: ['Key point 1', 'Key point 2'],
      memoryTraps: ['Watch out for units.'],
      keyFormulas: [],
    });

    res.json({
      success: true,
      revisionSheet: {
        mode: revMode,
        summary: parsed.summary,
        highYieldBullets: parsed.highYieldBullets || [],
        memoryTraps: parsed.memoryTraps || [],
        keyFormulas: parsed.keyFormulas || [],
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[TOPIC WORKSPACE] Generate Revision Error:', err);
    res.status(500).json({
      error: 'Failed to generate revision sheet.',
      message: err.message,
    });
  }
});
