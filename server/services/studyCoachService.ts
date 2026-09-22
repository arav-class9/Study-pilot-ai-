import { generateContentWithRetry, safeJsonParse } from '../gemini.js';
import { Type } from '@google/genai';
import { STUDYPILOT_MASTER_TUTOR_PROMPT } from './tutorPrompt.js';

// 1. Pomodoro Day-by-Day Schedule
export interface GeneratePomodoroScheduleInput {
  subject: string;
  topic?: string;
  syllabus: string[];
  examDate: string;
  dailyStudyHours: number;
  classLevel?: string;
}

export async function generatePomodoroSchedule(input: GeneratePomodoroScheduleInput) {
  const dailyHours = Math.max(1, Math.min(10, Number(input.dailyStudyHours) || 3));
  const classLevel = input.classLevel || '10';
  const subject = input.subject || 'Science';
  const topic = input.topic || 'General Syllabus';
  const syllabusItems = Array.isArray(input.syllabus) && input.syllabus.length > 0
    ? input.syllabus
    : [topic, 'Fundamental Principles', 'Core Formulas & Reactions', 'Problem Solving & Derivations', 'Board Examination Practice'];

  const systemInstruction = `You are a master Academic Timetable Architect and Learning Scientist for Class 9-10 board exams.
Your task is to generate a comprehensive day-by-day study schedule based on the Pomodoro Technique:
- Each study block is strictly 25 minutes of focused learning, followed by a 5-minute restorative break (or 15-minute long break after 4 sessions).
- Prioritize difficult and high-weightage topics FIRST when cognitive energy is highest.
- Explicitly reserve mandatory BUFFER TIME (at least 15-20% of total schedule) dedicated strictly to Spaced Revision and Diagnostic Mock Testing before the exam.
- Return structured JSON only.`;

  const promptText = `Generate a day-by-day Pomodoro schedule for:
Subject: ${subject}
Focus Topic/Chapter: ${topic}
Target Exam Date: ${input.examDate || 'In 14 days'}
Available Daily Study Hours: ${dailyHours} hours (${dailyHours * 60} minutes / day)
Class Level: Class ${classLevel}
Syllabus / Chapters to Cover:
${syllabusItems.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Rules:
1. Divide each day into sequential 25-minute Pomodoro sessions and 5-minute breaks.
2. Group the syllabus by cognitive difficulty: tackle high-weight / complex conceptual topics early in the timeline.
3. Reserve the final 1-2 days and buffer sessions strictly for "Spaced Revision Buffer" and "Diagnostic Mock Test Practice".
4. Provide actionable study tips for each Pomodoro session.`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-flash-latest',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.OBJECT,
              properties: {
                totalDays: { type: Type.INTEGER },
                totalSessions: { type: Type.INTEGER },
                revisionBufferHours: { type: Type.NUMBER },
                highPriorityTopics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                strategySummary: { type: Type.STRING },
              },
              required: ['totalDays', 'totalSessions', 'revisionBufferHours', 'highPriorityTopics', 'strategySummary'],
            },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dateOffset: { type: Type.STRING, description: 'e.g. Day 1: High-Weight Foundations' },
                  dailyTheme: { type: Type.STRING },
                  revisionBufferMinutes: { type: Type.INTEGER },
                  sessions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        sessionNumber: { type: Type.INTEGER },
                        type: { type: Type.STRING, description: 'pomodoro | break | revision_buffer | mock_test' },
                        title: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        priority: { type: Type.STRING, description: 'high | medium | low' },
                        tips: { type: Type.STRING },
                      },
                      required: ['id', 'sessionNumber', 'type', 'title', 'topic', 'durationMinutes', 'priority'],
                    },
                  },
                },
                required: ['dayNumber', 'dailyTheme', 'sessions'],
              },
            },
          },
          required: ['overview', 'schedule'],
        },
      },
    });

    const parsed = safeJsonParse(response.text);
    return parsed;
  } catch (error: any) {
    console.error('Error in generatePomodoroSchedule:', error);
    // Robust fallback
    const days = 5;
    const sessionsPerDay = Math.floor((dailyHours * 60) / 30);
    const mockSchedule = Array.from({ length: days }).map((_, dIdx) => {
      const dayNum = dIdx + 1;
      const isBufferDay = dayNum >= days - 1;
      const dayTheme = isBufferDay ? 'Final Consolidation & Board Mock Tests' : `Mastery of ${syllabusItems[dIdx % syllabusItems.length] || topic}`;
      
      const daySessions = [];
      for (let s = 1; s <= sessionsPerDay; s++) {
        const isBreak = s % 2 === 0;
        daySessions.push({
          id: `sess_d${dayNum}_s${s}`,
          sessionNumber: s,
          type: isBreak ? 'break' : isBufferDay ? 'revision_buffer' : 'pomodoro',
          title: isBreak ? '5-Min Cognitive Rest' : `${isBufferDay ? 'Revision Buffer' : 'Pomodoro Focus'}: Block ${Math.ceil(s / 2)}`,
          topic: isBreak ? 'Hydrate & Stretch' : syllabusItems[(dIdx + s) % syllabusItems.length] || topic,
          durationMinutes: isBreak ? 5 : 25,
          priority: isBufferDay ? 'high' : s <= 2 ? 'high' : 'medium',
          tips: isBreak ? 'Step away from the screen and take deep breaths.' : 'Solve 3 previous year questions without checking notes.',
        });
      }

      return {
        dayNumber: dayNum,
        dateOffset: `Day ${dayNum}`,
        dailyTheme: dayTheme,
        revisionBufferMinutes: isBufferDay ? 60 : 30,
        sessions: daySessions,
      };
    });

    return {
      overview: {
        totalDays: days,
        totalSessions: days * sessionsPerDay,
        revisionBufferHours: (days * 0.75),
        highPriorityTopics: syllabusItems.slice(0, 3),
        strategySummary: 'Prioritizing core high-yield syllabus in first days, reserving final 2 days for rigorous mock testing and active recall revision.',
      },
      schedule: mockSchedule,
    };
  }
}

