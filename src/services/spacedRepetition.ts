import { RevisionQueueItem, ForgettingRisk, MasteryStatus } from '../types';

export interface SM2Flashcard {
  id: string;
  front: string;
  back: string;
  topicName: string;
  subject: string;
  chapter: string;
  repetitionCount: number; // n
  intervalDays: number; // I_n
  easeFactor: number; // EF (default 2.5)
  lastReviewedDate: string; // YYYY-MM-DD
  nextReviewDate: string; // YYYY-MM-DD
  history: { date: string; grade: number }[];
}

export const REPETITION_INTERVALS = [1, 3, 7, 14, 30];

/**
 * SuperMemo SM-2 Algorithm implementation
 * @param grade Performance rating from 0 (Blackout) to 5 (Perfect Recall)
 * @param card Existing flashcard state
 */
export function calculateSM2(
  grade: number, // 0 to 5
  card: { repetitionCount: number; intervalDays: number; easeFactor: number }
): { repetitionCount: number; intervalDays: number; easeFactor: number; nextReviewDate: string } {
  const q = Math.max(0, Math.min(5, Math.round(grade)));
  let { repetitionCount, intervalDays, easeFactor } = card;

  // Calculate new Ease Factor EF'
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEF < 1.3) newEF = 1.3; // Min boundary for EF

  let newRepetition = repetitionCount;
  let newInterval = intervalDays;

  if (q >= 3) {
    // Successful recall
    if (newRepetition === 0) {
      newInterval = 1;
    } else if (newRepetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * newEF);
    }
    newRepetition += 1;
  } else {
    // Failed recall - reset repetitions
    newRepetition = 0;
    newInterval = 1;
  }

  // Calculate next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  return {
    repetitionCount: newRepetition,
    intervalDays: newInterval,
    easeFactor: Number(newEF.toFixed(2)),
    nextReviewDate,
  };
}

export function calculateNextInterval(currentInterval: number, performanceScore: number): number {
  const currentIndex = REPETITION_INTERVALS.indexOf(currentInterval);

  if (performanceScore >= 80) {
    if (currentIndex === -1) return REPETITION_INTERVALS[1];
    return REPETITION_INTERVALS[Math.min(currentIndex + 1, REPETITION_INTERVALS.length - 1)];
  } else if (performanceScore < 60) {
    return REPETITION_INTERVALS[0];
  } else {
    return currentInterval || REPETITION_INTERVALS[0];
  }
}

export function computeForgettingRisk(scheduledDate: string): ForgettingRisk {
  const today = new Date().toISOString().split('T')[0];
  const scheduledTime = new Date(scheduledDate).getTime();
  const todayTime = new Date(today).getTime();
  const daysDiff = Math.floor((todayTime - scheduledTime) / (1000 * 60 * 60 * 24));

  if (daysDiff > 5) return 'critical';
  if (daysDiff > 2) return 'high';
  if (daysDiff >= 0) return 'moderate';
  return 'low';
}

export function getMasteryCategory(score: number): MasteryStatus {
  if (score < 40) return 'needs_revision';
  if (score < 60) return 'weak';
  if (score < 75) return 'developing';
  if (score < 90) return 'strong';
  return 'mastered';
}

export function generateInitialRevisionQueue(): RevisionQueueItem[] {
  return [];
}

const STORAGE_KEY_SM2_CARDS = 'studypilot_sm2_flashcards_v1';

export function getStoredSM2Cards(): SM2Flashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SM2_CARDS);
    if (!raw) {
      // Seed default SM-2 cards for immediate testing
      const seeded: SM2Flashcard[] = [
        {
          id: 'sm2-default-1',
          front: 'What is the structural and functional unit of kidney?',
          back: 'Nephron. Each kidney contains approximately 1 million nephrons responsible for filtering blood.',
          topicName: 'Life Processes',
          subject: 'Science',
          chapter: 'Life Processes',
          repetitionCount: 1,
          intervalDays: 1,
          easeFactor: 2.5,
          lastReviewedDate: new Date().toISOString().split('T')[0],
          nextReviewDate: new Date().toISOString().split('T')[0],
          history: [{ date: new Date().toISOString().split('T')[0], grade: 4 }],
        },
        {
          id: 'sm2-default-2',
          front: 'State Ohm’s Law and write its mathematical equation.',
          back: 'V = I × R. Electric current flowing through a metallic conductor is directly proportional to potential difference across its ends, provided temperature remains constant.',
          topicName: 'Electricity',
          subject: 'Science',
          chapter: 'Electricity',
          repetitionCount: 0,
          intervalDays: 1,
          easeFactor: 2.5,
          lastReviewedDate: new Date().toISOString().split('T')[0],
          nextReviewDate: new Date().toISOString().split('T')[0],
          history: [],
        },
        {
          id: 'sm2-default-3',
          front: 'What is the quadratic formula to solve ax² + bx + c = 0?',
          back: 'x = (-b ± √(b² - 4ac)) / (2a). Discriminant D = b² - 4ac determines real or complex roots.',
          topicName: 'Quadratic Equations',
          subject: 'Mathematics',
          chapter: 'Quadratic Equations',
          repetitionCount: 2,
          intervalDays: 6,
          easeFactor: 2.6,
          lastReviewedDate: new Date().toISOString().split('T')[0],
          nextReviewDate: new Date().toISOString().split('T')[0],
          history: [{ date: new Date().toISOString().split('T')[0], grade: 5 }],
        },
      ];
      localStorage.setItem(STORAGE_KEY_SM2_CARDS, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSM2Card(card: SM2Flashcard): void {
  const cards = getStoredSM2Cards();
  const idx = cards.findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    cards[idx] = card;
  } else {
    cards.push(card);
  }
  localStorage.setItem(STORAGE_KEY_SM2_CARDS, JSON.stringify(cards));
}
