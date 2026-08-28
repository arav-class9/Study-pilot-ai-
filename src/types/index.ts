export type ClassLevel = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export type SubjectId =
  | 'math'
  | 'science'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'english'
  | 'social_science'
  | 'history'
  | 'geography'
  | 'civics'
  | 'hindi'
  | 'evs'
  | 'computer'
  | 'economics';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'challenge';

export type NoteDetailLevel = 'short' | 'medium' | 'detailed' | 'exam_revision';

export type TaskType = 'learn' | 'practice' | 'revise' | 'quiz' | 'mock_test';

export type SubscriptionTier = 'free' | 'plus' | 'pro';

export type MistakeCategory =
  | 'Concept Gap'
  | 'Calculation Error'
  | 'Formula Confusion'
  | 'Unit Error'
  | 'Reading Error'
  | 'Careless Error'
  | 'Misconception';

export type ForgettingRisk = 'low' | 'moderate' | 'high' | 'critical';

export type MasteryStatus = 'needs_revision' | 'weak' | 'developing' | 'strong' | 'mastered';

export type VerificationStatus = 'verified' | 'needs_review' | 'verification_failed';

export type SourceType = 'curriculum' | 'user_uploaded' | 'ai_generated';

export type LanguageCode = 'en' | 'hi' | 'hinglish';

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  iconName: string;
  color: string;
  bgLight: string;
  description: string;
}

export type CurriculumSubject = SubjectMeta;

export interface SourceMetadata {
  sourceType: SourceType;
  sourceId?: string;
  sourceTitle?: string;
  chapterName?: string;
  board?: string;
  classLevel?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  classLevel: ClassLevel;
  board: string; // e.g. 'CBSE' | 'ICSE' | 'State Board'
  subjects: SubjectId[];
  goals: string[];
  dailyStudyMinutes: number;
  examDate?: string;
  streak: number;
  longestStreak?: number;
  lastActiveDate: string;
  totalXP: number;
  xp?: number;
  level: number;
  accuracy?: number;
  totalQuestions?: number;
  questionsAttempted?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  completedLessons?: number;
  completedQuizzes?: number;
  completedTests?: number;
  progress?: number;
  studyTime?: number;
  totalStudyMinutes?: number;
  masteryScore?: number;
  confidenceScore?: number;
  subscriptionPlan: SubscriptionTier;
  role: 'student' | 'admin' | 'teacher' | 'parent';
  preferredLanguage?: 'en' | 'hi';
  parentLinkedCode?: string;
  createdAt: string;
}

// 1. Personalized Student Learning Profile
export interface StudentLearningProfile {
  uid?: string;
  userId?: string;
  classLevel?: ClassLevel;
  board?: string;
  overallMastery: number; // 0 - 100
  masteryScore: number; // 0 - 100 (alias for overallMastery)
  accuracy: number; // 0 - 100
  accuracyScore: number; // 0 - 100 (alias for accuracy)
  confidence: number; // 0 - 100
  confidenceScore: number; // 0 - 100 (alias for confidence)
  averageSolveTime: number; // seconds
  averageSolveTimeSeconds?: number;
  forgettingRisk: ForgettingRisk;
  questionDifficultyLevel: DifficultyLevel;
  strongTopics: string[]; // mastery >= 75
  weakTopics: string[]; // mastery < 60
  developingTopics: string[]; // mastery 60-74
  needsRevisionTopics?: string[]; // mastery < 40
  dueRevisionTopics?: string[];
  commonMistakeTypes: MistakeCategory[];
  learningVelocity: 'accelerating' | 'steady' | 'needs_boost';
  consistencyScore: number; // 0 - 100
  subjectMastery: Record<SubjectId, number>; // 0 - 100
  chapterMastery: Record<string, number>; // 0 - 100
  topicMastery: Record<string, number>; // 0 - 100
  estimatedExamScore: number;
  recommendedNextFocus: string;
  recentMistakes?: {
    questionText: string;
    concept: string;
    mistakeType: MistakeCategory;
    timestamp: string;
  }[];
  subjectBreakdown?: Record<SubjectId, {
    mastery: number;
    accuracy: number;
    completedTopics: number;
    totalTopics: number;
  }>;
  lastUpdated: string;
  lastCalculated?: string;
}