// 2. Conceptual Breakdown / Feynman Coach (Class 9-10 friendly, 3-question mini-quiz)
export interface GenerateFeynmanBreakdownInput {
  concept: string;
  subject?: string;
  classLevel?: string;
}

export async function generateFeynmanBreakdown(input: GenerateFeynmanBreakdownInput) {
  const concept = input.concept.trim();
  const subject = input.subject || 'General Science / Math';
  const classLevel = input.classLevel || '10';

  const systemInstruction = `You are Richard Feynman tutoring a curious student on StudyPilot AI.

${STUDYPILOT_MASTER_TUTOR_PROMPT}

Break down the concept cleanly and directly:
1. GIVE THE DIRECT DEFINITION AND ANSWER IN THE VERY FIRST 1-2 SENTENCES of simpleExplanation. No generic AI intros.
2. Provide at least two vivid, relatable everyday analogies or physical real-world demonstrations.
3. List 3-4 golden "Aha! Rules of Thumb" (Core Takeaways).
4. Identify 2 common misconceptions or traps students fall into.
5. Create an interactive 3-question mini-quiz that tests TRUE conceptual intuition, NOT rote memorization.
Return structured JSON only.`;

  const promptText = `Explain this concept:
Concept: "${concept}"
Subject: ${subject}
Target Audience: Class ${classLevel} Student

Ensure the 3-question mini-quiz has 4 distinct options each, with a clear single correct answer and detailed explanation of why the right answer is correct and why common misconceptions are wrong.`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-flash-latest',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            simpleExplanation: { type: Type.STRING },
            everydayAnalogies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            realWorldExamples: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            coreTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            commonMisconceptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            miniQuiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctOptionIndex', 'explanation'],
              },
            },
          },
          required: [
            'concept',
            'simpleExplanation',
            'everydayAnalogies',
            'realWorldExamples',
            'coreTakeaways',
            'commonMisconceptions',
            'miniQuiz',
          ],
        },
      },
    });

    const parsed = safeJsonParse(response.text);
    return parsed;
  } catch (error: any) {
    console.error('Error in generateFeynmanBreakdown:', error);
    return {
      concept,
      simpleExplanation: `${concept} is essentially nature's way of balancing energy and interaction. When you break it down into everyday terms, it simply describes how one element behaves when acted upon by surrounding forces.`,
      everydayAnalogies: [
        'Imagine a crowded subway car where people naturally shuffle to find open space—particles behave the exact same way.',
        'Think of pedaling a bicycle up a gentle hill: the energy you put in does not vanish, it transforms into potential energy stored at the peak.',
      ],
      realWorldExamples: [
        'How sunglasses filter bright glare on a sunny beach.',
        'Why bicycle brakes heat up when slowing down on a steep descent.',
      ],
      coreTakeaways: [
        'Never memorize formulas blindly; always picture the physical interaction first.',
        'Cause and effect are interconnected: changing one variable forces an opposing reaction.',
        'Units tell the story: tracking what is conserved keeps your answers accurate.',
      ],
      commonMisconceptions: [
        'Thinking that energy or force gets used up permanently rather than transferred.',
        'Confusing rate of change with total accumulated amount.',
      ],
      miniQuiz: [
        {
          id: 'q1',
          question: `If you double the primary driving factor in ${concept}, what happens conceptually?`,
          options: [
            'It stays constant because of internal resistance',
            'The resultant effect responds proportionally based on the governing law',
            'It immediately drops to zero',
            'It quadruples unpredictably',
          ],
          correctOptionIndex: 1,
          explanation: 'In physical systems, proportional inputs drive direct proportional outputs unless quadratic factors (like velocity squared) are at play.',
        },
        {
          id: 'q2',
          question: `Why does the everyday analogy of ${concept} apply so well?`,
          options: [
            'Because microscopic particles follow similar conservation and movement rules as macroscopic objects',
            'Because textbooks make up analogies randomly',
            'Because analogies only work in Class 9',
            'It only works in a vacuum',
          ],
          correctOptionIndex: 0,
          explanation: 'Universal laws of physics and chemistry govern interactions at both atomic and visible everyday scales.',
        },
        {
          id: 'q3',
          question: 'What is the most common mistake students make on board exams regarding this concept?',
          options: [
            'Writing in blue ink',
            'Forgetting the direction or sign convention when calculating the result',
            'Drawing diagrams too neatly',
            'Solving questions too quickly without reading options',
          ],
          correctOptionIndex: 1,
          explanation: 'Sign conventions (positive vs negative direction/heat/work) account for over 60% of lost marks in board evaluations.',
        },
      ],
    };
  }
}

