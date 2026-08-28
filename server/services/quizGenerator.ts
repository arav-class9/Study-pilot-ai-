import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface GenerateQuizInput {
  subject: string;
  classLevel: string;
  chapter?: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'challenge';
  count: number;
  weakConcepts?: string[];
}

function normalizeQuizQuestions(rawQuestions: any[], input: GenerateQuizInput) {
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    return getFallbackQuestions(input);
  }

  return rawQuestions.map((q: any, idx: number) => {
    const options = Array.isArray(q.options) && q.options.length >= 2
      ? q.options.map((opt: any) => String(opt || '').trim())
      : ['Option A', 'Option B', 'Option C', 'Option D'];

    let correctIndex = typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : -1;
    if (correctIndex < 0 || correctIndex >= options.length) {
      if (q.correctAnswer) {
        const foundIdx = options.findIndex(
          (opt: string) => opt.toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
        );
        correctIndex = foundIdx !== -1 ? foundIdx : 0;
      } else {
        correctIndex = 0;
      }
    }

    return {
      id: q.id || `q-gen-${Date.now()}-${idx}`,
      subject: q.subject || input.subject || 'Science',
      chapter: q.chapter || input.chapter || 'General',
      topic: q.topic || q.concept || input.topic || input.chapter || 'Concept Drill',
      question: q.question || 'Standard Question',
      options,
      correctAnswerIndex: correctIndex,
      correctAnswer: q.correctAnswer || options[correctIndex] || options[0],
      explanation: q.explanation || 'Refer to standard NCERT curriculum concepts.',
      difficulty: q.difficulty || input.difficulty || 'medium',
      questionType: q.questionType || 'multiple_choice',
      formulaUsed: q.formulaUsed || undefined,
      concept: q.concept || q.topic || 'Core Concept',
      hint: q.hint || undefined,
      commonTrap: q.commonTrap || undefined,
      source: {
        sourceType: 'curriculum',
        sourceTitle: `NCERT Class ${input.classLevel} • ${input.chapter || input.subject}`,
      },
    };
  });
}

function getFallbackQuestions(input: GenerateQuizInput) {
  const isMath = input.subject.toLowerCase().includes('math');
  
  if (isMath) {
    return [
      {
        id: 'q-math-fb-1',
        subject: input.subject,
        chapter: input.chapter || 'Quadratic Equations',
        topic: 'Discriminant and Nature of Roots',
        question: 'What is the nature of roots for the quadratic equation 2x² - 4x + 3 = 0?',
        options: ['Two distinct real roots', 'Two equal real roots', 'No real roots', 'One real and one imaginary'],
        correctAnswerIndex: 2,
        correctAnswer: 'No real roots',
        explanation: 'Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Since D < 0, the equation has no real roots.',
        difficulty: input.difficulty,
        questionType: 'multiple_choice',
        concept: 'Nature of Roots & Discriminant',
        hint: 'Calculate D = b² - 4ac and check whether D > 0, D = 0, or D < 0.',
        commonTrap: 'Forgetting that a negative discriminant means imaginary/no real roots.',
      },
      {
        id: 'q-math-fb-2',
        subject: input.subject,
        chapter: input.chapter || 'Arithmetic Progressions',
        topic: 'nth Term of an AP',
        question: 'Find the 10th term of the AP: 2, 7, 12, 17, ...',
        options: ['47', '52', '45', '50'],
        correctAnswerIndex: 0,
        correctAnswer: '47',
        explanation: 'First term a = 2, common difference d = 7 - 2 = 5. The nth term formula is an = a + (n - 1)d. For n = 10, a₁₀ = 2 + (10 - 1) × 5 = 2 + 45 = 47.',
        difficulty: input.difficulty,
        questionType: 'multiple_choice',
        concept: 'nth Term of an Arithmetic Progression',
        hint: 'Use the formula a_n = a + (n - 1)d.',
        commonTrap: 'Using (n + 1) instead of (n - 1).',
      },
      {
        id: 'q-math-fb-3',
        subject: input.subject,
        chapter: input.chapter || 'Trigonometry',
        topic: 'Trigonometric Identities',
        question: 'If sin θ + cos θ = √2 cos θ, what is the value of cos θ - sin θ?',
        options: ['√2 sin θ', '√2 cos θ', 'sin θ', '1'],
        correctAnswerIndex: 0,
        correctAnswer: '√2 sin θ',
        explanation: 'Squaring both sides of sin θ + cos θ = √2 cos θ gives 1 + 2 sin θ cos θ = 2 cos² θ. Rearranging gives (cos θ - sin θ)² = 2 sin² θ, hence cos θ - sin θ = √2 sin θ.',
        difficulty: input.difficulty,
        questionType: 'multiple_choice',
        concept: 'Trigonometric Identities & Algebraic Proofs',
        hint: 'Square both sides and use sin² θ + cos² θ = 1.',
        commonTrap: 'Directly subtracting without squaring or factoring.',
      },
    ];
  }

  return [
    {
      id: 'q-sci-fb-1',
      subject: input.subject,
      chapter: input.chapter || 'Work and Energy',
      topic: 'Work-Energy Theorem',
      question: 'An object of mass 2 kg is accelerated from rest to a velocity of 10 m/s in 5 seconds. What is the work done on the object?',
      options: ['50 J', '100 J', '200 J', '20 J'],
      correctAnswerIndex: 1,
      correctAnswer: '100 J',
      explanation: 'By the Work-Energy Theorem, Work Done = Change in Kinetic Energy = (1/2)m(v² - u²) = (1/2) × 2 × (10² - 0²) = 100 Joules.',
      difficulty: input.difficulty,
      questionType: 'multiple_choice',
      concept: 'Work-Energy Theorem & Kinetic Energy',
      hint: 'Remember that Work Done equals the change in Kinetic Energy (ΔKE).',
      commonTrap: 'Confusing Power (W/t = 20 W) with Work done (100 J).',
    },
    {
      id: 'q-sci-fb-2',
      subject: input.subject,
      chapter: input.chapter || 'Work and Energy',
      topic: 'Conservation of Mechanical Energy',
      question: 'When a body falls freely towards the Earth, what happens to its total mechanical energy (neglecting air resistance)?',
      options: ['Increases continuously', 'Decreases continuously', 'Remains constant', 'First increases then decreases'],
      correctAnswerIndex: 2,
      correctAnswer: 'Remains constant',
      explanation: 'Under the Law of Conservation of Mechanical Energy, as the body falls, its Potential Energy decreases by the exact amount its Kinetic Energy increases, keeping total mechanical energy (KE + PE) constant.',
      difficulty: input.difficulty,
      questionType: 'multiple_choice',
      concept: 'Conservation of Mechanical Energy',
      hint: 'Total mechanical energy equals PE + KE at any instant.',
      commonTrap: 'Thinking that because velocity increases, total energy increases.',
    },
    {
      id: 'q-sci-fb-3',
      subject: input.subject,
      chapter: input.chapter || 'Electricity',
      topic: 'Commercial Unit of Energy',
      question: 'What is the commercial unit of electrical energy, and what is its value in Joules?',
      options: ['Watt-hour (3600 J)', 'Kilowatt-hour (3.6 × 10⁶ J)', 'Joule-second (3.6 × 10³ J)', 'Volt-Ampere (360 J)'],
      correctAnswerIndex: 1,
      correctAnswer: 'Kilowatt-hour (3.6 × 10⁶ J)',
      explanation: '1 Kilowatt-hour (kWh) = 1000 W × 3600 s = 3,600,000 Joules = 3.6 × 10⁶ J. This is commonly termed "1 unit" of electricity.',
      difficulty: input.difficulty,
      questionType: 'multiple_choice',
      concept: 'Commercial Unit of Energy & Power',
      hint: '1 kW = 1000 W, and 1 hour = 3600 seconds.',
      commonTrap: 'Multiplying 1000 by 60 instead of 3600 seconds.',
    },
  ];
}