// 1B. Bookmark Item
export type BookmarkCategory = 'question' | 'note' | 'topic' | 'ai_explanation' | 'mistake';

export interface BookmarkItem {
  id: string;
  userId: string;
  category: BookmarkCategory;
  title: string;
  subtitle?: string;
  subjectId?: SubjectId;
  chapterName?: string;
  topicName?: string;
  contentSnippet: string;
  referenceId?: string;
  createdAt: string;
  tags?: string[];
  payload?: any;
}

// 1C. Subscription Record
export interface SubscriptionRecord {
  uid: string;
  plan: SubscriptionTier;
  status: 'active' | 'inactive' | 'trialing' | 'past_due' | 'cancelled';
  provider: 'stripe' | 'razorpay' | 'manual_unconfigured';
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  startDate: string;
  renewalDate?: string;
  cancelAtPeriodEnd: boolean;
  tierLimits: {
    maxDailyAIQuestions: number;
    maxDailyQuizzes: number;
    maxDailyNotes: number;
    advancedMockExams: boolean;
    voiceTutorFull: boolean;
    detailedAnalytics: boolean;
  };
}

// 1D. Product Analytics Event
export type AnalyticsEventType =
  | 'signup'
  | 'onboarding_complete'
  | 'first_ai_question'
  | 'first_quiz'
  | 'quiz_completed'
  | 'first_note'
  | 'study_plan_created'
  | 'revision_completed'
  | 'exam_completed'
  | 'subscription_view'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'doubt_solved'
  | 'bookmark_saved';

export interface ProductAnalyticsEvent {
  id: string;
  userId: string;
  eventType: AnalyticsEventType;
  timestamp: string;
  properties?: Record<string, any>;
}

// 1E. Error Log Entry
export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  source: 'frontend' | 'api' | 'ai' | 'firestore' | 'auth';
  message: string;
  stack?: string;
  endpoint?: string;
  userRole?: string;
  userId?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// 1F. Prerequisite Topic Map
export interface TopicPrerequisite {
  topicId: string;
  topicName: string;
  prerequisiteTopicIds: string[];
  prerequisiteTopicNames: string[];
  subjectId: SubjectId;
  classLevel: ClassLevel;
  advisoryNote: string;
}

// 1G. Downloadable Material Configuration
export type DownloadableDocType = 'revision_sheet' | 'formula_sheet' | 'quick_notes' | 'mistake_summary';

// 2. Spaced Repetition Revision Item
export interface RevisionQueueItem {
  id: string;
  topicId: string;
  chapterId: string;
  subjectId: SubjectId;
  topicName: string;
  chapterName: string;
  scheduledDate: string; // YYYY-MM-DD
  lastReviewed?: string;
  masteryScore: number;
  forgettingRisk: ForgettingRisk;
  reviewCount: number;
  intervalDays: number; // 1, 3, 7, 14, 30
  priority: 'high' | 'medium' | 'low';
  status: 'due' | 'scheduled' | 'completed';
}

// 3. Verified Curriculum Engine Hierarchy
export interface BoardDefinition {
  id: string; // 'CBSE', 'ICSE', 'STATE'
  name: string;
  fullName: string;
  country: string;
}

export interface LearningObjective {
  id: string;
  code: string; // e.g. 'LO-SCI-10-01'
  statement: string;
  bloomLevel: 'recall' | 'understand' | 'apply' | 'analyze' | 'evaluate';
}

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  learningObjectives: LearningObjective[];
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  subjectId: SubjectId;
  classLevel: ClassLevel;
  board?: string;
  difficulty?: DifficultyLevel;
  description?: string;
  keyConcepts: string[];
  formulaList?: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  isWeakTopic?: boolean;
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  classLevel: ClassLevel;
  board?: string; // 'CBSE' | 'ICSE' | 'BSEB' | 'STATE' | 'ALL'
  name: string;
  description: string;
  order: number;
  bookName?: string;
  topics: Topic[];
  availableForPractice?: boolean;
  availableForQuiz?: boolean;
  availableForExam?: boolean;
}

