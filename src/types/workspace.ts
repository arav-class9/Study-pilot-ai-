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

export interface SolvedExampleItem {
  title: string;
  explanation: string;
  calculationOrSteps?: string;
}

export interface TopicDefinitionBreakdown {
  formalDefinition: string; // 1. Definition
  keyUses: string[]; // 2. Key Uses / Applications (2-3 bullet points)
  solvedExamples: SolvedExampleItem[]; // 3. Solved Examples / Real-world Examples (1-2 concrete examples)
  quickSummary: string; // 4. Quick Summary (1-line recap)
  coreConcepts?: string[];
  keyFormulasOrRules?: string[];
  realWorldExamples?: string[];
  commonExamPoints?: string[];
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

export type VisualAccentColor =
  | 'teal'
  | 'purple'
  | 'amber'
  | 'pink'
  | 'emerald'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'green'
  | 'rose'
  | 'orange'
  | 'cyan'
  | 'fuchsia';

export interface VisualFormulaBlock {
  equation: string; // e.g. "F = m × a" or "p = m × v"
  boxedFormula?: string;
  variables?: { symbol: string; meaning: string; unit?: string }[];
  explanation?: string;
  conditionOrWhenToUse?: string;
}

export interface VisualComparisonBlock {
  title?: string;
  columns: string[]; // e.g. ["Balanced Forces", "Unbalanced Forces"]
  columnColors?: string[]; // e.g. ["blue", "pink"]
  rows: { feature?: string; values: string[] }[];
}

export interface VisualExampleBlock {
  type: 'numerical' | 'conceptual';
  title?: string;
  // Numerical structure:
  given?: string[];
  toFind?: string;
  formula?: string;
  substitution?: string;
  calculation?: string;
  answer?: string;
  // Conceptual structure:
  situation?: string;
  explanation?: string;
  conclusion?: string;
}

export interface VisualProcessStep {
  stepNumber: string; // "01", "02", etc.
  title: string;
  description: string;
}

export interface VisualExamTrapBlock {
  wrongIdea: string;
  correctConcept: string;
  explanation: string;
}

export interface VisualSelfCheckQuestion {
  id?: string;
  question: string;
  hint?: string;
  answer: string;
  explanation: string;
}

export interface VisualCustomSubBlock {
  title?: string;
  icon?: string;
  content: string;
  bullets?: string[];
  highlightPill?: string; // e.g. "Inertia ∝ Mass"
  style?: 'info' | 'highlight' | 'warning' | 'formula_pill';
}

export interface StructuredVisualCard {
  id: string;
  cardNumber?: number; // 1, 2, 3...
  title: string;
  accentColor?: VisualAccentColor;
  iconName?: string;
  importantPoint?: {
    badgeText?: string; // "Important Point", "Definition", etc.
    quoteOrText: string;
    icon?: string;
  };
  paragraphs?: string[];
  bullets?: string[];
  formula?: VisualFormulaBlock;
  comparison?: VisualComparisonBlock;
  example?: VisualExampleBlock;
  processSteps?: VisualProcessStep[];
  realLifeApplications?: {
    items: string[];
    calloutDoodleText?: string;
  };
  examTrap?: VisualExamTrapBlock;
  memoryTrick?: {
    mnemonic: string;
    explanation: string;
  };
  conceptMap?: string;
  examFocus?: {
    checklist: string[];
  };
  quickRevision?: {
    keyPoints: string[];
    takeawayBanner?: string;
  };
  selfCheck?: VisualSelfCheckQuestion[];
  customBlocks?: VisualCustomSubBlock[];
}

export interface StructuredVisualAnswer {
  topicTitle: string;
  subject: string;
  classLevel: string;
  chapter: string;
  oneLineDescription: string;
  bigIdea: string;
  subjectIcon: 'atom' | 'calculator' | 'flask' | 'dna' | 'globe' | 'book' | 'sparkles';
  bannerAccent?: 'blue_purple' | 'teal_blue' | 'indigo_violet';
  cards: StructuredVisualCard[];
  generatedAt: string;
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
  structuredVisualAnswer?: StructuredVisualAnswer;
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
