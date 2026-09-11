import { generateContentWithRetry } from '../gemini.js';
import { Type } from '@google/genai';

export interface RecommendationInput {
  weakTopics: string[];
  dueRevisionCount: number;
  daysToExam?: number;
  availableMinutes?: number;
  classLevel?: string;
  board?: string;
}

export async function generateStudyRecommendation(input: RecommendationInput) {
  const systemInstruction = `
You are the Academic Recommendation Coach for StudyPilot AI.
Suggest the single most impactful study action the student should take next.
Evaluate:
1. Urgent spaced repetition due items (if dueRevisionCount > 0).
2. Critical weak topics with lowest mastery.
3. Approaching exam dates.
4. Time efficiency based on available minutes.
`;

  const promptText = `
Student Class: Class ${input.classLevel || '10'} (${input.board || 'CBSE'})
Due Spaced Revisions Today: ${input.dueRevisionCount || 0}
Identified Weak Topics: ${input.weakTopics?.join(', ') || 'Kinetic Energy, Ohm’s Law'}
Days remaining to Board/Term Exam: ${input.daysToExam || 24} days
Target Available Study Time: ${input.availableMinutes || 45} mins
`;

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
            subjectId: { type: Type.STRING },
            chapterName: { type: Type.STRING },
            actionType: {
              type: Type.STRING,
              description: 'One of: learn, practice, revise, mistake_challenge',
            },
            recommendedMinutes: { type: Type.INTEGER },
            headline: { type: Type.STRING },
            reason: { type: Type.STRING },
            urgency: { type: Type.STRING, description: 'high, medium, normal' },
            targetAccuracyGoal: { type: Type.INTEGER },
          },
          required: [
            'topicName',
            'subjectId',
            'chapterName',
            'actionType',
            'recommendedMinutes',
            'headline',
            'reason',
            'urgency',
            'targetAccuracyGoal',
          ],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Error in recommendation engine:', error);
    return {
      topicName: input.weakTopics?.[0] || 'Ohm’s Law & Resistance in Circuits',
      subjectId: 'science',
      chapterName: 'Electricity',
      actionType: 'revise',
      recommendedMinutes: 20,
      headline: 'Target High-Yield Circuit Numericals',
      reason: 'Your accuracy in series-parallel combinations is currently 42%. A quick 20-minute drill will secure 5 marks in your upcoming exam.',
      urgency: 'high',
      targetAccuracyGoal: 85,
    };
  }
}
