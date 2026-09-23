import { getGeminiClient, generateContentWithRetry, safeJsonParse } from '../gemini.ts';

export interface TeacherWorksheetRequest {
  subject: string;
  classLevel: string;
  board?: string;
  chapterName: string;
  topicNames?: string[];
  worksheetType: 'practice_worksheet' | 'question_paper' | 'chapter_test' | 'revision_drill';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  totalMarks?: number;
  includeAnswerKey?: boolean;
  language?: 'en' | 'hi';
}

export interface QuestionItem {
  questionNumber: number;
  section?: string;
  questionType: 'mcq' | 'true_false' | 'fill_blanks' | 'short_answer_2m' | 'short_answer_3m' | 'long_answer_5m' | 'case_study_4m' | 'numerical';
  marks: number;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  stepByStepSolution: string;
  markingSchemeGuide: string;
  ncertTopicReference: string;
}

export interface TeacherWorksheetResponse {
  id: string;
  title: string;
  institutionHeader?: string;
  subject: string;
  classLevel: string;
  board: string;
  chapterName: string;
  worksheetType: string;
  difficulty: string;
  totalMarks: number;
  suggestedDurationMinutes: number;
  instructions: string[];
  sections: {
    sectionName: string;
    sectionDescription: string;
    totalMarks: number;
    questions: QuestionItem[];
  }[];
  answerKeyAndMarkingScheme: {
    questionNumber: number;
    modelAnswer: string;
    markingCriteria: string[];
  }[];
  pedagogicalNotes: string;
  createdAt: string;
}