export async function generateQuiz(input: GenerateQuizInput) {
  const systemInstruction = `
You are the Quiz Engine for StudyPilot AI.
Generate challenging, high-yield academic multiple-choice questions aligned with NCERT / CBSE curriculum for Class ${input.classLevel}.
Requirements:
1. Each question must have exactly 4 plausible options (A, B, C, D) without obvious non-options.
2. Provide a clear, educational explanation for why the correct answer is right and why common misconceptions lead to the wrong options.
3. If weak concepts are specified, prioritize questions testing those specific conceptual pitfalls.
4. Difficulty levels:
   - Easy: Direct definitions, basic recall, single-step formula calculation.
   - Medium: Conceptual application, standard numericals, 2-step reasoning.
   - Hard: Multi-concept integration, tricky distractors, non-trivial numerical calculations.
   - Challenge: Advanced analytical thinking, competitive exam foundation (JEE/NEET/Olympiad primer).
5. Output valid JSON adhering strictly to the schema.
`;

  const promptText = `
Generate a ${input.difficulty.toUpperCase()} difficulty quiz with ${input.count || 5} questions.
Subject: ${input.subject}
Class Level: Class ${input.classLevel}
Chapter / Unit: ${input.chapter || 'All Chapters'}
Specific Topic: ${input.topic || 'General Overview'}
${input.weakConcepts && input.weakConcepts.length > 0 ? `Focus on student weak areas: ${input.weakConcepts.join(', ')}` : ''}
`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.6-flash',
      fallbackModel: 'gemini-3.6-flash',
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
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Array of 4 options',
                  },
                  correctAnswer: { type: Type.STRING, description: 'Exact string matching one of the options' },
                  explanation: { type: Type.STRING, description: 'Clear pedagogical rationale' },
                  concept: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  commonTrap: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctAnswer', 'explanation', 'concept', 'difficulty'],
              },
            },
          },
          required: ['title', 'subject', 'difficulty', 'questions'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    const normalizedQuestions = normalizeQuizQuestions(parsed.questions, input);

    return {
      title: parsed.title || `${input.subject} — ${input.chapter || 'Adaptive Practice'}`,
      subject: parsed.subject || input.subject,
      chapter: parsed.chapter || input.chapter || 'General',
      difficulty: parsed.difficulty || input.difficulty,
      questions: normalizedQuestions,
    };
  } catch (error: any) {
    console.error('Error generating quiz (using fallback):', error);
    const fallbackQuestions = getFallbackQuestions(input);
    return {
      title: `${input.subject} — ${input.chapter || 'Adaptive Practice'}`,
      subject: input.subject,
      chapter: input.chapter || 'General',
      difficulty: input.difficulty,
      questions: fallbackQuestions,
    };
  }
}