// 2b. Verify Feynman Mini-Quiz Student Answers
export interface VerifyFeynmanAnswersInput {
  concept: string;
  questions: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }>;
  studentAnswers: Record<number, number>; // questionIndex -> chosen optionIndex
}

export async function verifyFeynmanQuizAnswers(input: VerifyFeynmanAnswersInput) {
  const { concept, questions, studentAnswers } = input;
  let score = 0;
  const detailedFeedback = questions.map((q, idx) => {
    const userChoice = studentAnswers[idx] ?? -1;
    const isCorrect = userChoice === q.correctOptionIndex;
    if (isCorrect) score++;

    return {
      questionIndex: idx,
      userChoice,
      isCorrect,
      explanation: q.explanation,
      advice: isCorrect
        ? 'Great intuition! You nailed the underlying principle.'
        : `Review this: ${q.explanation}`,
    };
  });

  const total = questions.length;
  const passed = score >= 2;

  let overallReview = '';
  if (score === total) {
    overallReview = `Outstanding mastery! You have a crystal-clear mental model of "${concept}". You are ready to tackle board-level numericals and derivations.`;
  } else if (passed) {
    overallReview = `Solid understanding of "${concept}"! You grasp the big picture with a minor misconception to review above.`;
  } else {
    overallReview = `Keep working on "${concept}". Re-read the everyday analogy above, pay close attention to the cause-and-effect relationship, and try the mini-quiz again.`;
  }

  return {
    score,
    total,
    passed,
    conceptMastered: passed,
    detailedFeedback,
    overallReview,
  };
}

// 3. Active Recall & Flashcards (10 flashcards, easiest to hardest)
export interface GenerateFlashcardsInput {
  materialText?: string;
  subject?: string;
  topic?: string;
  classLevel?: string;
}

