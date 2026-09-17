import { auth, db } from '../lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getBankQuestions } from '../data/questionBank';

async function checkClientSideLimits() {
  const user = auth.currentUser;
  if (!user) return;
  const uid = user.uid;
  try {
    const limitPromise = (async () => {
      const limitRef = doc(db, 'usageLimits', uid);
      const docSnap = await getDoc(limitRef);
      let currentUsage = 0;
      if (docSnap.exists()) {
        currentUsage = docSnap.data()?.aiQuestions || 0;
      }

      const subRef = doc(db, 'subscriptions', uid);
      const subSnap = await getDoc(subRef);
      const plan = subSnap.exists() ? subSnap.data()?.plan || 'free' : 'free';

      const limits: any = {
        free: 10,
        plus: 100,
        pro: 99999,
      };

      if (currentUsage >= limits[plan]) {
        throw new Error('Usage limit reached. Please upgrade your plan.');
      }

      await setDoc(limitRef, { aiQuestions: currentUsage + 1 }, { merge: true });
    })();

    // 2-second timeout to prevent stalling if firestore is slow
    await Promise.race([
      limitPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Limit check timeout')), 2000)),
    ]);
  } catch (err: any) {
    if (err.message === 'Usage limit reached. Please upgrade your plan.') throw err;
    console.warn('Client limit check skipped or timed out:', err.message);
  }
}