export interface TopicProgress {
  topicId: string;
  topicName: string;
  subjectId: SubjectId;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number; // 0 to 100
  masteryScore: number; // 0 to 100
  status: MasteryStatus;
  lastPracticed: string;
  commonMistakes?: string[];
}

export interface QuizQuestion {
  id: string;
  subject: string;
  chapter: string;
  topic?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  correctAnswer?: string;
  explanation: string;
  difficulty: DifficultyLevel;
  questionType: 'multiple_choice' | 'assertion_reason' | 'numerical' | 'short_answer' | 'long_answer';
  formulaUsed?: string;
  concept?: string;
  hint?: string;
  commonTrap?: string;
  source?: SourceMetadata;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  subjectId: SubjectId;
  chapterName: string;
  topicName: string;
  difficulty: DifficultyLevel;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  xpEarned: number;
  completedAt?: string;
  createdAt?: string;
  questionsSummary?: {
    questionId: string;
    isCorrect: boolean;
    selectedOption: number;
    correctOption: number;
  }[];
  answers?: {
    questionId: string;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    concept: string;
  }[];
  weakTopicsDetected?: string[];
}

// 6. Mistake Item & Dashboard
export interface MistakeItem {
  id: string;
  userId: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  subject: SubjectId;
  chapter: string;
  topic: string;
  mistakeType: MistakeCategory;
  difficulty: DifficultyLevel;
  createdAt: string;
  lastReviewedAt?: string;
  reviewCount: number;
  resolved: boolean;
  correctStreak: number;
}

// 7. Exam Attempt & Mode
export type ExamType = 'school_exam' | 'board_practice' | 'full_syllabus' | 'custom_exam';

export interface ExamQuestionAnswer {
  questionId: string;
  questionText: string;
  options?: string[];
  userAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  concept: string;
  mistakeCategory?: MistakeCategory;
  timeSpentSeconds: number;
  markedForReview: boolean;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId?: string;
  title?: string;
  examTitle?: string;
  examType: ExamType;
  subject?: SubjectId;
  subjectId?: SubjectId;
  classLevel: ClassLevel;
  board: string;
  chapterNames?: string[];
  totalQuestions: number;
  durationMinutes?: number;
  timeUsedSeconds?: number;
  timeTakenSeconds?: number;
  score: number;
  maxScore?: number;
  totalMarks?: number;
  accuracy: number;
  completedAt: string;
  answers: any[];
  weakConcepts?: string[];
  weakConceptsDetected?: string[];
  mistakeBreakdown: Record<MistakeCategory, number>;
  recommendedRevision?: string[];
}

// 9. Handwritten Solution Checker
export interface HandwrittenSolutionAnalysis {
  overallResult: 'correct' | 'partially_correct' | 'incorrect' | 'unclear';
  scoreOutOf10?: number;
  correctParts: string[];
  errors: string[];
  missingSteps: string[];
  conceptIssue?: string;
  calculationIssue?: string;
  finalAnswer?: string;
  improvementTip: string;
  unclearHandwritingWarning?: boolean;
}

// 11. Parent Guardian Link & Portal
export interface ParentLinkData {
  linkCode: string;
  studentUid: string;
  studentName: string;
  parentEmail?: string;
  linkedAt?: string;
  isApproved: boolean;
}

export interface ParentStudentSummary {
  name: string;
  classLevel: string;
  streak: number;
  totalStudyHours: number;
  completedTasksThisWeek: number;
  overallAccuracy: number;
  masteryScore: number;
  weakTopics: string[];
  upcomingExams: { title: string; date: string; daysLeft: number }[];
  improvementTrend: 'rising' | 'stable' | 'needs_attention';
  revisionQueueDueCount: number;
}

// 12. Teacher Mode & Classes
export interface TeacherClass {
  id: string;
  teacherUid: string;
  name: string;
  subject: SubjectId;
  classLevel: ClassLevel;
  board: string;
  inviteCode: string;
  studentCount: number;
  createdAt: string;
}

export interface TeacherAssignment {
  id: string;
  classId: string;
  title: string;
  type: 'quiz' | 'homework' | 'mock_test';
  subject: SubjectId;
  chapterName: string;
  topicName?: string;
  dueDate: string;
  questionCount: number;
  assignedAt: string;
  submissionsCount: number;
}