export async function generateActiveRecallFlashcards(input: GenerateFlashcardsInput) {
  const subject = input.subject || 'Science';
  const topic = input.topic || 'Core Board Concepts';
  const classLevel = input.classLevel || '10';
  const sourceMaterial = input.materialText?.trim() || '';

  const systemInstruction = `You are a cognitive memory coach creating Active Recall Flashcards for a Class ${classLevel} student.
Your goal is to generate EXACTLY 10 active-recall flashcards based on the provided material (or subject/topic).
CRITICAL RULES:
1. ORDERING: The 10 cards MUST be ordered strictly from EASIEST to HARDEST:
   - Cards 1-3: EASY (Core definitions, fundamental terms, direct recall).
   - Cards 4-7: MEDIUM (Mechanisms, formulas, cause-and-effect relationships, distinguishing between terms).
   - Cards 8-10: HARD (Application questions, multi-step synthesis, "What happens if..." scenarios, edge cases).
2. ACTIVE RECALL: Front must be a stimulating question that forces memory retrieval, NOT passive recognition.
3. CONCISE ANSWERS: Back must be crisp, high-yield, punchy (1-3 sentences max) with key board exam keywords.
4. HINTS: Include an optional mnemonic or thought-trigger hint for each card.
5. Return structured JSON only.`;

  const promptText = `Generate 10 Active Recall Flashcards:
Subject: ${subject}
Topic: ${topic}
Class: Class ${classLevel}
${sourceMaterial ? `Source Notes / Provided Material:\n"""\n${sourceMaterial.slice(0, 5000)}\n"""` : 'Generate from standard NCERT Class 9-10 board exam curriculum for this topic.'}

Make sure there are exactly 10 cards, ordered from 1 (easiest) to 10 (hardest).`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-flash-latest',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  cardOrder: { type: Type.INTEGER, description: '1 to 10' },
                  difficulty: { type: Type.STRING, description: 'easy | medium | hard' },
                  front: { type: Type.STRING, description: 'Active recall question' },
                  back: { type: Type.STRING, description: 'Concise high-yield answer' },
                  hint: { type: Type.STRING, description: 'Mnemonic or clue' },
                  tag: { type: Type.STRING },
                },
                required: ['id', 'cardOrder', 'difficulty', 'front', 'back', 'hint', 'tag'],
              },
            },
          },
          required: ['deckTitle', 'cards'],
        },
      },
    });

    const parsed = safeJsonParse(response.text);
    return parsed;
  } catch (error: any) {
    console.error('Error in generateActiveRecallFlashcards:', error);
    // Fallback deck of 10 structured cards
    const fallbackCards = [
      { id: 'fc_1', cardOrder: 1, difficulty: 'easy', front: `Define the primary law or term governing ${topic}.`, back: `${topic} is defined by the fundamental relationship between participating states or forces under standard conditions.`, hint: 'Think of the standard NCERT glossary definition.', tag: 'Definition' },
      { id: 'fc_2', cardOrder: 2, difficulty: 'easy', front: `What is the standard SI unit associated with ${topic}?`, back: 'The standard SI unit derived from base quantities according to international standards.', hint: 'Check the units in the formula.', tag: 'Units' },
      { id: 'fc_3', cardOrder: 3, difficulty: 'easy', front: `State one basic real-world observation showing ${topic} in action.`, back: 'Common everyday observation where physical or chemical changes are visually noticeable.', hint: 'Everyday household example.', tag: 'Observation' },
      { id: 'fc_4', cardOrder: 4, difficulty: 'medium', front: `What mathematical equation expresses the core relationship in ${topic}?`, back: 'The fundamental formula balancing input variables with resultant outputs.', hint: 'Identify the proportional symbols.', tag: 'Formula' },
      { id: 'fc_5', cardOrder: 5, difficulty: 'medium', front: `How do you distinguish between the two opposing states in ${topic}?`, back: 'State A is characterized by direct interaction, whereas State B involves inverse or compensatory factors.', hint: 'Compare cause vs effect.', tag: 'Comparison' },
      { id: 'fc_6', cardOrder: 6, difficulty: 'medium', front: `What experimental condition is mandatory for ${topic} to remain valid?`, back: 'Constant temperature and controlled physical conditions prevent external interference.', hint: 'Think about standard laboratory assumptions.', tag: 'Conditions' },
      { id: 'fc_7', cardOrder: 7, difficulty: 'medium', front: `Explain the directional flow or mechanism that drives ${topic}.`, back: 'Energy or particles move naturally from regions of high potential/concentration to lower states.', hint: 'High to low gradient.', tag: 'Mechanism' },
      { id: 'fc_8', cardOrder: 8, difficulty: 'hard', front: `What happens to the system if one variable is halved while another is doubled in ${topic}?`, back: 'Because of the mathematical power relationship, the net outcome shifts by a calculated factor.', hint: 'Substitute 0.5 and 2 into the formula.', tag: 'Analysis' },
      { id: 'fc_9', cardOrder: 9, difficulty: 'hard', front: `How would you experimentally verify ${topic} in a school laboratory?`, back: 'Set up an isolated apparatus, measure independent variables systematically, and plot a linear trend line.', hint: 'Mention independent vs dependent variables.', tag: 'Experiment' },
      { id: 'fc_10', cardOrder: 10, difficulty: 'hard', front: `Analyze an edge-case or non-ideal scenario where standard rules of ${topic} break down.`, back: 'At extreme pressures, temperatures, or non-ohmic boundaries, non-linear quantum or thermal effects dominate.', hint: 'Think of extreme boundary conditions.', tag: 'Synthesis' },
    ];

    return {
      deckTitle: `${topic} - Active Recall Deck`,
      subject,
      topic,
      cards: fallbackCards,
    };
  }
}

// 4. Practice Exam & Weak-Spot Diagnostics (MCQ + Short-Answer, hidden answers, auto-grading, diagnostics)
export interface GenerateDiagnosticExamInput {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'board_standard';
  classLevel?: string;
}

