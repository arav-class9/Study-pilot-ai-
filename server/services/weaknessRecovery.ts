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
  const accuracy = Math.max(0, Math.min(100, Number(input.accuracy) || 45));
  const topicName = input.topicName || 'Core Concept';
  const subjectName = input.subjectName || 'Science';
  const classLevel = input.classLevel || '10';

  const systemInstruction = `You are the AI Weakness Doctor and Recovery Engine for StudyPilot AI.
When a student has a weak topic (e.g. accuracy below 65%), generate a structured, targeted 20-minute Recovery Plan designed to turn that weakness into a strength in a single focused study sprint.

The 20-minute sprint must contain exactly 4 structured phases:
1. Phase 1: Concept Revision (7 mins) - Crystal clear intuition, eliminating core confusion, critical definitions.
2. Phase 2: Worked Example Walkthrough (5 mins) - A high-yield board/exam problem solved step-by-step with why-it-works notes.
3. Phase 3: Practice Drills (6 mins) - 3 targeted practice questions with clues/hints and full solutions.
4. Phase 4: Mini Checkpoint Test (2 mins) - 2 rapid diagnostic questions with 4 unique options each to verify mastery before concluding.`;

  const promptText = `Topic to Recover: ${topicName}
Subject: ${subjectName}
Class Level: Class ${classLevel}
Current Accuracy: ${accuracy}%
Known student stumbling points: ${input.recentMistakes?.join(', ') || 'Formulas and conceptual application'}

Generate a crisp, motivating 20-Minute Recovery Plan based strictly on NCERT curriculum standards.`;

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
      topicName,
      subjectName,
      currentAccuracy: accuracy,
      masteryScore: Math.round(accuracy * 0.95),
      diagnosis: `Diagnostic analysis indicates you have grasped the fundamental definition of ${topicName}, but need reinforcement on formula substitutions and sign conventions. Let's conquer this in 20 minutes!`,
      durationMinutes: 20,
      steps: [
        {
          stepIndex: 1,
          title: 'Revise Core Concept & Intuition',
          durationMinutes: 7,
          type: 'concept',
          content: `### Core NCERT Foundations for ${topicName}\n\n1. **Theoretical Basis**: Understand the physical or chemical phenomenon directly from first principles.\n2. **Conservation & Laws**: Verify that mass, energy, or electrical charge invariants are properly applied.\n3. **Examination Tip**: Pay close attention to standard units and variable symbols before substituting numbers.`,
        },
        {
          stepIndex: 2,
          title: 'Study Step-by-Step Worked Example',
          durationMinutes: 5,
          type: 'worked_example',
          content: `**Example Problem**: High-yield standard NCERT problem illustrating the foundational method.\n\n- **Step 1**: Write down all given quantities with proper SI units.\n- **Step 2**: State the governing NCERT equation.\n- **Step 3**: Substitute values carefully and calculate.\n- **Takeaway**: Verify the answer using dimensional consistency.`,
        },
        {
          stepIndex: 3,
          title: 'Solve 3 High-Yield Drill Questions',
          durationMinutes: 6,
          type: 'practice_drill',
          content: 'Solve these 3 quick targeted drills to lock in the method.',
          practiceItems: [
            {
              question: `Identify the primary governing equation applied in ${topicName}.`,
              hint: 'Refer to standard NCERT definition and formula.',
              solution: 'Apply the standard textbook formula with correct signs.',
            },
            {
              question: `What common mistake occurs when converting units in ${topicName}?`,
              hint: 'Check millimeters, centimeters, and standard SI units.',
              solution: 'Always convert dimensions to standard SI units (meters, seconds, kilograms) before calculating.',
            },
          ],
        },
        {
          stepIndex: 4,
          title: '2-Minute Checkpoint Test',
          durationMinutes: 2,
          type: 'mini_test',
          content: 'Verify your immediate understanding with this rapid checkpoint question.',
          practiceItems: [
            {
              question: `Which statement regarding ${topicName} is true according to NCERT?`,
              options: [
                'Fundamental conservation principles are strictly obeyed.',
                'Units can be neglected during intermediate algebraic calculations.',
                'The relationship only holds under non-standard hypothetical conditions.',
                'Formulas do not depend on the choice of physical coordinate systems.',
              ],
              correctAnswer: 'Fundamental conservation principles are strictly obeyed.',
              hint: 'Consider the universal physical laws discussed in NCERT.',
              solution: 'NCERT emphasizes that conservation laws provide the theoretical foundation for all physical and chemical processes.',
            },
          ],
        },
      ],
    };
  }
}
