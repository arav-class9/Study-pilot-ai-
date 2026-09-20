export type NoteType =
  | 'short'
  | 'detailed'
  | 'exam'
  | 'definitions'
  | 'key_points'
  | 'examples'
  | 'formulas'
  | 'concept_map'
  | 'summary'
  | 'custom';

export type QuestionType =
  | 'mcq'
  | 'very_short'
  | 'short'
  | 'long'
  | 'assertion_reason'
  | 'case_study'
  | 'application'
  | 'exam_style';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface WorkspaceUploadedFile {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'docx' | 'handwritten';
  extractedText?: string;
  fileUrl?: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface ExplanationFeedback {
  correctConcepts: string[];
  missingConcepts: string[];
  misconceptions: string[];
  revisionRecommendations: string[];
  overallFeedback: string;
  score: number; // 0 to 100
  checkedAt: string;
}

export interface WorkspaceSelfExplanation {
  writtenText: string;
  mediaUrl?: string;
  mediaType?: 'video' | 'audio' | 'image';
  mediaFileName?: string;
  checkResult?: ExplanationFeedback;
}

export interface WorkspaceQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  sourceNoteRef?: string; // e.g. "Page 4" or "AI Notes"
  userAnswer?: string;
  isCorrect?: boolean;
  isAttempted?: boolean;
  scoreAwarded?: number;
}

export interface ActiveRecallFlashcard {
  id: string;
  frontPrompt: string;
  backAnswer: string;
  userRating?: 'got_it' | 'need_review';
  attemptsCount: number;
  lastAttemptAt?: string;
}

export interface RevisionSheet {
  mode: '5min' | '15min' | 'exam_night';
  summary: string;
  highYieldBullets: string[];
  memoryTraps: string[];
  keyFormulas?: string[];
  generatedAt: string;
}

export interface TopicDefinitionBreakdown {
  formalDefinition: string;
  coreConcepts: string[];
  keyFormulasOrRules: string[];
  realWorldExamples: string[];
  commonExamPoints: string[];
  generatedAt?: string;
}

export interface TopicProgressMetrics {
  notesCompleted: boolean;
  explanationCompleted: boolean;
  questionsAttempted: number;
  totalQuestions: number;
  quizScorePercent: number;
  weakAreas: string[];
  revisionStatus: 'Not Started' | 'In Progress' | 'Exam Ready';
  masteryPercentage: number; // 0 - 100
}

export interface TopicWorkspaceItem {
  id: string;
  userId?: string;
  topicName: string;
  subject: string;
  classLevel: string;
  chapter: string;
  createdAt: string;
  updatedAt: string;
  isBookmarked?: boolean;
  masteryScore: number; // 0 - 100
  lastActivityTab: 'learn' | 'notes' | 'explain' | 'practice' | 'recall' | 'revision';
  definitionBreakdown?: TopicDefinitionBreakdown;
  notes: {
    aiGeneratedText: string;
    studentManualText: string;
    noteType: NoteType;
    diagramConceptMap?: string;
    lastGeneratedAt?: string;
  };
  uploadedFiles: WorkspaceUploadedFile[];
  selfExplanation: WorkspaceSelfExplanation;
  questionBank: {
    questions: WorkspaceQuestion[];
    difficulty: QuestionDifficulty;
    questionCount: number;
    sourceFilter: 'all' | 'topic_only' | 'uploaded_only';
    lastGeneratedAt?: string;
  };
  activeRecall: {
    flashcards: ActiveRecallFlashcard[];
    attemptsCount: number;
    correctCount: number;
    incorrectCount: number;
    weakConcepts: string[];
  };
  revision: {
    latestSheet?: RevisionSheet;
    history: RevisionSheet[];
  };
  progressMetrics: TopicProgressMetrics;
}