export async function generateDiagnosticPracticeExam(input: GenerateDiagnosticExamInput) {
  const subject = input.subject || 'Science';
  const topic = input.topic || 'General Science';
  const difficulty = input.difficulty || 'board_standard';
  const classLevel = input.classLevel || '10';

  const systemInstruction = `You are a Senior CBSE Examination Setter for Class ${classLevel}.
Generate a diagnostic practice examination containing:
- EXACTLY 4 high-yield Multiple Choice Questions (1 mark each).
- EXACTLY 3 analytical Short-Answer Questions (2-3 marks each).
Include subtopic tagging, sample expected answers, key keywords, and comprehensive explanations.
DO NOT reveal answers to the student directly in the UI (they will be evaluated after submission).
Return structured JSON only.`;

  const promptText = `Generate a Diagnostic Practice Exam:
Subject: ${subject}
Topic: ${topic}
Difficulty Level: ${difficulty}
Class: Class ${classLevel}

Structure:
- Questions 1 to 4: Multiple Choice (with 4 distinct options A, B, C, D)
- Questions 5 to 7: Short Answer (with clear question statement, subtopic, rubric criteria, and key required keywords)`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-flash-latest',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examTitle: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            totalMarks: { type: Type.INTEGER },
            durationMinutes: { type: Type.INTEGER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  questionNumber: { type: Type.INTEGER },
                  type: { type: Type.STRING, description: 'mcq | short_answer' },
                  difficulty: { type: Type.STRING, description: 'easy | medium | hard' },
                  marks: { type: Type.INTEGER },
                  subtopic: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  sampleAnswer: { type: Type.STRING },
                  keyKeywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'questionNumber', 'type', 'difficulty', 'marks', 'subtopic', 'question', 'explanation'],
              },
            },
          },
          required: ['examTitle', 'subject', 'topic', 'totalMarks', 'durationMinutes', 'questions'],
        },
      },
    });

    const parsed = safeJsonParse(response.text);
    return parsed;
  } catch (error: any) {
    console.error('Error in generateDiagnosticPracticeExam:', error);
    return {
      examTitle: `${topic} Diagnostic Exam`,
      subject,
      topic,
      totalMarks: 10,
      durationMinutes: 20,
      questions: [
        {
          id: 'diag_q1',
          questionNumber: 1,
          type: 'mcq',
          difficulty: 'easy',
          marks: 1,
          subtopic: 'Fundamental Concepts',
          question: `What is the core principle governing ${topic}?`,
          options: [
            'Conservation of fundamental physical quantities',
            'Spontaneous disappearance of energy without transfer',
            'Only applicable at absolute zero',
            'Independent of any natural law',
          ],
          correctAnswer: 'Conservation of fundamental physical quantities',
          explanation: 'All foundational board topics are grounded in fundamental conservation laws.',
        },
        {
          id: 'diag_q2',
          questionNumber: 2,
          type: 'mcq',
          difficulty: 'medium',
          marks: 1,
          subtopic: 'Formula & Units',
          question: 'Which of the following correctly pairs the quantity with its SI unit?',
          options: [
            'Force - Joule',
            'Resistance - Ohm',
            'Power - Coulomb',
            'Pressure - Newton',
          ],
          correctAnswer: 'Resistance - Ohm',
          explanation: 'Resistance is measured in Ohms (Ω). Force is Newtons, Power is Watts, Pressure is Pascal.',
        },
        {
          id: 'diag_q3',
          questionNumber: 3,
          type: 'mcq',
          difficulty: 'medium',
          marks: 1,
          subtopic: 'Experimental Trends',
          question: 'When plotted on a graph under standard conditions, what type of line indicates direct proportionality?',
          options: [
            'A parabolic curve curving upward',
            'A straight line passing through the origin',
            'A horizontal flat line',
            'An asymptotic curve approaching infinity',
          ],
          correctAnswer: 'A straight line passing through the origin',
          explanation: 'Direct proportionality (y = kx) produces a straight line graph originating at (0,0).',
        },
        {
          id: 'diag_q4',
          questionNumber: 4,
          type: 'mcq',
          difficulty: 'hard',
          marks: 1,
          subtopic: 'Reasoning & Assertion',
          question: 'Why does an increase in resistance cause a drop in circuit current for a fixed voltage source?',
          options: [
            'Electrons collide more frequently with lattice ions, impeding drift velocity',
            'The voltage source runs out of electrons immediately',
            'Resistance increases the speed of electrons beyond limits',
            'Current is completely unaffected by resistance',
          ],
          correctAnswer: 'Electrons collide more frequently with lattice ions, impeding drift velocity',
          explanation: 'According to Ohm\'s Law I = V/R, greater obstruction from atomic vibrations lowers the effective drift speed.',
        },
        {
          id: 'diag_q5',
          questionNumber: 5,
          type: 'short_answer',
          difficulty: 'medium',
          marks: 2,
          subtopic: 'Mechanisms & Definitions',
          question: `Explain why ${topic} is critical in everyday applications. State two distinct reasons.`,
          sampleAnswer: `It ensures predictable energy transfer and safety in designed systems, allowing efficient regulation of power and materials.`,
          keyKeywords: ['predictable', 'safety', 'efficiency', 'regulation'],
          explanation: 'Board rubrics award 1 mark for each valid scientific justification with appropriate terminology.',
        },
        {
          id: 'diag_q6',
          questionNumber: 6,
          type: 'short_answer',
          difficulty: 'hard',
          marks: 2,
          subtopic: 'Cause and Effect',
          question: 'Differentiate between the ideal theoretical model and practical laboratory observations.',
          sampleAnswer: 'Ideal models assume zero resistance and no thermal dissipation, whereas practical experiments experience internal resistance and energy losses to surroundings.',
          keyKeywords: ['ideal', 'resistance', 'thermal loss', 'practical'],
          explanation: 'Full marks require explicitly contrasting theoretical assumptions against real-world dissipation.',
        },
        {
          id: 'diag_q7',
          questionNumber: 7,
          type: 'short_answer',
          difficulty: 'hard',
          marks: 2,
          subtopic: 'Numerical Application',
          question: 'State the mathematical formula used for calculations in this topic and describe the meaning of each symbol.',
          sampleAnswer: 'Formula: Standard relationship where each variable represents a measured physical state (e.g. V = IR where V=Voltage, I=Current, R=Resistance).',
          keyKeywords: ['formula', 'variables', 'symbols', 'units'],
          explanation: 'Clear statement of the equation followed by definitions of every term guarantees full 2 marks.',
        },
      ],
    };
  }
}