async function getAuthHeaders() {
  try {
    await checkClientSideLimits();
  } catch (err) {
    console.warn('Limit check skipped:', err);
  }

  let token: string | undefined;
  try {
    const tokenPromise = auth.currentUser?.getIdToken();
    if (tokenPromise) {
      token = await Promise.race([
        tokenPromise,
        new Promise<string | undefined>((_, reject) => setTimeout(() => reject(new Error('Token timeout')), 2000)),
      ]);
    }
  } catch (err) {
    console.warn('ID token fetch bypassed:', err);
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

import {
  DoubtSolution,
  QuizQuestion,
  StudyNote,
  WeaknessRecoveryPlan,
  DailyStudyPlan,
  DifficultyLevel,
  NoteDetailLevel,
  SubjectId,
  HandwrittenSolutionAnalysis,
  StudyRecommendation,
  ExamAttempt,
  ClassLevel,
} from '../types';

export async function askAIDoubt(params: {
  questionText?: string;
  imageBase64?: string;
  imageMimeType?: string;
  subject?: string;
  classLevel?: string;
  chapter?: string;
}): Promise<DoubtSolution> {
  const response = await fetch('/api/ai/doubt', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to solve doubt');
  }

  const result = await response.json();
  return result.data;
}

export async function generateAIQuiz(params: {
  subject: string;
  classLevel: string;
  chapter?: string;
  topic?: string;
  difficulty: DifficultyLevel;
  count: number;
  weakConcepts?: string[];
}): Promise<{
  title: string;
  subject: string;
  chapter?: string;
  difficulty: string;
  questions: QuizQuestion[];
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const headers = await getAuthHeaders();
    const response = await fetch('/api/ai/quiz', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      if (result?.data?.questions && Array.isArray(result.data.questions) && result.data.questions.length > 0) {
        // Sanitize options and answer indices
        const sanitized = result.data.questions.map((q: any, i: number) => {
          const opts = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
          let correctIdx = typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0;
          if (correctIdx < 0 || correctIdx >= opts.length) correctIdx = 0;
          return {
            ...q,
            id: q.id || `quiz-q-${i + 1}`,
            options: opts,
            correctAnswerIndex: correctIdx,
            correctAnswer: q.correctAnswer || opts[correctIdx],
          };
        });

        return {
          ...result.data,
          questions: sanitized,
        };
      }
    }
  } catch (err) {
    console.warn('AI Quiz endpoint fallback triggered:', err);
  }

  // Resilient fallback from Question Bank with normalized subject ID
  let subjId: SubjectId = 'science';
  const subLower = (params.subject || '').toLowerCase();
  if (subLower.includes('math')) subjId = 'math';
  else if (subLower.includes('english')) subjId = 'english';
  else if (subLower.includes('social')) subjId = 'social_science';
  else if (subLower.includes('hindi')) subjId = 'hindi';

  const bankQs = getBankQuestions({
    classLevel: (params.classLevel as ClassLevel) || '10',
    subjectId: subjId,
    chapterName: params.chapter,
    count: params.count || 5,
    difficulty: params.difficulty || 'medium',
  });

  const formattedQuestions: QuizQuestion[] = bankQs.map((q, idx) => ({
    id: q.id || `quiz-fallback-${Date.now()}-${idx}`,
    subject: q.subjectId,
    chapter: q.chapterName,
    topic: q.topicName,
    question: q.question,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    questionType: 'multiple_choice',
    concept: q.concept,
    hint: q.hint,
    source: {
      sourceType: 'curriculum',
      sourceTitle: `NCERT Class ${params.classLevel} ${params.subject}`,
    },
  }));

  return {
    title: `${params.chapter || params.subject} Practice Drill`,
    subject: params.subject,
    chapter: params.chapter,
    difficulty: params.difficulty,
    questions: formattedQuestions,
  };
}

export async function generateAINotes(params: {
  subject: string;
  classLevel: string;
  chapter: string;
  topic?: string;
  detailLevel: NoteDetailLevel;
}): Promise<Partial<StudyNote>> {
  const response = await fetch('/api/ai/notes', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate notes');
  }

  const result = await response.json();
  return result.data;
}

export async function generateAIWeaknessPlan(params: {
  topicName: string;
  subjectName: string;
  classLevel: string;
  accuracy: number;
  recentMistakes?: string[];
}): Promise<WeaknessRecoveryPlan> {
  const response = await fetch('/api/ai/weakness-plan', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create recovery plan');
  }

  const result = await response.json();
  return result.data;
}

export async function generateAIStudyPlan(params: {
  classLevel: string;
  dailyStudyMinutes: number;
  subjects: string[];
  weakTopics?: string[];
  examDate?: string;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}): Promise<Partial<DailyStudyPlan>> {
  const response = await fetch('/api/ai/study-plan', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate study timetable');
  }

  const result = await response.json();
  return result.data;
}

export async function analyzeAIMistake(params: {
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  subject?: string;
  classLevel?: string;
  chapter?: string;
}) {
  const response = await fetch('/api/ai/mistake-analysis', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze mistake');
  }

  const result = await response.json();
  return result.data;
}

export async function generateAIExamPaper(params: {
  subject: string;
  classLevel: string;
  board: string;
  examType: string;
  chapters: string[];
  durationMinutes: number;
  questionCount: number;
  difficulty: string;
}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const headers = await getAuthHeaders();
    const response = await fetch('/api/ai/exam', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      if (result?.data?.questions && Array.isArray(result.data.questions) && result.data.questions.length > 0) {
        // Ensure every question has required fields
        const sanitized = result.data.questions.map((q: any, i: number) => {
          const opts = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
          let correctIdx = typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0;
          if (correctIdx < 0 || correctIdx >= opts.length) correctIdx = 0;
          return {
            ...q,
            id: q.id || `exam-q-${i + 1}`,
            questionNumber: i + 1,
            options: opts,
            correctAnswerIndex: correctIdx,
            correctAnswer: q.correctAnswer || opts[correctIdx],
            isVerified: true,
          };
        });

        return {
          ...result.data,
          questions: sanitized,
        };
      }
    }
  } catch (err) {
    console.warn('AI Exam endpoint fallback triggered:', err);
  }

  // Resilient fallback from Question Bank
  const count = params.questionCount || 10;
  let subjId: SubjectId = 'science';
  const subLower = (params.subject || '').toLowerCase();
  if (subLower.includes('math')) subjId = 'math';
  else if (subLower.includes('english')) subjId = 'english';
  else if (subLower.includes('social')) subjId = 'social_science';
  else if (subLower.includes('hindi')) subjId = 'hindi';

  const bankQs = getBankQuestions({
    classLevel: (params.classLevel as ClassLevel) || '10',
    subjectId: subjId,
    count,
    difficulty: (params.difficulty as DifficultyLevel) || 'medium',
  });

  return {
    examTitle: `${params.board || 'CBSE'} Class ${params.classLevel} ${params.subject} Official Mock Test`,
    subject: params.subject,
    durationMinutes: params.durationMinutes || 30,
    totalMarks: (bankQs.length || count) * 4,
    instructions: [
      'All questions are compulsory and carry equal marks.',
      'Read each question carefully before choosing your answer.',
      'Mark questions for review if you need to double check before submission.',
      'Auto-submission will occur when the countdown timer expires.',
    ],
    questions: bankQs.map((q, idx) => ({
      id: q.id || `exam-q-${idx + 1}`,
      questionNumber: idx + 1,
      questionType: 'multiple_choice',
      marks: 4,
      question: q.question,
      options: q.options,
      correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
      correctAnswer: q.correctAnswer || q.options[0],
      explanation: q.explanation || 'Refer to NCERT textbook concepts.',
      concept: q.concept || 'Core Concept',
      chapter: q.chapterName || params.chapters?.[0] || 'Curriculum',
      isVerified: true,
    })),
  };
}

