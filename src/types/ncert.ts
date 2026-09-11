export type NCERTClass = '6' | '7' | '8' | '9' | '10' | '11' | '12';

export type NCERTSubjectId =
  | 'science'
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'social_science'
  | 'history'
  | 'geography'
  | 'civics'
  | 'economics'
  | 'english'
  | 'hindi';

export type NCERTPageType = 'theory' | 'activity' | 'numerical_example' | 'summary' | 'exercise';

export type NCERTDifficulty = 'easy' | 'medium' | 'hard';

export interface NCERTPageContent {
  pageNumber: number;
  sectionTitle: string;
  heading?: string;
  paragraphs: string[];
  keyConcepts: string[];
  formulas?: string[];
  ncertHighlights: string[];
  activities?: {
    activityNumber: string;
    title: string;
    procedure: string;
    observation: string;
    conclusion: string;
  }[];
  inTextQuestions?: {
    question: string;
    answerHint?: string;
  }[];
  vocabulary?: {
    term: string;
    definition: string;
  }[];
  diagramNote?: string;
  pageType: NCERTPageType;
}

export interface NCERTChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subjectId: NCERTSubjectId;
  classLevel: NCERTClass;
  bookTitle: string;
  totalPages: number;
  description: string;
  highYieldWeightage: string; // e.g. "8-10 marks in CBSE Board Exam"
  keyThemes: string[];
  pages?: Record<number, NCERTPageContent>;
}

export interface NCERTSubject {
  id: NCERTSubjectId;
  name: string;
  bookTitle: string;
  iconName: string;
  color: string;
  bgLight: string;
  classes: NCERTClass[];
  chapters: NCERTChapter[];
}

export interface NCERTQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  ncertPageReference: string; // e.g. "Page 4 • Section 1.2"
  difficulty: NCERTDifficulty;
  conceptTag: string;
  quoteFromPage?: string;
}

export interface NCERTQuizResult {
  id: string;
  userId: string;
  classLevel: NCERTClass;
  subjectId: NCERTSubjectId;
  chapterId: string;
  chapterName: string;
  pageNumber: number;
  date: string;
  totalQuestions: number;
  score: number; // number of correct answers
  percentage: number;
  timeSpentSeconds: number;
  difficulty: string;
  questions: NCERTQuizQuestion[];
  userAnswers: Record<number, number>; // questionIndex -> selectedOptionIndex
}

export interface NCERTPageProgress {
  pageNumber: number;
  isRead: boolean;
  lastReadDate?: string;
  quizAttemptsCount: number;
  highestScorePercentage: number;
  lastScorePercentage?: number;
  status: 'not_started' | 'read_only' | 'needs_revision' | 'mastered';
}

export interface NCERTChapterAnalyticsData {
  chapterId: string;
  chapterName: string;
  subjectId: NCERTSubjectId;
  classLevel: NCERTClass;
  totalPages: number;
  pagesReadCount: number;
  pagesMasteredCount: number;
  totalQuizzesTaken: number;
  averageScorePercentage: number;
  masteryLevelPercentage: number;
  weakConcepts: string[];
  strongConcepts: string[];
  pageProgressMap: Record<number, NCERTPageProgress>;
  recentAttempts: NCERTQuizResult[];
}

export interface NCERTRevisionItem {
  id: string;
  userId: string;
  classLevel: NCERTClass;
  subjectId: NCERTSubjectId;
  chapterId: string;
  chapterName: string;
  pageNumber: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: NCERTDifficulty;
  conceptTag: string;
  addedAt: string;
  reviewCount: number;
  nextReviewDate: string;
  mastered: boolean;
}

// --- Uploaded NCERT Book & Multi-Page Document Models ---

export interface NCERTBookDiagramRef {
  label: string; // e.g. "Fig. 1.1" or "Activity 1.2"
  title: string; // e.g. "Burning of a magnesium ribbon in air and collection of magnesium oxide in a watch glass"
  pageNumber: number;
  description?: string;
}

export interface NCERTBookExerciseRef {
  title: string; // e.g. "Exercises (Questions 1-20)" or "In-Text Questions (Page 6)"
  pageNumber: number;
  questions: string[];
}

export interface NCERTDetectedChapter {
  id: string;
  chapterNumber: number;
  title: string;
  startPage: number;
  endPage: number;
  totalPages: number;
  headings: string[];
  topics: string[];
  exercises: NCERTBookExerciseRef[];
  diagrams: NCERTBookDiagramRef[];
  summaryPoints: string[];
}

export interface NCERTProcessedBookPage {
  pageNumber: number;
  chapterNumber: number;
  chapterTitle: string;
  sectionTitle: string;
  heading?: string;
  topics: string[];
  paragraphs: string[];
  rawText: string;
  diagrams: NCERTBookDiagramRef[];
  exercises: NCERTBookExerciseRef[];
  formulas?: string[];
  inTextQuestions?: {
    question: string;
    answerHint?: string;
  }[];
  ncertHighlights: string[];
  vocabulary?: {
    term: string;
    definition: string;
  }[];
  pageType: NCERTPageType;
}

export interface NCERTBookSearchIndexEntry {
  pageNumber: number;
  chapterNumber: number;
  chapterTitle: string;
  sectionTitle: string;
  matchSnippet: string;
  type: 'topic' | 'heading' | 'exercise' | 'diagram' | 'formula' | 'text';
}

export interface NCERTUploadedBook {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  classLevel: NCERTClass;
  subjectId: NCERTSubjectId;
  uploadedAt: string;
  totalPages: number;
  source: 'official_ncert_pdf' | 'uploaded_pdf' | 'preloaded';
  chapters: NCERTDetectedChapter[];
  pages: Record<number, NCERTProcessedBookPage>;
  searchIndex: NCERTBookSearchIndexEntry[];
}

// --- Text Selection & Highlighting Models ---

export interface NCERTHighlight {
  id: string;
  userId: string;
  bookId?: string;
  chapterId: string;
  pageNumber: number;
  text: string;
  color: 'yellow' | 'emerald' | 'cyan' | 'rose';
  createdAt: string;
  note?: string;
}

export interface NCERTSelectionActionResult {
  actionType: 'notes' | 'explain' | 'quiz';
  selectedText: string;
  pageNumber: number;
  chapterName: string;
  // For 'notes':
  bulletNotes?: string[];
  keyTerms?: { term: string; definition: string }[];
  examSignificance?: string;
  // For 'explain':
  simplifiedExplanation?: string;
  realWorldAnalogy?: string;
  ncertRuleToRemember?: string;
  // For 'quiz':
  questions?: NCERTQuizQuestion[];
}

// --- Full-Book & Chapter Test Models ---

export interface NCERTFullBookTest {
  id: string;
  bookId: string;
  bookTitle: string;
  classLevel: NCERTClass;
  subjectId: NCERTSubjectId;
  totalMarks: number;
  timeLimitMinutes: number;
  chapterBreakdown: { chapterNumber: number; chapterTitle: string; questionCount: number }[];
  questions: NCERTQuizQuestion[];
  createdAt: string;
}

export interface NCERTWeakTopicInfo {
  topicName: string;
  chapterNumber: number;
  chapterTitle: string;
  sourcePageNumber: number;
  accuracyPercentage: number;
  attemptsCount: number;
  lastTestedDate: string;
  keyMisconception?: string;
}