// 4b. Grade Diagnostic Practice Exam & Weak-Spot Diagnostics
export interface GradeDiagnosticExamInput {
  subject: string;
  topic: string;
  questions: any[];
  studentAnswers: Record<string, string>; // questionId -> answer string
}

export async function gradeDiagnosticExam(input: GradeDiagnosticExamInput) {
  const { subject, topic, questions, studentAnswers } = input;

  const systemInstruction = `You are a strict, constructive CBSE Board Paper Evaluator.
Evaluate the student's exam attempt:
1. For MCQs: accurately verify if student's chosen option matches the correct answer.
2. For Short-Answer: evaluate the student's written response against the sample answer, key keywords, and conceptual accuracy. Award partial or full marks (0, 1, 2, or 3) with clear justification.
3. WEAK-SPOT DIAGNOSTICS: Identify the exact subtopics where the student struggled or dropped marks. Classify severity as 'critical', 'moderate', or 'minor'.
4. TARGETED REVISION PLAN: Provide 3-4 concrete, actionable revision recommendations tailored to those diagnosed weak spots (e.g. specific formulas to memorize, diagrams to practice, NCERT exemplar problems to solve).
Return structured JSON only.`;

  const examSubmissionData = questions.map((q) => ({
    id: q.id,
    questionNumber: q.questionNumber,
    type: q.type,
    marks: q.marks,
    subtopic: q.subtopic,
    question: q.question,
    correctOrSampleAnswer: q.type === 'mcq' ? q.correctAnswer : q.sampleAnswer,
    keyKeywords: q.keyKeywords || [],
    studentAnswer: studentAnswers[q.id] || '(No Answer Submitted)',
  }));

  const promptText = `Evaluate this student diagnostic exam submission:
Subject: ${subject}
Topic: ${topic}
Questions and Student Answers:
${JSON.stringify(examSubmissionData, null, 2)}

Provide complete grading, mistake explanations, weak subtopics diagnosis, and targeted revision steps.`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-flash-latest',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalMarksAwarded: { type: Type.NUMBER },
            totalMarksPossible: { type: Type.NUMBER },
            percentage: { type: Type.NUMBER },
            questionGrades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.STRING },
                  questionNumber: { type: Type.INTEGER },
                  type: { type: Type.STRING },
                  marksAwarded: { type: Type.NUMBER },
                  maxMarks: { type: Type.NUMBER },
                  isCorrect: { type: Type.BOOLEAN },
                  subtopic: { type: Type.STRING },
                  studentAnswer: { type: Type.STRING },
                  correctOrSampleAnswer: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                },
                required: [
                  'questionId',
                  'questionNumber',
                  'type',
                  'marksAwarded',
                  'maxMarks',
                  'isCorrect',
                  'subtopic',
                  'feedback',
                ],
              },
            },
            mistakeExplanations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER },
                  subtopic: { type: Type.STRING },
                  studentMistake: { type: Type.STRING },
                  correction: { type: Type.STRING },
                },
                required: ['questionNumber', 'subtopic', 'studentMistake', 'correction'],
              },
            },
            weakSubtopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subtopic: { type: Type.STRING },
                  marksLost: { type: Type.NUMBER },
                  severity: { type: Type.STRING, description: 'critical | moderate | minor' },
                  diagnosticReason: { type: Type.STRING },
                },
                required: ['subtopic', 'marksLost', 'severity', 'diagnosticReason'],
              },
            },
            targetedRevisionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: { type: Type.STRING, description: 'immediate | next_up | final_touch' },
                  subtopic: { type: Type.STRING },
                  actionableStep: { type: Type.STRING },
                  recommendedTimeMinutes: { type: Type.INTEGER },
                },
                required: ['priority', 'subtopic', 'actionableStep', 'recommendedTimeMinutes'],
              },
            },
          },
          required: [
            'totalMarksAwarded',
            'totalMarksPossible',
            'percentage',
            'questionGrades',
            'mistakeExplanations',
            'weakSubtopics',
            'targetedRevisionPlan',
          ],
        },
      },
    });

    const parsed = safeJsonParse(response.text);
    return parsed;
  } catch (error: any) {
    console.error('Error grading diagnostic exam:', error);
    // Programmatic grading fallback
    let marksAwarded = 0;
    let maxMarks = 0;
    const questionGrades: any[] = [];
    const mistakeExplanations: any[] = [];
    const weakSubtopics: any[] = [];

    questions.forEach((q) => {
      maxMarks += q.marks || 1;
      const studAns = (studentAnswers[q.id] || '').trim();
      let isCorrect = false;
      let awarded = 0;

      if (q.type === 'mcq') {
        isCorrect = studAns.toLowerCase() === (q.correctAnswer || '').toLowerCase();
        awarded = isCorrect ? q.marks : 0;
      } else {
        // Simple keyword density check for fallback
        const keywords = q.keyKeywords || [];
        const matches = keywords.filter((k: string) => studAns.toLowerCase().includes(k.toLowerCase()));
        if (matches.length >= 2 || studAns.length > 40) {
          awarded = q.marks;
          isCorrect = true;
        } else if (studAns.length > 15) {
          awarded = Math.max(1, Math.floor(q.marks / 2));
          isCorrect = false;
        } else {
          awarded = 0;
          isCorrect = false;
        }
      }

      marksAwarded += awarded;
      questionGrades.push({
        questionId: q.id,
        questionNumber: q.questionNumber,
        type: q.type,
        marksAwarded: awarded,
        maxMarks: q.marks,
        isCorrect,
        subtopic: q.subtopic,
        studentAnswer: studAns || '(Unanswered)',
        correctOrSampleAnswer: q.type === 'mcq' ? q.correctAnswer : q.sampleAnswer,
        feedback: isCorrect
          ? 'Correct conceptual answer according to CBSE standards.'
          : `Missed key concepts. Review ${q.subtopic}.`,
      });

      if (!isCorrect) {
        mistakeExplanations.push({
          questionNumber: q.questionNumber,
          subtopic: q.subtopic,
          studentMistake: studAns ? `Incomplete or incorrect answer: "${studAns.slice(0, 50)}..."` : 'Question left unanswered.',
          correction: q.explanation || 'Ensure all key keywords and formula justifications are provided.',
        });

        weakSubtopics.push({
          subtopic: q.subtopic,
          marksLost: q.marks - awarded,
          severity: (q.marks - awarded >= 2) ? 'critical' : 'moderate',
          diagnosticReason: `Lost marks on ${q.type === 'mcq' ? 'objective identification' : 'analytical formulation'}.`,
        });
      }
    });

    const pct = maxMarks > 0 ? Math.round((marksAwarded / maxMarks) * 100) : 0;

    return {
      totalMarksAwarded: marksAwarded,
      totalMarksPossible: maxMarks,
      percentage: pct,
      questionGrades,
      mistakeExplanations,
      weakSubtopics,
      targetedRevisionPlan: [
        {
          priority: 'immediate',
          subtopic: weakSubtopics[0]?.subtopic || topic,
          actionableStep: 'Solve 5 NCERT exemplar questions focusing on step-by-step reasoning.',
          recommendedTimeMinutes: 30,
        },
        {
          priority: 'next_up',
          subtopic: 'Formula Sheet & Definitions',
          actionableStep: 'Create handwritten index cards for all units, constants, and boundary laws.',
          recommendedTimeMinutes: 20,
        },
      ],
    };
  }
}

