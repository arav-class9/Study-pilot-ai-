import { QuizQuestion, DifficultyLevel, ExamAttempt, MistakeCategory, SubjectId, ClassLevel } from '../types';
import { getCurriculumChapters, getCurriculumSubjects } from '../data/curriculumDatabase';
import { getBankQuestions } from '../data/questionBank';

export interface ExamEngineConfig {
  board: string;
  classLevel: ClassLevel;
  subject: SubjectId;
  examType: 'chapter_test' | 'unit_test' | 'board_practice' | 'full_syllabus' | 'speed_drill' | 'custom_test' | 'revision_test';
  chapters: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard' | 'mixed' | 'adaptive';
  questionCount: number;
  durationMinutes: number;
  negativeMarking: number; // e.g., 0.25, 1, or 0
  marksPerQuestion: number; // e.g., 4 or 1
  questionTypes?: string[];
  randomization?: boolean;
}

export interface CurriculumCoverageStatus {
  totalChapters: number;
  availableChapters: number;
  totalTopics: number;
  availableQuestionsCount: number;
  missingContentWarning?: string;
  isComplete: boolean;
}

export function evaluateCurriculumCoverage(board: string, classLevel: ClassLevel, subject: SubjectId, selectedChapters: string[]): CurriculumCoverageStatus {
  const chapters = getCurriculumChapters(classLevel, board, subject);
  const totalChapters = chapters.length;
  const availableChapters = chapters.filter(c => c.topics && c.topics.length > 0).length;
  
  let totalTopics = 0;
  chapters.forEach(c => {
    if (c.topics) totalTopics += c.topics.length;
  });

  const selectedChapObjs = chapters.filter(c => selectedChapters.includes(c.name));
  const bankQs = getBankQuestions({
    classLevel,
    subjectId: subject,
    count: 50,
  });

  const availableQuestionsCount = Math.max(selectedChapObjs.length * 5, bankQs.length, 10);
  const isComplete = availableChapters >= Math.min(totalChapters, 1);

  return {
    totalChapters,
    availableChapters,
    totalTopics,
    availableQuestionsCount,
    missingContentWarning: availableChapters < totalChapters ? `${totalChapters - availableChapters} chapters have limited topics.` : undefined,
    isComplete,
  };
}

export function validateQuestionQuality(q: any): boolean {
  if (!q || typeof q !== 'object') return false;
  if (!q.question || typeof q.question !== 'string' || q.question.trim().length < 5) return false;
  if (!q.options || !Array.isArray(q.options) || q.options.length < 2) return false;
  if (q.correctAnswerIndex === undefined && q.correctAnswer === undefined) return false;
  return true;
}