export async function checkAIHandwrittenSolution(params: {
  imageBase64: string;
  mimeType?: string;
  problemStatement?: string;
  subject?: string;
  classLevel?: string;
}): Promise<HandwrittenSolutionAnalysis> {
  const response = await fetch('/api/ai/handwriting', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to check handwritten solution');
  }

  const result = await response.json();
  return result.data;
}

export async function getAIStudyRecommendation(params: {
  weakTopics: string[];
  dueRevisionCount: number;
  daysToExam?: number;
  availableMinutes?: number;
  classLevel?: string;
  board?: string;
}): Promise<StudyRecommendation> {
  const response = await fetch('/api/ai/recommendation', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get recommendation');
  }

  const result = await response.json();
  return result.data;
}

export async function fetchAIEvaluationBenchmark() {
  const response = await fetch('/api/ai/benchmark', { headers: await getAuthHeaders() });
  if (!response.ok) {
    throw new Error('Failed to run AI evaluation benchmark');
  }
  const result = await response.json();
  return result.data;
}

export async function searchCurriculumApi(params: { query: string; classLevel?: string; notes?: any[] }) {
  try {
    const response = await fetch('/api/ai/search', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      throw new Error('Search failed');
    }
    const result = await response.json();
    return result.data || [];
  } catch (e) {
    console.warn('Search API fallback to local:', e);
    return [];
  }
}

export async function chatWithNotesApi(params: {
  question: string;
  notesContent: string;
  chapterName: string;
  subject: string;
  classLevel?: string;
}): Promise<{ answer: string; relatedKeyConcept: string; followUpSuggestions: string[] }> {
  const response = await fetch('/api/ai/notes-chat', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to chat with notes');
  }

  const result = await response.json();
  return result.data;
}

export async function generateChapterMindmapApi(params: {
  chapterName: string;
  subject: string;
  classLevel?: string;
}): Promise<{ centralTopic: string; subject: string; summary: string; nodes: any[] }> {
  const response = await fetch('/api/ai/mindmap', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate mindmap');
  }

  const result = await response.json();
  return result.data;
}

export async function conductVivaVoiceTurnApi(params: {
  chapterName: string;
  subject: string;
  studentAnswer: string;
  questionNumber: number;
}): Promise<{ evalScore: number; feedback: string; modelAnswer: string; nextQuestion: string; isComplete: boolean }> {
  const response = await fetch('/api/ai/viva-voice', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to process viva voice turn');
  }

  const result = await response.json();
  return result.data;
}

export async function evaluateFeynmanApi(params: {
  topic: string;
  subject: string;
  studentExplanation: string;
}): Promise<{ clarityScore: number; jargonCheck: string; missingGaps: string[]; simplifiedAnalogy: string; feedback: string }> {
  const response = await fetch('/api/ai/feynman-explain', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to evaluate Feynman explanation');
  }

  const result = await response.json();
  return result.data;
}


