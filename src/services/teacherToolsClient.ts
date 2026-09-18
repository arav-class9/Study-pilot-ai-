import { auth } from '../lib/firebase/config';

export interface TeacherWorksheetParams {
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

export interface TeacherWorksheetResult {
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

export async function generateTeacherWorksheetAPI(
  params: TeacherWorksheetParams
): Promise<TeacherWorksheetResult> {
  let token = '';
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }

  const response = await fetch('/api/ai/teacher-worksheet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate teacher worksheet.');
  }

  const json = await response.json();
  return json.data;
}
