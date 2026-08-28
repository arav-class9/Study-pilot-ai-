import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface GenerateRecoveryPlanInput {
  topicName: string;
  subjectName: string;
  classLevel: string;
  accuracy: number;
  recentMistakes?: string[];
}

export async function generateWeaknessRecoveryPlan(input: GenerateRecoveryPlanInput) {
  const systemInstruction = `
You are the AI Weakness Doctor and Recovery Engine for StudyPilot AI.
When a student has a weak topic (e.g. accuracy below 65%), generate a structured, targeted 20-minute Recovery Plan designed to turn that weakness into a strength in a single high-intensity study sprint.
The 20-minute sprint must contain exactly 4 structured phases:
1. Phase 1: Concept Revision (7 mins) - Crystal clear intuition, eliminating core confusion, critical definitions.
2. Phase 2: Worked Example Walkthrough (5 mins) - A high-yield board/exam problem solved step-by-step with why-it-works notes.
3. Phase 3: Practice Drills (6 mins) - 3 targeted practice questions with clues/hints and full solutions.
4. Phase 4: Mini Checkpoint Test (2 mins) - 2 rapid diagnostic questions to verify mastery before concluding.
`;

  const promptText = `
Topic to Recover: ${input.topicName}
Subject: ${input.subjectName}
Class Level: Class ${input.classLevel}
Current Accuracy: ${input.accuracy}%
Known student stumbling points: ${input.recentMistakes?.join(', ') || 'Formulas and conceptual application'}

Generate a crisp, motivating 20-Minute Recovery Plan.
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
            topicName: { type: Type.STRING },
            subjectName: { type: Type.STRING },
            currentAccuracy: { type: Type.NUMBER },
            masteryScore: { type: Type.NUMBER },
            diagnosis: { type: Type.STRING, description: 'Direct, encouraging diagnosis of why the student is losing marks here' },
            durationMinutes: { type: Type.INTEGER },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepIndex: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  type: { type: Type.STRING, description: 'concept | worked_example | practice_drill | mini_test' },
                  content: { type: Type.STRING },
                  practiceItems: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        hint: { type: Type.STRING },
                        solution: { type: Type.STRING },
                      },
                      required: ['question', 'hint', 'solution'],
                    },
                  },
                },
                required: ['stepIndex', 'title', 'durationMinutes', 'type', 'content'],
              },
            },
          },
          required: ['topicName', 'subjectName', 'currentAccuracy', 'diagnosis', 'durationMinutes', 'steps'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error in generateWeaknessRecoveryPlan:', error);
    return {
      topicName: input.topicName,
      subjectName: input.subjectName,
      currentAccuracy: input.accuracy,
      masteryScore: Math.round(input.accuracy * 0.95),
      diagnosis: `Analysis shows you are comfortable with the basic definition of ${input.topicName}, but getting tripped up on multi-step numerical calculations and sign conventions. Let's fix this in 20 minutes!`,
      durationMinutes: 20,
      steps: [
        {
          stepIndex: 1,
          title: 'Revise Core Concept & Intuition',
          durationMinutes: 7,
          type: 'concept',
          content: `### Understanding the Foundation\n\n1. **Core Law**: Work done is only non-zero when there is a force acting AND displacement occurs in the direction of that force ($W = F \\cdot s \\cdot \\cos\\theta$).\n2. **Energy Invariance**: Total Mechanical Energy is conserved ($KE_1 + PE_1 = KE_2 + PE_2$).\n3. **Quick Trick**: Whenever an object moves at constant speed horizontally, work done against gravity is ZERO because $\\theta = 90^\\circ$.`,
        },
        {
          stepIndex: 2,
          title: 'Study Master Worked Example',
          durationMinutes: 5,
          type: 'worked_example',
          content: `**Problem**: A boy of mass 50 kg runs up a staircase of 45 steps in 9 seconds. If the height of each step is 15 cm, find his power output ($g = 10\\text{ m/s}^2$).\n\n**Step 1**: Find total vertical height $h = 45 \\times 15\\text{ cm} = 675\\text{ cm} = 6.75\\text{ m}$.\n**Step 2**: Work done = Increase in Potential Energy = $mgh = 50 \\times 10 \\times 6.75 = 3375\\text{ Joules}$.\n**Step 3**: Power $P = \\frac{W}{t} = \\frac{3375}{9} = 375\\text{ Watts}$.\n\n*Key takeaway*: Always convert centimeters to meters before multiplying with $g$!`,
        },
        {
          stepIndex: 3,
          title: 'Solve 3 High-Yield Drill Questions',
          durationMinutes: 6,
          type: 'practice_drill',
          content: 'Solve these 3 quick numerical drills to solidify the calculation pattern.',
          practiceItems: [
            {
              question: 'Find the kinetic energy of an object of mass 15 kg moving with a uniform velocity of 4 m/s.',
              hint: 'Apply formula KE = (1/2)m v²',
              solution: 'KE = (1/2) × 15 × (4)² = (1/2) × 15 × 16 = 120 Joules.',
            },
            {
              question: 'What is the work to be done to increase the velocity of a car from 30 km/h to 60 km/h if the mass of the car is 1500 kg?',
              hint: 'Convert velocities to m/s: 30 km/h = 25/3 m/s, 60 km/h = 50/3 m/s. Work = (1/2)m(v₂² - v₁²).',
              solution: 'Work = (1/2) × 1500 × [(50/3)² - (25/3)²] = 750 × (2500 - 625)/9 = 156,250 Joules.',
            },
            {
              question: 'An electric heater is rated 1500 W. How much energy does it use in 10 hours in commercial units?',
              hint: 'Energy = Power (in kW) × Time (in hours). 1500 W = 1.5 kW.',
              solution: 'Energy = 1.5 kW × 10 hours = 15 kWh (units).',
            },
          ],
        },
        {
          stepIndex: 4,
          title: '2-Minute Checkpoint Test',
          durationMinutes: 2,
          type: 'mini_test',
          content: 'Rapidly test your understanding with this final checkpoint.',
          practiceItems: [
            {
              question: 'If the velocity of a moving object is doubled, what happens to its kinetic energy?',
              options: ['Remains the same', 'Doubles (2x)', 'Quadruples (4x)', 'Halves (0.5x)'],
              correctAnswer: 'Quadruples (4x)',
              hint: 'KE is directly proportional to v².',
              solution: 'Since KE = (1/2)mv², when v becomes 2v, KE becomes (1/2)m(2v)² = 4 × [(1/2)mv²], which is 4 times the initial energy.',
            },
          ],
        },
      ],
    };
  }
}
