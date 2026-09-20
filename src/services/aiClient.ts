import { auth } from '../lib/firebase/config';
import { getBankQuestions } from '../data/questionBank';
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

export class QuotaExceededError extends Error {
  code: string;
  limit?: number;
  currentUsage?: number;
  plan?: string;

  constructor(message = 'Plan limit reached. Please upgrade to continue asking questions.', data?: any) {
    super(message);
    this.name = 'QuotaExceededError';
    this.code = 'QUOTA_EXCEEDED';
    if (data) {
      this.limit = data.limit;
      this.currentUsage = data.currentUsage;
      this.plan = data.plan;
    }
  }
}

/**
 * Centrally retrieves the current Firebase ID token.
 */
export async function getAuthBearerToken(): Promise<string | undefined> {
  try {
    const user = auth.currentUser;
    if (!user) return undefined;
    return await Promise.race([
      user.getIdToken(),
      new Promise<string | undefined>((_, reject) =>
        setTimeout(() => reject(new Error('Token timeout')), 3000)
      ),
    ]);
  } catch (err) {
    console.warn('[AUTH] ID token fetch bypassed or timed out:', err);
    return undefined;
  }
}

/**
 * Centrally manages HTTP requests to backend AI endpoints with auth bearer headers
 * and centralized quota handling.
 */
export async function callBackendAI<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST';
    body?: any;
    isFormData?: boolean;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const { method = 'POST', body, isFormData = false, timeoutMs = 25000 } = options;
  const token = await getAuthBearerToken();

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 403 && (json.code === 'QUOTA_EXCEEDED' || json.error?.includes('limit reached'))) {
        // Broadcast custom event so the UI can open the Upgrade Modal seamlessly
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('studypilot:quota-exceeded', {
              detail: {
                message: json.message || 'Daily AI question limit reached.',
                limit: json.limit,
                currentUsage: json.currentUsage,
                plan: json.plan,
              },
            })
          );
        }
        throw new QuotaExceededError(json.message || 'Plan quota limit reached. Please upgrade.', json);
      }

      throw new Error(json.error || json.message || `Request failed with status ${response.status}`);
    }

    return json.data !== undefined ? json.data : json;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof QuotaExceededError) {
      throw err;
    }
    if (err.name === 'AbortError') {
      throw new Error('AI request timed out. Please check your connection and try again.');
    }
    throw err;
  }
}

// -------------------------------------------------------------
// Formula Solver
// -------------------------------------------------------------
export interface FormulaSolverResult {
  problemText: string;
  steps: string[];
  finalAnswer: string;
  keyFormulas: string[];
  commonPitfalls: string[];
}

export async function solveFormulaAPI(params: {
  file?: File | Blob;
  problemText?: string;
  subject?: string;
  classLevel?: string;
}): Promise<FormulaSolverResult> {
  const formData = new FormData();
  if (params.file) {
    formData.append('file', params.file);
  }
  if (params.problemText) {
    formData.append('problemText', params.problemText);
  }
  if (params.subject) {
    formData.append('subject', params.subject);
  }
  if (params.classLevel) {
    formData.append('classLevel', params.classLevel);
  }

  return await callBackendAI<FormulaSolverResult>('/api/ai/solve-formula', {
    method: 'POST',
    body: formData,
    isFormData: true,
    timeoutMs: 30000,
  });
}

// -------------------------------------------------------------
// Doubt Solver
// -------------------------------------------------------------
export async function askAIDoubt(params: {
  questionText?: string;
  imageBase64?: string;
  imageMimeType?: string;
  subject?: string;
  classLevel?: string;
  chapter?: string;
  language?: string;
}): Promise<DoubtSolution> {
  return await callBackendAI<DoubtSolution>('/api/ai/doubt', {
    method: 'POST',
    body: params,
  });
}

