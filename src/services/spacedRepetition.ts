import { RevisionQueueItem, TopicProgress, ForgettingRisk, MasteryStatus } from '../types';

export const REPETITION_INTERVALS = [1, 3, 7, 14, 30];

export function calculateNextInterval(currentInterval: number, performanceScore: number): number {
  const currentIndex = REPETITION_INTERVALS.indexOf(currentInterval);

  if (performanceScore >= 80) {
    // Step forward in intervals
    if (currentIndex === -1) return REPETITION_INTERVALS[1];
    return REPETITION_INTERVALS[Math.min(currentIndex + 1, REPETITION_INTERVALS.length - 1)];
  } else if (performanceScore < 60) {
    // Regress to Day 1
    return REPETITION_INTERVALS[0];
  } else {
    // Retain current interval
    return currentInterval || REPETITION_INTERVALS[0];
  }
}

export function computeForgettingRisk(scheduledDate: string, lastReviewed?: string): ForgettingRisk {
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
