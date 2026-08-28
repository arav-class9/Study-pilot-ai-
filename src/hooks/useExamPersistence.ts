import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_EXAM = 'studypilot_active_exam_state_v3';

export interface ExamPersistenceState {
  examPaper: any | null;
  selectedAnswers: Record<number, string>;
  markedForReview: Record<number, boolean>;
  timeLeftSeconds: number;
  currentQuestionIndex: number;
  durationMinutes: number;
  subject: string;
  classLevel: string;
  board: string;
  isExamCompleted: boolean;
}

export function useExamPersistence() {
  const [persistedState, setPersistedState] = useState<ExamPersistenceState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXAM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.examPaper && !parsed.isExamCompleted && parsed.timeLeftSeconds > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load persisted exam state:', e);
    }
    return {
      examPaper: null,
      selectedAnswers: {},
      markedForReview: {},
      timeLeftSeconds: 0,
      currentQuestionIndex: 0,
      durationMinutes: 25,
      subject: 'science',
      classLevel: '10',
      board: 'CBSE',
      isExamCompleted: false,
    };
  });

  const saveExamState = useCallback((state: Partial<ExamPersistenceState>) => {
    setPersistedState((prev) => {
      const updated = { ...prev, ...state };
      try {
        if (updated.examPaper && !updated.isExamCompleted) {
          localStorage.setItem(STORAGE_KEY_EXAM, JSON.stringify(updated));
        } else {
          localStorage.removeItem(STORAGE_KEY_EXAM);
        }
      } catch (e) {
        console.warn('Failed to save exam state:', e);
      }
      return updated;
    });
  }, []);

  const clearExamState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_EXAM);
    } catch (e) {
      console.warn('Failed to clear exam state:', e);
    }
    setPersistedState({
      examPaper: null,
      selectedAnswers: {},
      markedForReview: {},
      timeLeftSeconds: 0,
      currentQuestionIndex: 0,
      durationMinutes: 25,
      subject: 'science',
      classLevel: '10',
      board: 'CBSE',
      isExamCompleted: false,
    });
  }, []);

  return {
    persistedState,
    saveExamState,
    clearExamState,
  };
}