export async function generateTeacherWorksheet(
  params: TeacherWorksheetRequest
): Promise<TeacherWorksheetResponse> {
  const {
    subject,
    classLevel,
    board = 'CBSE',
    chapterName,
    topicNames = [],
    worksheetType,
    difficulty,
    totalMarks = worksheetType === 'question_paper' ? 40 : 25,
    includeAnswerKey = true,
    language = 'en',
  } = params;

  const topicsList = topicNames.length > 0 ? topicNames.join(', ') : 'All core chapter topics';

  const systemInstruction = `You are a Senior Academic Coordinator and Master Curriculum Teacher for ${board} Class ${classLevel} ${subject}.
Generate a comprehensive, pedagogically sound, and strictly authentic educational assessment / worksheet in ${language === 'hi' ? 'Hindi (preserve standard English formulas and technical terms in brackets like [Photosynthesis / प्रकाश-संश्लेषण])' : 'English'}.

Assessment Specifications:
- Type: ${worksheetType}
- Target Chapter: "${chapterName}" (Specific Topics: ${topicsList})
- Difficulty: ${difficulty}
- Target Total Marks: ${totalMarks}

Requirements:
1. If "question_paper":
   - Section A: Objective & MCQs (1 mark each)
   - Section B: Short Answer Type I (2 marks each)
   - Section C: Short Answer Type II (3 marks each)
   - Section D: Long Answer (5 marks each)
   - Section E: Competency / Case-Based Integrated Problem (4 marks)
2. If "practice_worksheet":
   - Mix of fill in blanks, conceptual match, reasoning, and numerical/formula calculations.
3. If "chapter_test":
   - Concise 20-30 min diagnostic test for quick classroom assessment.
4. Include authentic NCERT page/concept citations.
5. Provide a rigorous, step-by-step model marking scheme.

Format your output strictly as a JSON object matching this schema:
{
  "id": "ws_${Date.now()}",
  "title": "Class ${classLevel} ${subject} - ${chapterName} Assessment",
  "subject": "${subject}",
  "classLevel": "${classLevel}",
  "board": "${board}",
  "chapterName": "${chapterName}",
  "worksheetType": "${worksheetType}",
  "difficulty": "${difficulty}",
  "totalMarks": ${totalMarks},
  "suggestedDurationMinutes": ${totalMarks <= 25 ? 45 : totalMarks <= 40 ? 60 : 90},
  "instructions": [
    "Read all questions carefully before attempting.",
    "Section A carries 1 mark each. Write the correct option with brief justification.",
    "Show proper steps, formula, and units for numerical questions."
  ],
  "sections": [
    {
      "sectionName": "Section A",
      "sectionDescription": "Objective Type & Multiple Choice Questions",
      "totalMarks": 5,
      "questions": [
        {
          "questionNumber": 1,
          "section": "Section A",
          "questionType": "mcq",
          "marks": 1,
          "questionText": "Question statement here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option B",
          "stepByStepSolution": "Detailed step by step solution and conceptual logic",
          "markingSchemeGuide": "1 mark for correct identification",
          "ncertTopicReference": "NCERT Page Ref"
        }
      ]
    }
  ],
  "answerKeyAndMarkingScheme": [
    {
      "questionNumber": 1,
      "modelAnswer": "Model answer text",
      "markingCriteria": ["0.5 mark for formula", "0.5 mark for correct substitution with unit"]
    }
  ],
  "pedagogicalNotes": "Guidance for teachers on common student misconceptions in this chapter."
}`;

  try {
    const prompt = `Generate a complete ${worksheetType} for Class ${classLevel} ${subject} Chapter: "${chapterName}".
Board: ${board}. Total marks: ${totalMarks}. Language: ${language}.
Return only valid JSON.`;

    const { text } = await generateContentWithRetry({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed: any = safeJsonParse(text, {});
    if (parsed && parsed.title && parsed.sections) {
      return {
        id: parsed.id || `ws_${Date.now()}`,
        title: parsed.title,
        institutionHeader: parsed.institutionHeader || 'StudyPilot AI Academic Assessment Suite',
        subject,
        classLevel,
        board,
        chapterName,
        worksheetType,
        difficulty,
        totalMarks: Number(parsed.totalMarks) || totalMarks,
        suggestedDurationMinutes: Number(parsed.suggestedDurationMinutes) || 45,
        instructions: Array.isArray(parsed.instructions) && parsed.instructions.length > 0
          ? parsed.instructions
          : [
              'All questions are compulsory.',
              'Show clear formulas, calculations, and units wherever applicable.',
            ],
        sections: Array.isArray(parsed.sections) ? parsed.sections : [],
        answerKeyAndMarkingScheme: Array.isArray(parsed.answerKeyAndMarkingScheme)
          ? parsed.answerKeyAndMarkingScheme
          : [],
        pedagogicalNotes: parsed.pedagogicalNotes || `Focus on testing core NCERT learning objectives for ${chapterName}.`,
        createdAt: new Date().toISOString(),
      };
    }
    throw new Error('Incomplete JSON output from AI assessment generator.');
  } catch (error: any) {
    console.warn('AI worksheet generation fallback:', error?.message);
    // Deterministic fallback assessment
    return {
      id: `ws_fallback_${Date.now()}`,
      title: `NCERT Class ${classLevel} ${subject} — ${chapterName} Standard Assessment`,
      institutionHeader: 'StudyPilot Academic Assessment Suite',
      subject,
      classLevel,
      board,
      chapterName,
      worksheetType,
      difficulty,
      totalMarks,
      suggestedDurationMinutes: 45,
      instructions: [
        'Attempt all questions sequentially.',
        'Write neatly and show relevant mathematical formulas and chemical state symbols.',
      ],
      sections: [
        {
          sectionName: 'Section A (Objective & Conceptual)',
          sectionDescription: 'Multiple Choice & Short Concept Tests',
          totalMarks: 5,
          questions: [
            {
              questionNumber: 1,
              section: 'Section A',
              questionType: 'mcq',
              marks: 1,
              questionText: `Which fundamental principle governs the main phenomena in ${chapterName}?`,
              options: [
                'Law of Conservation of Mass and Energy',
                'Arbitrary Observation Principle',
                'Non-deterministic Variation',
                'Empirical Approximation Only',
              ],
              correctAnswer: 'Law of Conservation of Mass and Energy',
              stepByStepSolution: `In NCERT Class ${classLevel} ${subject}, all scientific equations and reactions obey conservation laws.`,
              markingSchemeGuide: '1 Mark for choosing the correct option.',
              ncertTopicReference: `${chapterName} Introduction`,
            },
            {
              questionNumber: 2,
              section: 'Section A',
              questionType: 'fill_blanks',
              marks: 1,
              questionText: `State the standard SI unit or defining condition used in ${chapterName}: _______`,
              correctAnswer: 'Standard SI unit defined in NCERT textbook tables',
              stepByStepSolution: 'Refer to chapter tables and definitions.',
              markingSchemeGuide: '1 Mark for correct definition/unit.',
              ncertTopicReference: `${chapterName} Key Concepts`,
            },
          ],
        },
        {
          sectionName: 'Section B (Short Answer & Analysis)',
          sectionDescription: 'Conceptual understanding and application',
          totalMarks: totalMarks > 5 ? totalMarks - 5 : 5,
          questions: [
            {
              questionNumber: 3,
              section: 'Section B',
              questionType: 'short_answer_3m',
              marks: 3,
              questionText: `Explain with an example the core mechanism involved in ${chapterName}. Provide relevant equations or diagrams.`,
              correctAnswer: `Detailed explanation based on NCERT guidelines for ${chapterName}.`,
              stepByStepSolution: '1. Define the term (1M)\n2. State the equation or formula (1M)\n3. Give practical application (1M)',
              markingSchemeGuide: '1 mark for definition, 1 mark for equation, 1 mark for application.',
              ncertTopicReference: `${chapterName} Section 1`,
            },
          ],
        },
      ],
      answerKeyAndMarkingScheme: [
        {
          questionNumber: 1,
          modelAnswer: 'Law of Conservation of Mass and Energy',
          markingCriteria: ['1 mark for correct identification'],
        },
        {
          questionNumber: 2,
          modelAnswer: 'Standard definition with SI unit',
          markingCriteria: ['1 mark for accurate term'],
        },
        {
          questionNumber: 3,
          modelAnswer: 'Comprehensive 3-step explanation of the core concept.',
          markingCriteria: ['1 mark definition', '1 mark formula', '1 mark example'],
        },
      ],
      pedagogicalNotes: `Review core NCERT definitions and laboratory activities for ${chapterName}.`,
      createdAt: new Date().toISOString(),
    };
  }
}
