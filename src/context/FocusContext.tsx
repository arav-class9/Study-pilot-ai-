import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from './AppContext';
import {
  PomodoroMode,
  AmbientSoundType,
  FocusTask,
  FocusSessionRecord,
  SubjectId,
} from '../types';
import { ambientAudio } from '../components/pomodoro/ambientAudio';
import confetti from 'canvas-confetti';

interface FocusContextType {
  // Timer State
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  selectedSubject: SubjectId;
  completedSessions: number;
  totalFocusedMinutes: number;
  customDurations: Record<PomodoroMode, number>;
  progressPercent: number;

  // Actions
  toggleTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: PomodoroMode) => void;
  setSelectedSubject: (sub: SubjectId) => void;
  setCustomDuration: (mode: PomodoroMode, seconds: number) => void;

  // Ambient Audio
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  isAmbientPlaying: boolean;
  soundChimeEnabled: boolean;
  setAmbientSound: (sound: AmbientSoundType) => void;
  setAmbientVolume: (vol: number) => void;
  toggleAmbientPlaying: () => void;
  setSoundChimeEnabled: (enabled: boolean) => void;

  // Tasks
  tasks: FocusTask[];
  addTask: (text: string, subjectId?: SubjectId) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearCompletedTasks: () => void;

  // History & Analytics
  sessionHistory: FocusSessionRecord[];
  currentStreakDays: number;
  isAnalyticsOpen: boolean;
  openAnalytics: () => void;
  closeAnalytics: () => void;

  // Zen & Mini-Pill Mode
  isZenOpen: boolean;
  openZen: () => void;
  closeZen: () => void;
  isMiniWidgetVisible: boolean;
  setIsMiniWidgetVisible: (visible: boolean) => void;
}

