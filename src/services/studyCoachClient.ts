import { callBackendAI } from './aiClient';
import {
  PomodoroSchedulePlan,
  FeynmanBreakdownResult,
  FeynmanQuizVerificationResult,
  FlashcardDeck,
  DiagnosticExamPaper,
  DiagnosticExamResult,
  StudyTriagePlan,
} from '../types/studyCoach';

export async function fetchPomodoroSchedule(params: {
  subject: string;
  topic?: string;
  syllabus: string[];
  examDate: string;
  dailyStudyHours: number;
  classLevel?: string;
}): Promise<PomodoroSchedulePlan> {
  const res = await callBackendAI<any>('/api/pomodoro-schedule', {
    method: 'POST',
    body: params,
    timeoutMs: 35000,
  });

  const data = res?.data !== undefined ? res.data : res;
  if (!data || !data.schedule) {
    throw new Error(res?.error || 'Failed to generate Pomodoro schedule.');
  }

  return {
    id: `pomo_${Date.now()}`,
    subject: params.subject,
    topic: params.topic || params.subject,
    examDate: params.examDate,
    dailyStudyHours: params.dailyStudyHours,
    syllabus: params.syllabus,
    overview: data.overview,
    schedule: data.schedule,
    generatedAt: new Date().toISOString(),
  };
}

export async function fetchFeynmanBreakdown(params: {
  concept: string;
  subject?: string;
  classLevel?: string;
}): Promise<FeynmanBreakdownResult> {
  const res = await callBackendAI<any>('/api/feynman-breakdown', {
    method: 'POST',
    body: params,
    timeoutMs: 35000,
  });

  const data = res?.data !== undefined ? res.data : res;
  if (!data || !data.simpleExplanation) {
    throw new Error(res?.error || 'Failed to generate Feynman explanation.');
  }

  return {
    ...data,
    savedAt: new Date().toISOString(),
  };
}

export async function verifyFeynmanQuiz(params: {
  concept: string;
  questions: any[];
  studentAnswers: Record<number, number>;
}): Promise<FeynmanQuizVerificationResult> {
  const res = await callBackendAI<any>('/api/feynman-quiz-verify', {
    method: 'POST',
    body: params,
    timeoutMs: 25000,
  });

  const data = res?.data !== undefined ? res.data : res;
  if (!data || data.score === undefined) {
    throw new Error(res?.error || 'Failed to verify mini-quiz answers.');
  }

  return data;
}

export async function fetchActiveRecallFlashcards(params: {
  materialText?: string;
  subject?: string;
  topic?: string;
  classLevel?: string;
}): Promise<FlashcardDeck> {
  const res = await callBackendAI<any>('/api/flashcards-deck', {
    method: 'POST',
    body: params,
    timeoutMs: 35000,
  });

  const data = res?.data !== undefined ? res.data : res;
  if (!data || !Array.isArray(data.cards)) {
    throw new Error(res?.error || 'Failed to generate flashcards.');
  }

  const rawCards = data.cards || [];
  // Ensure ordered from easiest to hardest
  const sortedCards = rawCards.sort((a: any, b: any) => (a.cardOrder || 0) - (b.cardOrder || 0));

  return {
    id: `deck_${Date.now()}`,
    deckTitle: data.deckTitle || `${params.topic || params.subject || 'Active Recall'} Flashcards`,
    subject: data.subject || params.subject || 'Science',
    topic: data.topic || params.topic || 'General',
    cards: sortedCards,
    createdAt: new Date().toISOString(),
  };
}

export async function fetchDiagnosticPracticeExam(params: {
  subject: string;
  topic: string;
  difficulty: string;
  classLevel?: string;
}): Promise<DiagnosticExamPaper> {
  const res = await callBackendAI<any>('/api/diagnostic-exam', {
    method: 'POST',
    body: params,
    timeoutMs: 35000,
  });

  const data = res?.data !== undefined ? res.data : res;
  if (!data || !Array.isArray(data.questions)) {
    throw new Error(res?.error || 'Failed to generate diagnostic practice exam.');
  }

  return {
    ...data,
    id: `exam_${Date.now()}`,
    generatedAt: new Date().toISOString(),
  };
}

export async function submitGradeDiagnosticExam(params: {
  subject: string;
  topic: string;
  questions: any[];
  studentAnswers: Record<string, string>;
  examTitle?: string;
}): Promise<DiagnosticExamResult> {
  const res = await callBackendAI<any>('/api/grade-diagnostic-exam', {
    method: 'POST',
    body: params,
    timeoutMs: 35000,
  });

  const data = res?.data !== undefined ? res.data : res;
  if (!data || data.totalMarksAwarded === undefined) {
    throw new Error(res?.error || 'Failed to grade diagnostic exam.');
  }

  return {
    ...data,
    id: `result_${Date.now()}`,
    examTitle: params.examTitle || `${params.topic} Diagnostic Exam`,
    subject: params.subject,
    topic: params.topic,
    submittedAt: new Date().toISOString(),
  };
}

export async function fetchStudyTriagePlan(params: {
  remainingSyllabus: string[];
  availableDays: number;
  dailyStudyHours: number;
  subject?: string;
  classLevel?: string;
}): Promise<StudyTriagePlan> {
  const res = await callBackendAI<any>('/api/study-triage', {
    method: 'POST',
    body: params,
    timeoutMs: 35000,
  });

  const data = res?.data !== undefined ? res.data : res;
  if (!data || !Array.isArray(data.rebuiltSchedule)) {
    throw new Error(res?.error || 'Failed to generate study triage plan.');
  }

  return {
    ...data,
    id: `triage_${Date.now()}`,
    remainingSyllabus: params.remainingSyllabus,
    availableDays: params.availableDays,
    dailyStudyHours: params.dailyStudyHours,
    createdAt: new Date().toISOString(),
  };
}
