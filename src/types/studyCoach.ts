export interface PomodoroSession {
  id: string;
  sessionNumber: number;
  type: 'pomodoro' | 'break' | 'revision_buffer' | 'mock_test';
  title: string;
  topic: string;
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  tips?: string;
  timeSlot?: string;
}

export interface DaySchedule {
  dayNumber: number;
  dateOffset?: string;
  dailyTheme: string;
  revisionBufferMinutes: number;
  sessions: PomodoroSession[];
}

export interface PomodoroSchedulePlan {
  id: string;
  subject: string;
  topic: string;
  examDate: string;
  dailyStudyHours: number;
  syllabus: string[];
  overview: {
    totalDays: number;
    totalSessions: number;
    revisionBufferHours: number;
    highPriorityTopics: string[];
    strategySummary: string;
  };
  schedule: DaySchedule[];
  generatedAt: string;
}

// 2. Feynman Conceptual Breakdown & Mini-Quiz
export interface FeynmanQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface FeynmanBreakdownResult {
  concept: string;
  subject?: string;
  classLevel?: string;
  simpleExplanation: string;
  everydayAnalogies: string[];
  realWorldExamples: string[];
  coreTakeaways: string[];
  commonMisconceptions: string[];
  miniQuiz: FeynmanQuizQuestion[];
  savedAt?: string;
}

export interface FeynmanFeedbackItem {
  questionIndex: number;
  userChoice: number;
  isCorrect: boolean;
  explanation: string;
  advice: string;
}

export interface FeynmanQuizVerificationResult {
  score: number;
  total: number;
  passed: boolean;
  conceptMastered: boolean;
  detailedFeedback: FeynmanFeedbackItem[];
  overallReview: string;
}

// 3. Active Recall Flashcards
export interface ActiveRecallFlashcard {
  id: string;
  cardOrder: number;
  difficulty: 'easy' | 'medium' | 'hard';
  front: string;
  back: string;
  hint?: string;
  tag: string;
  mastered?: boolean;
  needsReview?: boolean;
}

export interface FlashcardDeck {
  id: string;
  deckTitle: string;
  subject: string;
  topic: string;
  cards: ActiveRecallFlashcard[];
  createdAt: string;
}

// 4. Practice Exam & Weak-Spot Diagnostics
export interface DiagnosticExamQuestion {
  id: string;
  questionNumber: number;
  type: 'mcq' | 'short_answer';
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  subtopic: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  sampleAnswer?: string;
  keyKeywords?: string[];
  explanation?: string;
}

export interface DiagnosticExamPaper {
  id?: string;
  examTitle: string;
  subject: string;
  topic: string;
  totalMarks: number;
  durationMinutes: number;
  questions: DiagnosticExamQuestion[];
  generatedAt?: string;
}

export interface DiagnosticQuestionGrade {
  questionId: string;
  questionNumber: number;
  type: 'mcq' | 'short_answer';
  marksAwarded: number;
  maxMarks: number;
  isCorrect: boolean;
  subtopic: string;
  studentAnswer: string;
  correctOrSampleAnswer: string;
  feedback: string;
}

export interface DiagnosticMistakeExplanation {
  questionNumber: number;
  subtopic: string;
  studentMistake: string;
  correction: string;
}

export interface WeakSubtopicDiagnostic {
  subtopic: string;
  marksLost: number;
  severity: 'critical' | 'moderate' | 'minor';
  diagnosticReason: string;
}

export interface TargetedRevisionStep {
  priority: 'immediate' | 'next_up' | 'final_touch';
  subtopic: string;
  actionableStep: string;
  recommendedTimeMinutes: number;
}

export interface DiagnosticExamResult {
  id: string;
  examTitle: string;
  subject: string;
  topic: string;
  totalMarksAwarded: number;
  totalMarksPossible: number;
  percentage: number;
  questionGrades: DiagnosticQuestionGrade[];
  mistakeExplanations: DiagnosticMistakeExplanation[];
  weakSubtopics: WeakSubtopicDiagnostic[];
  targetedRevisionPlan: TargetedRevisionStep[];
  submittedAt: string;
}

// 5. Study Triage & Rescheduling
export interface TriageTopic {
  name: string;
  estimatedHours: number;
  weightageScore: number;
  reason: string;
}

export interface TriageTopicCategory {
  category: 'must_master_high_yield' | 'quick_review' | 'optional_skim';
  label: string;
  description: string;
  topics: TriageTopic[];
}

export interface TriagePreservedBuffer {
  revisionHours: number;
  practiceTestHours: number;
  notes: string;
}

export interface TriageRebuiltDay {
  day: number;
  focusType: 'high_yield_mastery' | 'rapid_drill' | 'revision_buffer' | 'diagnostic_test';
  topics: string[];
  hours: number;
  dailyGoal: string;
}

export interface StudyTriagePlan {
  id: string;
  status: 'achievable_with_triage' | 'emergency_compressed';
  highYieldStrategy: string;
  totalAvailableHours: number;
  requiredSyllabusHours: number;
  categories: TriageTopicCategory[];
  preservedBuffer: TriagePreservedBuffer;
  rebuiltSchedule: TriageRebuiltDay[];
  stressManagementTip: string;
  createdAt: string;
  remainingSyllabus: string[];
  availableDays: number;
  dailyStudyHours: number;
}