// 13. Global Search Result
export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'chapter' | 'topic' | 'note' | 'quiz' | 'mistake' | 'saved_question';
  targetTab: string;
  metadata?: any;
}

// 16. Smart Notifications
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'revision_due' | 'exam_alert' | 'mistake_reminder' | 'streak_alert' | 'study_goal';
  timestamp: string;
  read: boolean;
  actionTab?: string;
  actionData?: any;
}

export interface StudyNote {
  id: string;
  userId: string;
  title: string;
  subjectId: SubjectId;
  chapterName: string;
  topicName: string;
  detailLevel: NoteDetailLevel;
  content: string;
  definitions: { term: string; definition: string }[];
  keyFormulas?: string[];
  commonMistakes?: string[];
  examTips?: string[];
  quickRevisionPoints?: string[];
  isFavorite: boolean;
  source?: SourceMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTask {
  id: string;
  timeSlot: string;
  subjectId: SubjectId;
  chapterName: string;
  topicName: string;
  durationMinutes: number;
  taskType: TaskType;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface DailyStudyPlan {
  id: string;
  userId: string;
  date: string;
  tasks: StudyTask[];
  totalStudyMinutes: number;
  completedTasks: number;
  totalTasks: number;
  generatedAt: string;
  motivationQuote?: string;
}

export interface DoubtSolution {
  question: string;
  detectedSubject?: string;
  detectedTopic?: string;
  concept: string;
  conceptExplanation: string;
  isNumerical: boolean;
  verificationStatus?: VerificationStatus;
  verificationConfidence?: number;
  verificationMessage?: string;
  source?: SourceMetadata;
  numericalBreakdown?: {
    given: string[];
    formula: string;
    substitution: string;
    calculation: string;
    answer: string;
    unit: string;
  };
  stepByStep: {
    stepNumber: number;
    title: string;
    explanation: string;
    calculation?: string;
    whyItWorks?: string;
  }[];
  finalAnswer: string;
  commonMistakes: string[];
  similarPracticeQuestion: {
    question: string;
    hint: string;
    answer: string;
  };
}

export interface RecoveryStep {
  stepIndex: number;
  title: string;
  durationMinutes: number;
  type: 'concept' | 'worked_example' | 'practice_drill' | 'mini_test';
  content: string;
  practiceItems?: {
    question: string;
    options?: string[];
    correctAnswer?: string;
    hint: string;
    solution: string;
  }[];
}

export interface WeaknessRecoveryPlan {
  topicName: string;
  subjectName: string;
  currentAccuracy: number;
  masteryScore?: number;
  diagnosis: string;
  durationMinutes: number;
  steps: RecoveryStep[];
  source?: SourceMetadata;
}

// 18. Recommendation
export interface StudyRecommendation {
  topicName: string;
  subjectId: SubjectId;
  chapterName: string;
  actionType: 'learn' | 'practice' | 'revise' | 'mistake_challenge';
  recommendedMinutes: number;
  headline: string;
  reason: string;
  urgency: 'high' | 'medium' | 'normal';
  targetAccuracyGoal: number;
}

export interface DailyUsage {
  date: string;
  aiQuestions: number;
  quizGenerations: number;
  notesGenerated: number;
  imagesProcessed: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'mastery' | 'quiz' | 'notes' | 'tutor';
  requiredCount: number;
  currentCount: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

// 19. Pomodoro & Focus Study Types
export type PomodoroMode = 'focus' | 'deep' | 'short_break' | 'long_break';

export type AmbientSoundType =
  | 'none'
  | 'white_noise'
  | 'brown_noise'
  | 'rain'
  | 'library'
  | 'binaural_40hz'
  | 'campfire';

export interface FocusTask {
  id: string;
  text: string;
  completed: boolean;
  subjectId?: SubjectId;
  createdAt: string;
}

export interface FocusSessionRecord {
  id: string;
  userId?: string;
  mode: PomodoroMode;
  subjectId: SubjectId;
  durationMinutes: number;
  completedAt: string;
  xpEarned: number;
  tasksCompleted: number;
  totalTasks: number;
  notes?: string;
}
