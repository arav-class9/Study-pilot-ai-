import { SubscriptionTier } from '../types';

export interface TierConfig {
  name: string;
  priceMonthlyINR: number;
  aiQuestionsDaily: number;
  quizGenerationsDaily: number;
  notesGenerationsDaily: number;
  advancedMockExams: boolean;
  voiceTutorUnlimited: boolean;
  deepMistakeDiagnostics: boolean;
  exportPdf: boolean;
  description: string;
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    name: 'StudyPilot Free',
    priceMonthlyINR: 0,
    aiQuestionsDaily: 8,
    quizGenerationsDaily: 3,
    notesGenerationsDaily: 3,
    advancedMockExams: false,
    voiceTutorUnlimited: false,
    deepMistakeDiagnostics: false,
    exportPdf: true,
    description: 'Essential daily homework, doubt resolution & NCERT syllabus practice.',
    features: [
      '8 AI Doubt & Question Scans / day',
      '3 Adaptive Quizzes / day',
      '3 Master Study Notes / day',
      'Mistake Notebook & Spaced Repetition',
      'NCERT Curriculum & Chapter Explorer',
    ],
  },
  plus: {
    name: 'StudyPilot Plus',
    priceMonthlyINR: 499,
    aiQuestionsDaily: 60,
    quizGenerationsDaily: 30,
    notesGenerationsDaily: 30,
    advancedMockExams: true,
    voiceTutorUnlimited: true,
    deepMistakeDiagnostics: true,
    exportPdf: true,
    description: 'High-frequency exam preparation, voice tutor & unlimited weakness recovery.',
    features: [
      '60 AI Multimodal Scans / day',
      '30 Adaptive Quizzes / day',
      '30 Comprehensive Master Notes / day',
      'Multi-Language Voice Tutor Audio',
      '20-Min Weakness Recovery Sprints',
      'Full Board Mock Exam Papers',
    ],
  },
  pro: {
    name: 'StudyPilot Pro Max',
    priceMonthlyINR: 999,
    aiQuestionsDaily: 999,
    quizGenerationsDaily: 999,
    notesGenerationsDaily: 999,
    advancedMockExams: true,
    voiceTutorUnlimited: true,
    deepMistakeDiagnostics: true,
    exportPdf: true,
    description: 'Uncapped access to AI coaching, advanced benchmarks & parent telemetry.',
    features: [
      'Unlimited AI Doubts & Handwritten Checker',
      'Unlimited Adaptive Quizzes & Mock Exams',
      'Unlimited Master Notes & PDF Exports',
      'Comprehensive Spaced Repetition Engine',
      'Teacher Assignment & Class Sharing',
      'Parent Progress Telemetry Dashboard',
    ],
  },
};