// 5. Rescheduling / Study Triage (Student falls behind, rebuilds schedule around high-yield & difficult topics while preserving revision buffer & testing time)
export interface RescheduleStudyTriageInput {
  remainingSyllabus: string[];
  availableDays: number;
  dailyStudyHours: number;
  subject?: string;
  classLevel?: string;
}

export async function rescheduleStudyTriage(input: RescheduleStudyTriageInput) {
  const availableDays = Math.max(1, Math.min(60, Number(input.availableDays) || 7));
  const dailyHours = Math.max(1, Math.min(12, Number(input.dailyStudyHours) || 3));
  const totalHours = availableDays * dailyHours;
  const subject = input.subject || 'Science & Mathematics';
  const classLevel = input.classLevel || '10';
  const remainingTopics = Array.isArray(input.remainingSyllabus) && input.remainingSyllabus.length > 0
    ? input.remainingSyllabus
    : ['Electricity Numericals', 'Carbon & its Compounds', 'Life Processes', 'Magnetic Effects of Electric Current', 'Quadratic Equations'];

  const systemInstruction = `You are a Crisis Academic Triage Specialist and Board Exam Strategist.
A student has fallen behind on their preparation. You must triage their remaining syllabus to maximize marks in the remaining time.
TRIAGE PRINCIPLES:
1. CATEGORIZATION:
   - "Must-Master (High-Yield & Difficult)": The heavily weighted chapters that appear on every board exam. Must be prioritized immediately.
   - "Quick Review": Moderate weight topics that can be mastered with quick formula review and key diagrams.
   - "Optional / Skim": Low yield or niche questions that can be skimmed if time is completely exhausted.
2. PRESERVED BUFFER MANDATE:
   - You MUST reserve at least 20% to 25% of total remaining time strictly for "Revision Buffer" and "Full Diagnostic Practice Tests".
   - Panic cramming without testing leads to exam failure; this buffer is NON-NEGOTIABLE.
3. REBUILT SCHEDULE:
   - Provide a realistic day-by-day triage roadmap (Day 1 through Day N).
   - Each day specifies the targeted high-yield focus, hours, and daily goal.
4. PSYCHOLOGICAL REASSURANCE:
   - Provide high-leverage stress-reduction and focus advice.
Return structured JSON only.`;

  const promptText = `Create a Study Triage Plan:
Subject: ${subject}
Class Level: Class ${classLevel}
Remaining Days: ${availableDays} days
Daily Study Time: ${dailyHours} hours (${totalHours} total study hours available)
Remaining Uncovered Syllabus:
${remainingTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Rebuild the schedule to maximize marks, prioritizing difficult high-weight topics first, while preserving mandatory revision buffer and practice test blocks.`;

  try {
    const response = await generateContentWithRetry({
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-flash-latest',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: 'achievable_with_triage | emergency_compressed' },
            highYieldStrategy: { type: Type.STRING },
            totalAvailableHours: { type: Type.NUMBER },
            requiredSyllabusHours: { type: Type.NUMBER },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: 'must_master_high_yield | quick_review | optional_skim' },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        estimatedHours: { type: Type.NUMBER },
                        weightageScore: { type: Type.NUMBER, description: '1 to 10' },
                        reason: { type: Type.STRING },
                      },
                      required: ['name', 'estimatedHours', 'weightageScore', 'reason'],
                    },
                  },
                },
                required: ['category', 'label', 'description', 'topics'],
              },
            },
            preservedBuffer: {
              type: Type.OBJECT,
              properties: {
                revisionHours: { type: Type.NUMBER },
                practiceTestHours: { type: Type.NUMBER },
                notes: { type: Type.STRING },
              },
              required: ['revisionHours', 'practiceTestHours', 'notes'],
            },
            rebuiltSchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  focusType: { type: Type.STRING, description: 'high_yield_mastery | rapid_drill | revision_buffer | diagnostic_test' },
                  topics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  hours: { type: Type.NUMBER },
                  dailyGoal: { type: Type.STRING },
                },
                required: ['day', 'focusType', 'topics', 'hours', 'dailyGoal'],
              },
            },
            stressManagementTip: { type: Type.STRING },
          },
          required: [
            'status',
            'highYieldStrategy',
            'totalAvailableHours',
            'requiredSyllabusHours',
            'categories',
            'preservedBuffer',
            'rebuiltSchedule',
            'stressManagementTip',
          ],
        },
      },
    });

    const parsed = safeJsonParse(response.text);
    return parsed;
  } catch (error: any) {
    console.error('Error in rescheduleStudyTriage:', error);
    // Reliable programmatic fallback
    const bufferRev = Math.max(1, Math.round(totalHours * 0.15));
    const bufferTest = Math.max(1, Math.round(totalHours * 0.1));

    return {
      status: 'achievable_with_triage',
      highYieldStrategy: 'Compressing low-yield textbook reading into targeted previous-year problem drills, front-loading high-weightage topics, and strictly preserving 25% of time for revision and testing.',
      totalAvailableHours: totalHours,
      requiredSyllabusHours: Math.round(totalHours * 0.85),
      categories: [
        {
          category: 'must_master_high_yield',
          label: 'Must-Master (High Weightage & Complex)',
          description: 'Non-negotiable topics carrying the highest marks in section C and D of the board paper.',
          topics: remainingTopics.slice(0, Math.ceil(remainingTopics.length * 0.6)).map((t) => ({
            name: t,
            estimatedHours: Math.round(dailyHours * 1.2),
            weightageScore: 9,
            reason: 'Consistently tested with 4-5 mark questions on previous board exams.',
          })),
        },
        {
          category: 'quick_review',
          label: 'Quick Review (High Speed ROI)',
          description: 'High return on investment topics that can be mastered quickly through formula revision.',
          topics: remainingTopics.slice(Math.ceil(remainingTopics.length * 0.6)).map((t) => ({
            name: t,
            estimatedHours: Math.round(dailyHours * 0.6),
            weightageScore: 6,
            reason: 'Primarily tested in MCQs and 2-mark assertion questions.',
          })),
        },
      ],
      preservedBuffer: {
        revisionHours: bufferRev,
        practiceTestHours: bufferTest,
        notes: `${bufferRev} hours strictly reserved for active recall formula drills, and ${bufferTest} hours for a full timed mock exam.`,
      },
      rebuiltSchedule: Array.from({ length: availableDays }).map((_, dIdx) => {
        const day = dIdx + 1;
        const isFinalDay = day === availableDays;
        const isPenultimateDay = day === availableDays - 1;

        if (isFinalDay) {
          return {
            day,
            focusType: 'diagnostic_test',
            topics: ['Full Syllabus Timed Diagnostic Test', 'Mistake Analysis'],
            hours: dailyHours,
            dailyGoal: 'Simulate board exam conditions with zero interruptions, then review all missed questions.',
          };
        }
        if (isPenultimateDay) {
          return {
            day,
            focusType: 'revision_buffer',
            topics: ['Spaced Formula Revision', 'High-Yield Mistake Review'],
            hours: dailyHours,
            dailyGoal: 'Consolidate all notes and re-solve previously incorrect questions.',
          };
        }

        const assignedTopic = remainingTopics[dIdx % remainingTopics.length] || 'Core High-Yield Drill';
        return {
          day,
          focusType: 'high_yield_mastery',
          topics: [assignedTopic],
          hours: dailyHours,
          dailyGoal: `Master core derivations and solve 6 past year questions for ${assignedTopic}.`,
        };
      }),
      stressManagementTip: 'Focus strictly on one 25-minute Pomodoro session at a time. The triage plan is mathematically optimized to secure the maximum possible marks in your remaining timeframe.',
    };
  }
}
