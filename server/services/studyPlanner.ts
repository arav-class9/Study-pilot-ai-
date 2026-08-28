import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface GenerateStudyPlanInput {
  classLevel: string;
  dailyStudyMinutes: number;
  subjects: string[];
  weakTopics?: string[];
  examDate?: string;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export async function generateStudyPlan(input: GenerateStudyPlanInput) {
  const systemInstruction = `
You are the AI Study Director and Timetable Architect for StudyPilot AI.
Create a smart, scientifically balanced daily study schedule for a Class ${input.classLevel} student.
Guidelines:
1. Divide the available study time (${input.dailyStudyMinutes || 120} minutes) into focused 35-50 minute study blocks separated by 5-10 minute restorative breaks (Pomodoro/Spaced Repetition principles).
2. Prioritize weak topics first when cognitive energy is highest.
3. Mix high-intensity tasks (Practice, Mock Test, Quiz) with concept-building (Learn, Revise).
4. Output structured JSON adhering to the schema.
`;

  const promptText = `
Student Daily Study Minutes: ${input.dailyStudyMinutes} minutes
Class: Class ${input.classLevel}
Enrolled Subjects: ${input.subjects.join(', ')}
Known Weak Topics to prioritized: ${input.weakTopics?.join(', ') || 'General balanced revision'}
Upcoming Exam Date: ${input.examDate || 'In 4 weeks'}
Preferred Study Time Window: ${input.preferredTimeOfDay || 'evening'}

Generate today's optimal study timetable.
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
            date: { type: Type.STRING },
            totalStudyMinutes: { type: Type.INTEGER },
            motivationQuote: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  timeSlot: { type: Type.STRING, description: 'e.g. 05:00 PM - 05:45 PM' },
                  subjectId: { type: Type.STRING },
                  chapterName: { type: Type.STRING },
                  topicName: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  taskType: { type: Type.STRING, description: 'learn | practice | revise | quiz | mock_test' },
                  priority: { type: Type.STRING, description: 'high | medium | low' },
                  notes: { type: Type.STRING },
                },
                required: ['id', 'timeSlot', 'subjectId', 'chapterName', 'topicName', 'durationMinutes', 'taskType', 'priority'],
              },
            },
          },
          required: ['totalStudyMinutes', 'tasks', 'motivationQuote'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    return {
      date: new Date().toISOString().split('T')[0],
      totalStudyMinutes: input.dailyStudyMinutes || 120,
      motivationQuote: 'Small daily improvements over time lead to stunning board exam results.',
      tasks: [
        {
          id: 'task-1',
          timeSlot: '05:00 PM - 05:45 PM',
          subjectId: 'science',
          chapterName: 'Work and Energy',
          topicName: 'Kinetic & Potential Energy Drills (Weak Topic Focus)',
          durationMinutes: 45,
          taskType: 'practice',
          priority: 'high',
          notes: 'Solve 6 numericals on work-energy theorem and power conversion.',
        },
        {
          id: 'task-2',
          timeSlot: '05:45 PM - 05:55 PM',
          subjectId: 'science',
          chapterName: 'Hydration & Mind Reset',
          topicName: 'Short 10-minute active break',
          durationMinutes: 10,
          taskType: 'revise',
          priority: 'low',
          notes: 'Drink water, stretch, avoid social media screen time.',
        },
        {
          id: 'task-3',
          timeSlot: '05:55 PM - 06:40 PM',
          subjectId: 'math',
          chapterName: 'Quadratic Equations',
          topicName: 'Quadratic Formula & Nature of Roots (Discriminant)',
          durationMinutes: 45,
          taskType: 'learn',
          priority: 'high',
          notes: 'Master D > 0, D = 0, D < 0 conditions and solve board-style word problems.',
        },
        {
          id: 'task-4',
          timeSlot: '06:45 PM - 07:15 PM',
          subjectId: 'science',
          chapterName: 'Smart Adaptive Quiz',
          topicName: 'Daily Speed & Accuracy Checkpoint',
          durationMinutes: 30,
          taskType: 'quiz',
          priority: 'medium',
          notes: 'Take a 10-question AI quiz to lock in newly reviewed concepts.',
        },
      ],
    };
  }
}
