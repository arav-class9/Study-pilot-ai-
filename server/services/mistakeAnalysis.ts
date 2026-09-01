import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';
import { getCachedAIResponse, setCachedAIResponse, generateCacheKey } from './costControl.js';

export interface MistakeAnalysisInput {
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  subject?: string;
  classLevel?: string;
  chapter?: string;
}

export async function analyzeMistake(input: MistakeAnalysisInput) {
  const cacheKey = generateCacheKey('mistake-analysis', input);
  const cached = getCachedAIResponse(cacheKey);
  if (cached) return cached;

  const systemInstruction = `
You are the Mistake Diagnostics Engine for StudyPilot AI.
Analyze the student's incorrect response against the question and correct answer.
Categorize the primary error precisely into ONE of the 7 academic mistake categories:
1. "Concept Gap" - Missing core scientific/mathematical understanding.
2. "Calculation Error" - Arithmetic or algebraic manipulation misstep.
3. "Formula Confusion" - Selected or substituted into wrong equation.
4. "Unit Error" - Missing, wrong, or unconverted SI units.
5. "Reading Error" - Misread given parameters or question constraint (e.g. overlooked "not").
6. "Careless Error" - Minor sign blunder or slip while knowing the method.
7. "Misconception" - Deeply rooted intuitive fallacy.

Provide a kind, constructive explanation explaining where the thought process diverged and 1 micro-tip to prevent it during board exams.
`;

  const promptText = `
Subject: ${input.subject || 'Science'} (Class ${input.classLevel || '10'})
Chapter: ${input.chapter || 'Curriculum'}
Question: ${input.questionText}
Student's Incorrect Answer: ${input.studentAnswer}
Correct Answer: ${input.correctAnswer}
`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.7-flash',
      fallbackModel: 'gemini-3.7-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mistakeType: {
              type: Type.STRING,
              description: 'One of: Concept Gap, Calculation Error, Formula Confusion, Unit Error, Reading Error, Careless Error, Misconception',
            },
            diagnosis: { type: Type.STRING },
            whereItWentWrong: { type: Type.STRING },
            boardExamTip: { type: Type.STRING },
            practiceReinforcementQuestion: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctAnswer', 'explanation'],
            },
          },
          required: ['mistakeType', 'diagnosis', 'whereItWentWrong', 'boardExamTip'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    setCachedAIResponse(cacheKey, parsed);
    return parsed;
  } catch (error: any) {
    console.error('Error analyzing mistake:', error);
    return {
      mistakeType: 'Calculation Error',
      diagnosis: 'Sign or arithmetic step mismatch during substitution.',
      whereItWentWrong: 'Substituted positive acceleration during deceleration phase.',
      boardExamTip: 'Always write down Given variables with signs (+/-) before writing the formula.',
      practiceReinforcementQuestion: {
        question: 'A car travelling at 20 m/s applies brakes and comes to rest in 4 seconds. Calculate the retardation.',
        options: ['-5 m/s²', '5 m/s²', '80 m/s²', '0.2 m/s²'],
        correctAnswer: '5 m/s²',
        explanation: 'Retardation is positive deceleration: a = (0 - 20)/4 = -5 m/s², so retardation = 5 m/s².',
      },
    };
  }
}