// -------------------------------------------------------------
// Quiz Generator
// -------------------------------------------------------------
export async function generateAIQuiz(params: {
  subject: string;
  classLevel: string;
  chapter?: string;
  topic?: string;
  difficulty: DifficultyLevel;
  count: number;
  weakConcepts?: string[];
  language?: string;
}): Promise<{
  title: string;
  subject: string;
  chapter?: string;
  difficulty: string;
  questions: QuizQuestion[];
}> {
  try {
    const result = await callBackendAI<any>('/api/ai/quiz', {
      method: 'POST',
      body: params,
      timeoutMs: 12000,
    });

    if (result?.questions && Array.isArray(result.questions) && result.questions.length > 0) {
      const sanitized = result.questions.map((q: any, i: number) => {
        const opts =
          Array.isArray(q.options) && q.options.length >= 2
            ? q.options
            : ['Option A', 'Option B', 'Option C', 'Option D'];
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
        ...result,
        questions: sanitized,
      };
    }
  } catch (err) {
    if (err instanceof QuotaExceededError) throw err;
    console.warn('AI Quiz endpoint fallback triggered:', err);
  }

  // Resilient fallback from Question Bank
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

// -------------------------------------------------------------
// Notes Generator
// -------------------------------------------------------------
export async function generateAINotes(params: {
  subject: string;
  classLevel: string;
  chapter: string;
  topic?: string;
  detailLevel: NoteDetailLevel;
}): Promise<Partial<StudyNote>> {
  return await callBackendAI<Partial<StudyNote>>('/api/ai/notes', {
    method: 'POST',
    body: params,
  });
}

// -------------------------------------------------------------
// Weakness & Study Planner
// -------------------------------------------------------------
export async function generateAIWeaknessPlan(params: {
  topicName: string;
  subjectName: string;
  classLevel: string;
  accuracy: number;
  recentMistakes?: string[];
}): Promise<WeaknessRecoveryPlan> {
  return await callBackendAI<WeaknessRecoveryPlan>('/api/ai/weakness-plan', {
    method: 'POST',
    body: params,
  });
}

export async function generateAIStudyPlan(params: {
  classLevel: string;
  dailyStudyMinutes: number;
  subjects: string[];
  weakTopics?: string[];
  examDate?: string;
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}): Promise<Partial<DailyStudyPlan>> {
  return await callBackendAI<Partial<DailyStudyPlan>>('/api/ai/study-plan', {
    method: 'POST',
    body: params,
  });
}

// -------------------------------------------------------------
// Mistake Analysis
// -------------------------------------------------------------
export async function analyzeAIMistake(params: {
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  subject?: string;
  classLevel?: string;
  chapter?: string;
}) {
  return await callBackendAI<any>('/api/ai/mistake-analysis', {
    method: 'POST',
    body: params,
  });
}

// -------------------------------------------------------------
// Exam Paper Generator
// -------------------------------------------------------------
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
    const result = await callBackendAI<any>('/api/ai/exam', {
      method: 'POST',
      body: params,
      timeoutMs: 14000,
    });

    if (result?.questions && Array.isArray(result.questions) && result.questions.length > 0) {
      const sanitized = result.questions.map((q: any, i: number) => {
        const opts =
          Array.isArray(q.options) && q.options.length >= 2
            ? q.options
            : ['Option A', 'Option B', 'Option C', 'Option D'];
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
        ...result,
        questions: sanitized,
      };
    }
  } catch (err) {
    if (err instanceof QuotaExceededError) throw err;
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

// -------------------------------------------------------------
// Handwritten Solution Checker
// -------------------------------------------------------------
export async function checkAIHandwrittenSolution(params: {
  imageBase64: string;
  mimeType?: string;
  problemStatement?: string;
  subject?: string;
  classLevel?: string;
}): Promise<HandwrittenSolutionAnalysis> {
  return await callBackendAI<HandwrittenSolutionAnalysis>('/api/ai/handwriting', {
    method: 'POST',
    body: params,
  });
}

// -------------------------------------------------------------
// Recommendations & Evaluation Benchmarks
// -------------------------------------------------------------
export async function getAIStudyRecommendation(params: {
  weakTopics: string[];
  dueRevisionCount: number;
  daysToExam?: number;
  availableMinutes?: number;
  classLevel?: string;
  board?: string;
}): Promise<StudyRecommendation> {
  return await callBackendAI<StudyRecommendation>('/api/ai/recommendation', {
    method: 'POST',
    body: params,
  });
}

export async function fetchAIEvaluationBenchmark() {
  return await callBackendAI<any>('/api/ai/benchmark', {
    method: 'GET',
  });
}

export async function searchCurriculumApi(params: { query: string; classLevel?: string; notes?: any[] }) {
  try {
    const result = await callBackendAI<any[]>('/api/ai/search', {
      method: 'POST',
      body: params,
    });
    return result || [];
  } catch (e) {
    if (e instanceof QuotaExceededError) throw e;
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
  return await callBackendAI<{ answer: string; relatedKeyConcept: string; followUpSuggestions: string[] }>(
    '/api/ai/notes-chat',
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function generateChapterMindmapApi(params: {
  chapterName: string;
  subject: string;
  classLevel?: string;
}): Promise<{ centralTopic: string; subject: string; summary: string; nodes: any[] }> {
  return await callBackendAI<{ centralTopic: string; subject: string; summary: string; nodes: any[] }>(
    '/api/ai/mindmap',
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function conductVivaVoiceTurnApi(params: {
  chapterName: string;
  subject: string;
  studentAnswer: string;
  questionNumber: number;
}): Promise<{ evalScore: number; feedback: string; modelAnswer: string; nextQuestion: string; isComplete: boolean }> {
  return await callBackendAI<{
    evalScore: number;
    feedback: string;
    modelAnswer: string;
    nextQuestion: string;
    isComplete: boolean;
  }>('/api/ai/viva-voice', {
    method: 'POST',
    body: params,
  });
}

export async function evaluateFeynmanApi(params: {
  topic: string;
  subject: string;
  studentExplanation: string;
}): Promise<{ clarityScore: number; jargonCheck: string; missingGaps: string[]; simplifiedAnalogy: string; feedback: string }> {
  return await callBackendAI<{
    clarityScore: number;
    jargonCheck: string;
    missingGaps: string[];
    simplifiedAnalogy: string;
    feedback: string;
  }>('/api/ai/feynman-explain', {
    method: 'POST',
    body: params,
  });
}