const DEFAULT_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  deep: 50 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addXP, addNotification } = useApp();

  // Mode & Timer
  const [mode, setModeState] = useState<PomodoroMode>('focus');
  const [customDurations, setCustomDurations] = useState<Record<PomodoroMode, number>>(() => {
    const saved = localStorage.getItem('studypilot_pomodoro_durations');
    return saved ? JSON.parse(saved) : DEFAULT_DURATIONS;
  });
  const [timeLeft, setTimeLeft] = useState<number>(customDurations.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('science');

  // Stats
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    const saved = localStorage.getItem('studypilot_pomodoro_completed');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [totalFocusedMinutes, setTotalFocusedMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('studypilot_pomodoro_minutes');
    return saved ? parseInt(saved, 10) : 0;
  });

  // History Log
  const [sessionHistory, setSessionHistory] = useState<FocusSessionRecord[]>(() => {
    const saved = localStorage.getItem('studypilot_pomodoro_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Tasks
  const [tasks, setTasks] = useState<FocusTask[]>(() => {
    const saved = localStorage.getItem('studypilot_pomodoro_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 't-1', text: 'Review core definitions & formulas', completed: false, createdAt: new Date().toISOString() },
      { id: 't-2', text: 'Solve 5 practice problems with high focus', completed: false, createdAt: new Date().toISOString() },
    ];
  });

  // Ambient sound
  const [ambientSound, setAmbientSoundState] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolumeState] = useState<number>(0.5);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [soundChimeEnabled, setSoundChimeEnabled] = useState<boolean>(true);

  // Modals & Floating state
  const [isZenOpen, setIsZenOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isMiniWidgetVisible, setIsMiniWidgetVisible] = useState<boolean>(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Persist durations, tasks, history
  useEffect(() => {
    localStorage.setItem('studypilot_pomodoro_durations', JSON.stringify(customDurations));
  }, [customDurations]);

  useEffect(() => {
    localStorage.setItem('studypilot_pomodoro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('studypilot_pomodoro_history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // Ambient sound engine sync
  const setAmbientSound = (sound: AmbientSoundType) => {
    setAmbientSoundState(sound);
    if (sound === 'none') {
      ambientAudio.stop();
      setIsAmbientPlaying(false);
    } else {
      ambientAudio.play(sound);
      setIsAmbientPlaying(true);
    }
  };

  const setAmbientVolume = (vol: number) => {
    setAmbientVolumeState(vol);
    ambientAudio.setVolume(vol);
  };

  const toggleAmbientPlaying = () => {
    if (isAmbientPlaying) {
      ambientAudio.stop();
      setIsAmbientPlaying(false);
    } else {
      if (ambientSound !== 'none') {
        ambientAudio.play(ambientSound);
        setIsAmbientPlaying(true);
      } else {
        setAmbientSound('rain');
      }
    }
  };

  // Switch mode
  const setMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setModeState(newMode);
    setTimeLeft(customDurations[newMode]);
    endTimeRef.current = null;
  };

  const setCustomDuration = (targetMode: PomodoroMode, seconds: number) => {
    setCustomDurations((prev) => {
      const updated = { ...prev, [targetMode]: seconds };
      if (mode === targetMode && !isRunning) {
        setTimeLeft(seconds);
      }
      return updated;
    });
  };

  // Timer Tick handler
  useEffect(() => {
    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          endTimeRef.current = null;
          setIsRunning(false);
          handleSessionCompletion();
        }
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      endTimeRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Session completion
  const handleSessionCompletion = () => {
    if (soundChimeEnabled) {
      ambientAudio.playChime('complete');
    }

    if (mode === 'focus' || mode === 'deep') {
      const durationSecs = customDurations[mode];
      const minutesSpent = Math.round(durationSecs / 60);
      const xpEarned = mode === 'deep' ? 50 : 25;

      const newTotalSessions = completedSessions + 1;
      const newMinutes = totalFocusedMinutes + minutesSpent;

      setCompletedSessions(newTotalSessions);
      setTotalFocusedMinutes(newMinutes);
      localStorage.setItem('studypilot_pomodoro_completed', newTotalSessions.toString());
      localStorage.setItem('studypilot_pomodoro_minutes', newMinutes.toString());

      // Count tasks completed
      const doneCount = tasks.filter((t) => t.completed).length;

      // Add to session history
      const newRecord: FocusSessionRecord = {
        id: `sess-${Date.now()}`,
        userId: user?.uid,
        mode,
        subjectId: selectedSubject,
        durationMinutes: minutesSpent,
        completedAt: new Date().toISOString(),
        xpEarned,
        tasksCompleted: doneCount,
        totalTasks: tasks.length,
      };

      setSessionHistory((prev) => [newRecord, ...prev]);

      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.75 },
        });
      } catch {
        // Safe fallback
      }

      addXP(xpEarned, `Completed ${minutesSpent}m Focus Session (${selectedSubject})`);

      addNotification({
        title: 'Focus Session Completed! 🍅',
        message: `Superb focus! You dedicated ${minutesSpent}m to ${selectedSubject}. Take a well-deserved break!`,
        type: 'study_goal',
      });

      // Switch to break
      if (newTotalSessions % 4 === 0) {
        setMode('long_break');
      } else {
        setMode('short_break');
      }
    } else {
      addNotification({
        title: 'Break Over! ⚡',
        message: 'Recharged and ready? Let’s launch your next study session!',
        type: 'study_goal',
      });
      setMode('focus');
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      if (soundChimeEnabled) {
        ambientAudio.playChime('start');
      }
      // If ambient sound is selected and not playing, auto start it
      if (ambientSound !== 'none' && !isAmbientPlaying) {
        ambientAudio.play(ambientSound);
        setIsAmbientPlaying(true);
      }
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsRunning(true);
    } else {
      setIsRunning(false);
      endTimeRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customDurations[mode]);
    endTimeRef.current = null;
  };

  // Task actions
  const addTask = (text: string, subjectId?: SubjectId) => {
    if (!text.trim()) return;
    const newTask: FocusTask = {
      id: `task-${Date.now()}`,
      text: text.trim(),
      completed: false,
      subjectId: subjectId || selectedSubject,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const willBeDone = !t.completed;
          if (willBeDone) {
            addXP(10, `Completed Focus Goal: ${t.text}`);
          }
          return { ...t, completed: willBeDone };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompletedTasks = () => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Calculate Streak in Days
  const currentStreakDays = useMemo(() => {
    if (sessionHistory.length === 0) return 0;
    const dates = Array.from(
      new Set(
        sessionHistory.map((s) => new Date(s.completedAt).toISOString().split('T')[0])
      )
    ).sort().reverse();

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dates[0] !== today && dates[0] !== yesterday) {
      return 0;
    }

    let checkDate = new Date();
    if (dates[0] === yesterday) {
      checkDate = new Date(Date.now() - 86400000);
    }

    for (let i = 0; i < dates.length; i++) {
      const expected = checkDate.toISOString().split('T')[0];
      if (dates.includes(expected)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return Math.max(1, streak);
  }, [sessionHistory]);

  const totalDuration = customDurations[mode];
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100)
  );

  return (
    <FocusContext.Provider
      value={{
        mode,
        timeLeft,
        isRunning,
        selectedSubject,
        completedSessions,
        totalFocusedMinutes,
        customDurations,
        progressPercent,
        toggleTimer,
        resetTimer,
        setMode,
        setSelectedSubject,
        setCustomDuration,
        ambientSound,
        ambientVolume,
        isAmbientPlaying,
        soundChimeEnabled,
        setAmbientSound,
        setAmbientVolume,
        toggleAmbientPlaying,
        setSoundChimeEnabled,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        clearCompletedTasks,
        sessionHistory,
        currentStreakDays,
        isAnalyticsOpen,
        openAnalytics: () => setIsAnalyticsOpen(true),
        closeAnalytics: () => setIsAnalyticsOpen(false),
        isZenOpen,
        openZen: () => setIsZenOpen(true),
        closeZen: () => setIsZenOpen(false),
        isMiniWidgetVisible,
        setIsMiniWidgetVisible,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