export function scoreExamAttempt(params: {
  questions: QuizQuestion[];
  userAnswers: Record<number, string | number>;
  timeTakenSeconds: number;
  durationMinutes: number;
  negativeMarking: number;
  marksPerQuestion: number;
}) {
  const { questions, userAnswers, timeTakenSeconds, durationMinutes, negativeMarking, marksPerQuestion } = params;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let totalScore = 0;

  const maxScore = questions.length * marksPerQuestion;
  const mistakeBreakdown: Record<MistakeCategory, number> = {
    'Concept Gap': 0,
    'Calculation Error': 0,
    'Formula Confusion': 0,
    'Unit Error': 0,
    'Reading Error': 0,
    'Careless Error': 0,
    'Misconception': 0,
  };

  const answersSummary = questions.map((q, idx) => {
    const userAns = userAnswers[idx];
    const isUnanswered = userAns === undefined || userAns === '' || userAns === null;
    
    let isCorrect = false;
    let studentAnswerStr = '';

    // Robust resolution of correct answer index and text
    let resolvedCorrectIndex = -1;
    if (typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < q.options.length) {
      resolvedCorrectIndex = q.correctAnswerIndex;
    } else if (q.correctAnswer !== undefined) {
      const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
      const trimmed = String(q.correctAnswer).trim().toLowerCase();
      if (letterMap[trimmed] !== undefined && letterMap[trimmed] < q.options.length) {
        resolvedCorrectIndex = letterMap[trimmed];
      } else {
        resolvedCorrectIndex = q.options.findIndex(
          (opt: string) => opt.trim().toLowerCase() === trimmed
        );
      }
    }
    if (resolvedCorrectIndex < 0) resolvedCorrectIndex = 0;

    const correctOptText = q.options[resolvedCorrectIndex] || q.correctAnswer || '';

    if (isUnanswered) {
      unanswered++;
      studentAnswerStr = 'Unanswered';
    } else {
      if (typeof userAns === 'number') {
        isCorrect = userAns === resolvedCorrectIndex;
        studentAnswerStr = q.options[userAns] || String(userAns);
      } else {
        const userTrimmed = String(userAns).trim().toLowerCase();
        isCorrect =
          userTrimmed === String(correctOptText).trim().toLowerCase() ||
          (userTrimmed === 'a' && resolvedCorrectIndex === 0) ||
          (userTrimmed === 'b' && resolvedCorrectIndex === 1) ||
          (userTrimmed === 'c' && resolvedCorrectIndex === 2) ||
          (userTrimmed === 'd' && resolvedCorrectIndex === 3);
        studentAnswerStr = String(userAns);
      }

      if (isCorrect) {
        correct++;
        totalScore += marksPerQuestion;
      } else {
        incorrect++;
        totalScore -= negativeMarking * marksPerQuestion;
        mistakeBreakdown['Concept Gap'] = (mistakeBreakdown['Concept Gap'] || 0) + 1;
      }
    }

    return {
      questionId: q.id || `q-${idx}`,
      questionText: q.question,
      options: q.options,
      userAnswer: studentAnswerStr,
      correctAnswer: q.options[resolvedCorrectIndex] || q.correctAnswer || '',
      isCorrect,
      explanation: q.explanation || 'Review chapter concepts.',
      concept: q.concept || q.chapter || 'General',
      timeSpentSeconds: Math.round(timeTakenSeconds / questions.length),
      markedForReview: false,
    };
  });

  const finalScore = Math.max(0, totalScore);
  const percentage = Math.round((finalScore / Math.max(maxScore, 1)) * 100);
  const accuracy = questions.length > 0 ? Math.round((correct / (correct + incorrect || 1)) * 100) : 0;

  return {
    correct,
    incorrect,
    unanswered,
    score: finalScore,
    maxScore,
    percentage,
    accuracy,
    timeTakenSeconds,
    averageTimePerQuestion: Math.round(timeTakenSeconds / Math.max(questions.length, 1)),
    mistakeBreakdown,
    answers: answersSummary,
  };
}

export async function calculateExamResults(params: {
  userId: string;
  examPaper: any;
  userAnswers: Record<number, string | number>;
  timeTakenSeconds: number;
  durationMinutes: number;
  negativeMarking: number;
  marksPerQuestion: number;
  board: string;
  classLevel: ClassLevel;
  subject: SubjectId;
  examType: any;
}) {
  const { questions } = params.examPaper;
  const result = scoreExamAttempt({
    questions,
    userAnswers: params.userAnswers,
    timeTakenSeconds: params.timeTakenSeconds,
    durationMinutes: params.durationMinutes,
    negativeMarking: params.negativeMarking,
    marksPerQuestion: params.marksPerQuestion,
  });

  const attemptRecord: ExamAttempt = {
    id: `exam-attempt-${Date.now()}`,
    examId: params.examPaper.id || `exam-${Date.now()}`,
    userId: params.userId,
    examType: params.examType,
    subjectId: params.subject,
    board: params.board,
    classLevel: params.classLevel,
    title: params.examPaper.examTitle || 'Official Mock Exam',
    totalQuestions: questions.length,
    score: result.score,
    totalMarks: result.maxScore,
    accuracy: result.accuracy,
    timeTakenSeconds: params.timeTakenSeconds,
    completedAt: new Date().toISOString(),
    answers: result.answers,
    weakConceptsDetected: questions.map((q: any) => q.concept || q.chapter).filter(Boolean),
    mistakeBreakdown: result.mistakeBreakdown,
  };

  try {
    const { DatabaseService } = await import('../lib/firebase/db');
    if (params.userId && !params.userId.includes('demo')) {
      await DatabaseService.saveExamAttempt(params.userId, attemptRecord);
    }
  } catch (e) {
    console.warn('Failed to persist exam attempt to Firebase:', e);
  }

  return {
    result,
    attemptRecord,
  };
}

