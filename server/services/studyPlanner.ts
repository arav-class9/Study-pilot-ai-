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
  const studyMinutes = Math.max(30, Math.min(480, Number(input.dailyStudyMinutes) || 120));
  const classLevel = input.classLevel || '10';
  const subjects = Array.isArray(input.subjects) && input.subjects.length > 0
    ? input.subjects
    : ['Mathematics', 'Science'];

  const systemInstruction = `You are the AI Study Director and Timetable Architect for StudyPilot AI.
Create a smart, scientifically balanced daily study schedule for a Class ${classLevel} student.

Guidelines:
1. Divide the available study time (${studyMinutes} minutes) into focused 35-50 minute study blocks separated by 5-10 minute restorative breaks (Pomodoro and spaced repetition principles).
2. Prioritize weak topics first when cognitive energy is highest.
3. Balance high-intensity tasks (Practice, Mock Test, Quiz) with concept-building (Learn, Revise).
4. Output structured JSON adhering strictly to the schema.`;

  const promptText = `Student Daily Study Minutes: ${studyMinutes} minutes
Class: Class ${classLevel}
Enrolled Subjects: ${subjects.join(', ')}
Known Weak Topics to prioritize: ${input.weakTopics?.join(', ') || 'General balanced revision'}
Upcoming Exam Date: ${input.examDate || 'In 4 weeks'}
Preferred Study Time Window: ${input.preferredTimeOfDay || 'evening'}

Generate today's optimal study timetable.`;

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
      totalStudyMinutes: studyMinutes,
      motivationQuote: 'Consistent daily effort on NCERT fundamentals creates extraordinary board results.',
      tasks: [
        {
          id: 'task-1',
          timeSlot: '05:00 PM - 05:45 PM',
          subjectId: subjects[0]?.toLowerCase() || 'science',
          chapterName: 'Core NCERT Concept Drill',
          topicName: input.weakTopics?.[0] || 'High-Yield Topic Mastery',
          durationMinutes: 45,
          taskType: 'practice',
          priority: 'high',
          notes: 'Solve in-text numericals and verify theoretical definitions.',
        },
        {
          id: 'task-2',
          timeSlot: '05:45 PM - 05:55 PM',
          subjectId: 'rest',
          chapterName: 'Active Recovery',
          topicName: '10-minute restorative break',
          durationMinutes: 10,
          taskType: 'revise',
          priority: 'low',
          notes: 'Hydrate, stretch, and rest your eyes away from screens.',
        },
        {
          id: 'task-3',
          timeSlot: '05:55 PM - 06:40 PM',
          subjectId: subjects[1]?.toLowerCase() || 'mathematics',
          chapterName: 'Exemplar & Problem Solving',
          topicName: 'Algebraic & Conceptual Calculations',
          durationMinutes: 45,
          taskType: 'learn',
          priority: 'high',
          notes: 'Practice standard board exam step-by-step solutions.',
        },
        {
          id: 'task-4',
          timeSlot: '06:45 PM - 07:15 PM',
          subjectId: subjects[0]?.toLowerCase() || 'science',
          chapterName: 'NCERT Checkpoint Quiz',
          topicName: 'Interactive Page Quiz Review',
          durationMinutes: 30,
          taskType: 'quiz',
          priority: 'medium',
          notes: 'Attempt 10 timed questions to consolidate today’s learnings.',
        },
      ],
    };
  }
}
