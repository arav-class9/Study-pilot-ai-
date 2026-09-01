import { useAuth } from './AuthContext';
import { DatabaseService } from '../lib/firebase/db';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CustomTimetable,
  UserProfile,
  TopicProgress,
  QuizAttempt,
  StudyNote,
  DailyStudyPlan,
  Achievement,
  DailyUsage,
  SubscriptionTier,
  SubjectId,
  ClassLevel,
  StudyTask,
  MistakeItem,
  RevisionQueueItem,
  ExamAttempt,
  StudentLearningProfile,
  AppNotification,
  LanguageCode,
  Chapter,
  MistakeCategory,
  StudyGroupMember,
} from '../types';
import { INITIAL_ACHIEVEMENTS, INITIAL_TOPIC_PROGRESS } from '../data/curriculum';
import { generateInitialRevisionQueue, calculateNextInterval, computeForgettingRisk, getMasteryCategory } from '../services/spacedRepetition';
import { StudentIntelligenceEngine } from '../services/studentIntelligenceEngine';

interface AppContextType {
  user: UserProfile;
  isOnboarded: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  topicProgressList: TopicProgress[];
  quizAttempts: QuizAttempt[];
  notesList: StudyNote[];
  notes: StudyNote[];
  dailyPlan: DailyStudyPlan;
  customTimetable: CustomTimetable | null;
  setCustomTimetable: (timetable: CustomTimetable | null) => void;
  saveCustomTimetable: (timetable: CustomTimetable) => void;
  achievements: Achievement[];
  usageToday: DailyUsage;
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (open: boolean) => void;
  activeRecoveryTopic: { topicName: string; subjectName: string; accuracy: number } | null;
  setActiveRecoveryTopic: (item: { topicName: string; subjectName: string; accuracy: number } | null) => void;

  // New Extended State
  mistakes: MistakeItem[];
  revisionQueue: RevisionQueueItem[];
  examAttempts: ExamAttempt[];
  learningProfile: StudentLearningProfile;
  notifications: AppNotification[];
  selectedChapter: Chapter | null;
  setSelectedChapter: (chapter: Chapter | null) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isOffline: boolean;
  isProfileLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isDeepWork: boolean;
  toggleDeepWork: () => void;

  // Actions
  completeOnboarding: (data: Partial<UserProfile>) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  saveNote: (note: StudyNote) => void;
  updateNote: (id: string, updated: Partial<StudyNote>) => void;
  deleteNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  updateDailyPlan: (plan: DailyStudyPlan) => void;
  checkAndConsumeUsage: (type: 'aiQuestions' | 'quizGenerations' | 'notesGenerated') => boolean;
  upgradeSubscription: (plan: SubscriptionTier) => void;
  addXP: (amount: number, reason?: string) => void;
  logout: () => void;
  loginWithGoogle: () => void;

  // New Feature Actions
  addMistake: (mistake: Omit<MistakeItem, 'id' | 'createdAt' | 'resolved' | 'userId' | 'reviewCount' | 'correctStreak'> & {
    userId?: string;
    reviewCount?: number;
    correctStreak?: number;
  }) => void;
  resolveMistake: (id: string) => void;
  completeRevisionItem: (id: string, performanceScore: number) => void;
  saveExamAttempt: (attempt: ExamAttempt) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  studyGroupMembers: StudyGroupMember[];
  inviteStudyPartner: (email: string, name?: string) => void;
  removeStudyPartner: (id: string) => void;
}

const DEFAULT_USER: UserProfile = {
  uid: '',
  name: 'Student Pilot',
  email: '',
  classLevel: '9',
  board: 'CBSE',
  subjects: ['math', 'science', 'english'],
  goals: ['Improve school marks', 'Master CBSE Class 9 concepts'],
  dailyStudyMinutes: 60,
  examDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
  streak: 0,
  longestStreak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalXP: 0,
  xp: 0,
  level: 1,
  accuracy: 0,
  totalQuestions: 0,
  questionsAttempted: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  completedLessons: 0,
  completedQuizzes: 0,
  completedTests: 0,
  progress: 0,
  studyTime: 0,
  totalStudyMinutes: 0,
  masteryScore: 0,
  confidenceScore: 0,
  subscriptionPlan: 'free',
  role: 'student',
  createdAt: new Date().toISOString(),
};

const DEFAULT_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    timeSlot: '04:30 PM - 05:15 PM',
    subjectId: 'science',
    chapterName: 'Work and Energy',
    topicName: 'Kinetic & Potential Energy Drills',
    durationMinutes: 45,
    taskType: 'practice',
    priority: 'high',
    completed: false,
    notes: 'Solve numericals on work-energy theorem and power conversion.',
  },
  {
    id: 'task-2',
    timeSlot: '05:25 PM - 06:10 PM',
    subjectId: 'math',
    chapterName: 'Number Systems',
    topicName: 'Irrational Numbers & Real Numbers',
    durationMinutes: 45,
    taskType: 'learn',
    priority: 'high',
    completed: false,
    notes: 'Master real numbers, operations, and laws of exponents.',
  },
  {
    id: 'task-3',
    timeSlot: '06:15 PM - 06:45 PM',
    subjectId: 'science',
    chapterName: 'Gravitation',
    topicName: 'Free Fall & Acceleration due to Gravity (g)',
    durationMinutes: 30,
    taskType: 'revise',
    priority: 'medium',
    completed: false,
    notes: 'Review differences between Mass and Weight.',
  },
  {
    id: 'task-4',
    timeSlot: '07:00 PM - 07:30 PM',
    subjectId: 'science',
    chapterName: 'Smart Adaptive Quiz',
    topicName: 'Daily Speed & Accuracy Checkpoint',
    durationMinutes: 30,
    taskType: 'quiz',
    priority: 'medium',
    completed: false,
    notes: 'Take a 10-question AI quiz to lock in newly reviewed concepts.',
  },
];

const DEFAULT_NOTES: StudyNote[] = [];

const INITIAL_MISTAKES: MistakeItem[] = [];

const INITIAL_NOTIFICATIONS: AppNotification[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: firebaseUser } = useAuth();
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);

  // Dark Mode preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('studypilot_dark_mode') === 'true';
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('studypilot_dark_mode', String(next));
      return next;
    });
  };

  const [isDeepWork, setIsDeepWork] = useState<boolean>(false);
  const toggleDeepWork = () => setIsDeepWork((prev) => !prev);

  // 1. User state
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('studypilot_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          typeof parsed.uid === 'string' &&
          parsed.uid.length > 0 &&
          parsed.uid !== 'pilot-student-001' &&
          !parsed.uid.toLowerCase().includes('demo') &&
          !parsed.uid.toLowerCase().includes('mock')
        ) {
          return parsed;
        }
      } catch {
        localStorage.removeItem('studypilot_user');
      }
    }
    return DEFAULT_USER;
  });

  useEffect(() => {
    let isMounted = true;

    if (firebaseUser) {
      setIsProfileLoading(true);

      // Verify cached user in local storage. If mismatched UID or demo/mock ID, purge local cache.
      const savedUserStr = localStorage.getItem('studypilot_user');
      let isMismatch = false;
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (!parsed?.uid || parsed.uid !== firebaseUser.uid || parsed.uid === 'pilot-student-001') {
            isMismatch = true;
          }
        } catch {
          isMismatch = true;
        }
      }

      if (isMismatch) {
        localStorage.removeItem('studypilot_user');
        localStorage.removeItem('studypilot_progress');
        localStorage.removeItem('studypilot_quizzes');
        localStorage.removeItem('studypilot_notes');
        localStorage.removeItem('studypilot_mistakes');
        localStorage.removeItem('studypilot_revision_queue');
        localStorage.removeItem('studypilot_exams');
        localStorage.removeItem('studypilot_notifications');
        localStorage.removeItem('studypilot_plan');
        localStorage.removeItem('studypilot_achievements');

        setTopicProgressList([]);
        setQuizAttempts([]);
        setNotesList([]);
        setMistakes([]);
        setRevisionQueue([]);
        setExamAttempts([]);
        setNotifications([]);
        setAchievements(INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, currentCount: 0 })));
      }

      // Concurrently fetch profile and authenticated user collections
      Promise.all([
        DatabaseService.getProfile(firebaseUser.uid),
        DatabaseService.getQuizAttempts(firebaseUser.uid),
        DatabaseService.getMistakes(firebaseUser.uid),
        DatabaseService.getRevisionItems(firebaseUser.uid),
      ])
        .then(async ([dbProfile, attempts, userMistakes, userRevisionItems]) => {
          if (!isMounted) return;

          if (dbProfile) {
            // Existing user in Firebase: strictly construct profile from dbProfile ONLY, ignoring any cached/demo data
            const totalXP = typeof dbProfile.totalXP === 'number'
              ? dbProfile.totalXP
              : typeof dbProfile.xp === 'number'
              ? dbProfile.xp
              : 0;
            const level = typeof dbProfile.level === 'number' && dbProfile.level >= 1
              ? dbProfile.level
              : Math.max(1, Math.floor(totalXP / 400) + 1);
            const streak = typeof dbProfile.streak === 'number' ? dbProfile.streak : 0;

            const existingProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: dbProfile.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Student Pilot'),
              email: firebaseUser.email || dbProfile.email || '',
              photoURL: dbProfile.photoURL || firebaseUser.photoURL || undefined,
              classLevel: dbProfile.classLevel || '9',
              board: dbProfile.board || 'CBSE',
              subjects: Array.isArray(dbProfile.subjects) && dbProfile.subjects.length > 0 ? dbProfile.subjects : ['math', 'science', 'english'],
              goals: Array.isArray(dbProfile.goals) ? dbProfile.goals : ['Improve school marks', 'Master CBSE concepts'],
              dailyStudyMinutes: typeof dbProfile.dailyStudyMinutes === 'number' ? dbProfile.dailyStudyMinutes : 60,
              examDate: dbProfile.examDate || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
              streak,
              longestStreak: typeof dbProfile.longestStreak === 'number' ? dbProfile.longestStreak : streak,
              lastActiveDate: dbProfile.lastActiveDate || new Date().toISOString().split('T')[0],
              totalXP,
              xp: totalXP,
              level,
              accuracy: typeof dbProfile.accuracy === 'number' ? dbProfile.accuracy : 0,
              totalQuestions: typeof dbProfile.totalQuestions === 'number' ? dbProfile.totalQuestions : 0,
              questionsAttempted: typeof dbProfile.questionsAttempted === 'number' ? dbProfile.questionsAttempted : 0,
              correctAnswers: typeof dbProfile.correctAnswers === 'number' ? dbProfile.correctAnswers : 0,
              wrongAnswers: typeof dbProfile.wrongAnswers === 'number' ? dbProfile.wrongAnswers : 0,
              completedLessons: typeof dbProfile.completedLessons === 'number' ? dbProfile.completedLessons : 0,
              completedQuizzes: typeof dbProfile.completedQuizzes === 'number' ? dbProfile.completedQuizzes : 0,
              completedTests: typeof dbProfile.completedTests === 'number' ? dbProfile.completedTests : 0,
              progress: typeof dbProfile.progress === 'number' ? dbProfile.progress : 0,
              studyTime: typeof dbProfile.studyTime === 'number' ? dbProfile.studyTime : 0,
              totalStudyMinutes: typeof dbProfile.totalStudyMinutes === 'number' ? dbProfile.totalStudyMinutes : 0,
              masteryScore: typeof dbProfile.masteryScore === 'number' ? dbProfile.masteryScore : 0,
              confidenceScore: typeof dbProfile.confidenceScore === 'number' ? dbProfile.confidenceScore : 0,
              subscriptionPlan: dbProfile.subscriptionPlan || 'free',
              role: dbProfile.role || 'student',
              createdAt: dbProfile.createdAt || new Date().toISOString(),
            };

            setUser(existingProfile);

            if (Array.isArray(attempts)) {
              setQuizAttempts(attempts as QuizAttempt[]);
            }
            if (Array.isArray(userMistakes) && userMistakes.length > 0) {
              setMistakes(userMistakes as MistakeItem[]);
            }
            if (Array.isArray(userRevisionItems) && userRevisionItems.length > 0) {
              setRevisionQueue(userRevisionItems as RevisionQueueItem[]);
            }
          } else {
            // New user: initialize profile with explicit zero-value fields
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Student Pilot'),
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || undefined,
              classLevel: '9',
              board: 'CBSE',
              subjects: ['math', 'science', 'english'],
              goals: ['Improve school marks', 'Master CBSE Class 9 concepts'],
              dailyStudyMinutes: 60,
              examDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
              streak: 0,
              longestStreak: 0,
              lastActiveDate: new Date().toISOString().split('T')[0],
              totalXP: 0,
              xp: 0,
              level: 1,
              accuracy: 0,
              totalQuestions: 0,
              questionsAttempted: 0,
              correctAnswers: 0,
              wrongAnswers: 0,
              completedLessons: 0,
              completedQuizzes: 0,
              completedTests: 0,
              progress: 0,
              studyTime: 0,
              totalStudyMinutes: 0,
              masteryScore: 0,
              confidenceScore: 0,
              subscriptionPlan: 'free',
              role: 'student',
              createdAt: new Date().toISOString(),
            };

            await DatabaseService.createInitialUserProfile(firebaseUser.uid, firebaseUser);

            setUser(newProfile);

            // Fresh user has no prior activity: reset all state lists to empty
            setTopicProgressList([]);
            setQuizAttempts([]);
            setNotesList([]);
            setMistakes([]);
            setRevisionQueue([]);
            setExamAttempts([]);
            setNotifications([]);
            setAchievements(INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, currentCount: 0 })));

            localStorage.removeItem('studypilot_progress');
            localStorage.removeItem('studypilot_quizzes');
            localStorage.removeItem('studypilot_notes');
            localStorage.removeItem('studypilot_mistakes');
            localStorage.removeItem('studypilot_revision_queue');
            localStorage.removeItem('studypilot_exams');
            localStorage.removeItem('studypilot_notifications');
          }
        })
        .catch((err) => {
          console.error('Error fetching user profile from Firestore:', err);
        })
        .finally(() => {
          if (isMounted) {
            setIsProfileLoading(false);
          }
        });
    } else {
      setUser(DEFAULT_USER);
      setTopicProgressList([]);
      setQuizAttempts([]);
      setNotesList([]);
      setMistakes([]);
      setRevisionQueue([]);
      setExamAttempts([]);
      setNotifications([]);
      setAchievements(INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, currentCount: 0 })));
      setIsProfileLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [firebaseUser]);

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('studypilot_onboarded') === 'true';
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [topicProgressList, setTopicProgressList] = useState<TopicProgress[]>(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    if (!savedUser) return [];
    try {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.uid || parsedUser.uid === 'pilot-student-001' || parsedUser.uid.includes('demo') || parsedUser.uid.includes('mock')) {
        return [];
      }
    } catch {
      return [];
    }
    const saved = localStorage.getItem('studypilot_progress');
    return saved ? JSON.parse(saved) : [];
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    if (!savedUser) return [];
    try {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.uid || parsedUser.uid === 'pilot-student-001' || parsedUser.uid.includes('demo') || parsedUser.uid.includes('mock')) {
        return [];
      }
    } catch {
      return [];
    }
    const saved = localStorage.getItem('studypilot_quizzes');
    return saved ? JSON.parse(saved) : [];
  });

  const [notesList, setNotesList] = useState<StudyNote[]>(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    if (!savedUser) return [];
    try {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.uid || parsedUser.uid === 'pilot-student-001' || parsedUser.uid.includes('demo') || parsedUser.uid.includes('mock')) {
        return [];
      }
    } catch {
      return [];
    }
    const saved = localStorage.getItem('studypilot_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    if (!savedUser) return [];
    try {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.uid || parsedUser.uid === 'pilot-student-001' || parsedUser.uid.includes('demo') || parsedUser.uid.includes('mock')) {
        return [];
      }
    } catch {
      return [];
    }
    const saved = localStorage.getItem('studypilot_mistakes');
    return saved ? JSON.parse(saved) : [];
  });

  const [revisionQueue, setRevisionQueue] = useState<RevisionQueueItem[]>(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    if (!savedUser) return [];
    try {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.uid || parsedUser.uid === 'pilot-student-001' || parsedUser.uid.includes('demo') || parsedUser.uid.includes('mock')) {
        return [];
      }
    } catch {
      return [];
    }
    const saved = localStorage.getItem('studypilot_revision_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    if (!savedUser) return [];
    try {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.uid || parsedUser.uid === 'pilot-student-001' || parsedUser.uid.includes('demo') || parsedUser.uid.includes('mock')) {
        return [];
      }
    } catch {
      return [];
    }
    const saved = localStorage.getItem('studypilot_exams');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    if (!savedUser) return [];
    try {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.uid || parsedUser.uid === 'pilot-student-001' || parsedUser.uid.includes('demo') || parsedUser.uid.includes('mock')) {
        return [];
      }
    } catch {
      return [];
    }
    const saved = localStorage.getItem('studypilot_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [customTimetable, setCustomTimetable] = useState<CustomTimetable | null>(() => {
    const saved = localStorage.getItem('studypilot_custom_timetable');
    if (saved) return JSON.parse(saved);
    return null;
  });

  const [studyGroupMembers, setStudyGroupMembers] = useState<StudyGroupMember[]>(() => {
    const saved = localStorage.getItem('studypilot_study_group');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'partner-1',
        name: 'Ananya Sharma',
        email: 'ananya@studypilot.ai',
        streak: 14,
        totalXP: 3450,
        quizzesTaken: 22,
        avgAccuracy: 88,
        sharedPlanTitle: 'CBSE Physics & Math Intensive',
        joinedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'partner-2',
        name: 'Rahul Verma',
        email: 'rahul@studypilot.ai',
        streak: 9,
        totalXP: 2800,
        quizzesTaken: 18,
        avgAccuracy: 82,
        sharedPlanTitle: 'Chemistry & Biology Mastery',
        joinedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('studypilot_study_group', JSON.stringify(studyGroupMembers));
  }, [studyGroupMembers]);

  const inviteStudyPartner = (email: string, name?: string) => {
    const newMember: StudyGroupMember = {
      id: `partner-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      streak: Math.floor(Math.random() * 10) + 3,
      totalXP: Math.floor(Math.random() * 2000) + 1200,
      quizzesTaken: Math.floor(Math.random() * 15) + 5,
      avgAccuracy: Math.floor(Math.random() * 15) + 80,
      sharedPlanTitle: 'CBSE Comprehensive Study Plan',
      joinedAt: new Date().toISOString(),
    };
    setStudyGroupMembers((prev) => [newMember, ...prev]);
  };

  const removeStudyPartner = (id: string) => {
    setStudyGroupMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const saveCustomTimetable = (timetable: CustomTimetable) => {
    setCustomTimetable(timetable);
    localStorage.setItem('studypilot_custom_timetable', JSON.stringify(timetable));
  };

  const [dailyPlan, setDailyPlan] = useState<DailyStudyPlan>(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.uid && parsedUser.uid !== 'pilot-student-001' && !parsedUser.uid.includes('demo') && !parsedUser.uid.includes('mock')) {
          const saved = localStorage.getItem('studypilot_plan');
          if (saved) return JSON.parse(saved);
        }
      } catch {
        // fallback to default
      }
    }
    return {
      id: 'plan-today',
      userId: user.uid || '',
      date: new Date().toISOString().split('T')[0],
      tasks: DEFAULT_TASKS.map((t) => ({ ...t, completed: false })),
      totalStudyMinutes: 120,
      completedTasks: 0,
      totalTasks: 4,
      generatedAt: new Date().toISOString(),
      motivationQuote: 'Study with high intensity for 40 minutes, then rest. Consistency creates miracles.',
    };
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const savedUser = localStorage.getItem('studypilot_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.uid && parsedUser.uid !== 'pilot-student-001' && !parsedUser.uid.includes('demo') && !parsedUser.uid.includes('mock')) {
          const saved = localStorage.getItem('studypilot_achievements');
          if (saved) return JSON.parse(saved);
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, currentCount: 0 }));
  });

  const [usageToday, setUsageToday] = useState<DailyUsage>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const savedUser = localStorage.getItem('studypilot_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser?.uid && parsedUser.uid !== 'pilot-student-001' && !parsedUser.uid.includes('demo') && !parsedUser.uid.includes('mock')) {
          const saved = localStorage.getItem(`studypilot_usage_${todayStr}`);
          if (saved) return JSON.parse(saved);
        }
      } catch {
        // fallback
      }
    }
    return { date: todayStr, aiQuestions: 0, quizGenerations: 0, notesGenerated: 0, imagesProcessed: 0 };
  });

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeRecoveryTopic, setActiveRecoveryTopic] = useState<{ topicName: string; subjectName: string; accuracy: number } | null>(null);

  // Sync to local storage only for authenticated user when profile loading has completed
  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_user', JSON.stringify(user));
    }
  }, [user, firebaseUser, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_progress', JSON.stringify(topicProgressList));
    }
  }, [topicProgressList, firebaseUser, user.uid, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_quizzes', JSON.stringify(quizAttempts));
    }
  }, [quizAttempts, firebaseUser, user.uid, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_notes', JSON.stringify(notesList));
    }
  }, [notesList, firebaseUser, user.uid, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_mistakes', JSON.stringify(mistakes));
    }
  }, [mistakes, firebaseUser, user.uid, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_revision_queue', JSON.stringify(revisionQueue));
    }
  }, [revisionQueue, firebaseUser, user.uid, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_exams', JSON.stringify(examAttempts));
    }
  }, [examAttempts, firebaseUser, user.uid, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_notifications', JSON.stringify(notifications));
    }
  }, [notifications, firebaseUser, user.uid, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_plan', JSON.stringify(dailyPlan));
    }
  }, [dailyPlan, firebaseUser, user.uid, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem('studypilot_achievements', JSON.stringify(achievements));
    }
  }, [achievements, firebaseUser, user.uid, isProfileLoading]);

  useEffect(() => {
    if (firebaseUser && user.uid === firebaseUser.uid && !isProfileLoading) {
      localStorage.setItem(`studypilot_usage_${usageToday.date}`, JSON.stringify(usageToday));
    }
  }, [usageToday, firebaseUser, user.uid, isProfileLoading]);

  // Derived Learning Profile computed dynamically using StudentIntelligenceEngine
  const learningProfile = useMemo<StudentLearningProfile>(() => {
    return StudentIntelligenceEngine.computeLearningProfile({
      userId: user.uid,
      classLevel: user.classLevel,
      board: user.board,
      topicProgressList,
      quizAttempts,
      examAttempts,
      mistakes,
      revisionQueue,
      examDate: user.examDate,
      streak: user.streak,
    });
  }, [topicProgressList, quizAttempts, examAttempts, mistakes, revisionQueue, user]);

  const addXP = (amount: number, reason?: string) => {
    if (!amount || amount <= 0) return;
    setUser((prev) => {
      const newXP = prev.totalXP + amount;
      const newLevel = Math.max(1, Math.floor(newXP / 400) + 1);
      const updated = {
        ...prev,
        totalXP: newXP,
        xp: newXP,
        level: newLevel,
      };
      if (firebaseUser) {
        DatabaseService.updateUserXP(firebaseUser.uid, newXP, newLevel);
      }
      return updated;
    });
  };

  const completeOnboarding = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ...data,
      };
      if (firebaseUser) {
        DatabaseService.setProfile(firebaseUser.uid, updated);
      }
      return updated;
    });
    setIsOnboarded(true);
    localStorage.setItem('studypilot_onboarded', 'true');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      if (firebaseUser) {
        DatabaseService.setProfile(firebaseUser.uid, updated);
      }
      return updated;
    });
  };

  const checkAndConsumeUsage = (type: 'aiQuestions' | 'quizGenerations' | 'notesGenerated'): boolean => {
    const limits = {
      free: { aiQuestions: 5, quizGenerations: 2, notesGenerated: 2 },
      plus: { aiQuestions: 50, quizGenerations: 25, notesGenerated: 25 },
      pro: { aiQuestions: 999, quizGenerations: 999, notesGenerated: 999 },
    }[user.subscriptionPlan];

    const currentUsed = usageToday[type];
    const maxAllowed = limits[type];

    if (currentUsed >= maxAllowed) {
      setIsUpgradeModalOpen(true);
      return false;
    }

    setUsageToday((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    return true;
  };

  const recordQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts((prev) => [attempt, ...prev]);

    // Update topic progress & mastery score
    setTopicProgressList((prev) => {
      const existingIdx = prev.findIndex((p) => p.topicName.toLowerCase().includes(attempt.topicName.toLowerCase()) || attempt.topicName.toLowerCase().includes(p.topicName.toLowerCase()));

      const isAccurate = attempt.accuracy >= 75;
      const newAccuracy = Math.round(attempt.accuracy);
      const newMastery = Math.min(100, Math.max(10, Math.round(newAccuracy * 0.9 + 5)));
      const newStatus = newMastery >= 85 ? 'mastered' : newMastery >= 70 ? 'strong' : newMastery >= 50 ? 'developing' : 'weak';

      if (existingIdx >= 0) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const totalAttempts = item.attempts + attempt.totalQuestions;
        const totalCorrect = item.correct + attempt.score;
        const avgAccuracy = Math.round((totalCorrect / totalAttempts) * 100);

        updated[existingIdx] = {
          ...item,
          attempts: totalAttempts,
          correct: totalCorrect,
          incorrect: item.incorrect + (attempt.totalQuestions - attempt.score),
          accuracy: avgAccuracy,
          masteryScore: Math.min(100, Math.round(avgAccuracy * 0.95)),
          lastPracticed: new Date().toISOString(),
          status: avgAccuracy >= 85 ? 'mastered' : avgAccuracy >= 70 ? 'strong' : avgAccuracy >= 50 ? 'developing' : 'weak',
        };
        return updated;
      } else {
        return [
          {
            topicId: `topic-${Date.now()}`,
            topicName: attempt.topicName,
            subjectId: attempt.subjectId,
            attempts: attempt.totalQuestions,
            correct: attempt.score,
            incorrect: attempt.totalQuestions - attempt.score,
            accuracy: newAccuracy,
            masteryScore: newMastery,
            lastPracticed: new Date().toISOString(),
            status: newStatus,
          },
          ...prev,
        ];
      }
    });

    // Schedule spaced repetition item
    const nextInterval = attempt.accuracy >= 80 ? 3 : 1;
    const nextDate = new Date(Date.now() + nextInterval * 86400000).toISOString().split('T')[0];
    setRevisionQueue((prev) => [
      {
        id: `rev-${Date.now()}`,
        topicId: `top-${Date.now()}`,
        chapterId: attempt.chapterName || 'chap-gen',
        subjectId: attempt.subjectId,
        topicName: attempt.topicName,
        chapterName: attempt.chapterName || attempt.topicName,
        scheduledDate: nextDate,
        lastReviewed: new Date().toISOString().split('T')[0],
        masteryScore: Math.round(attempt.accuracy),
        forgettingRisk: 'low',
        reviewCount: 1,
        intervalDays: nextInterval,
        priority: attempt.accuracy < 60 ? 'high' : 'medium',
        status: 'scheduled',
      },
      ...prev.filter((r) => r.topicName.toLowerCase() !== attempt.topicName.toLowerCase()),
    ]);

    // Award XP
    addXP(attempt.xpEarned, 'Quiz Completed');

    if (firebaseUser) {
      DatabaseService.saveQuizAttempt(firebaseUser.uid, attempt);
      DatabaseService.setProfile(firebaseUser.uid, {
        completedQuizzes: (user.completedQuizzes || 0) + 1,
      });
    }

    setUser((prev: UserProfile) => ({
      ...prev,
      completedQuizzes: (prev.completedQuizzes || 0) + 1,
    }));

    // Trigger celebratory confetti
    if (attempt.accuracy >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#0284C7', '#10B981', '#F59E0B'],
      });
    }
  };

  const saveNote = (note: StudyNote) => {
    setNotesList((prev) => [note, ...prev]);
    addXP(40, 'Study Sheet Generated');
  };

  const updateNote = (id: string, updated: Partial<StudyNote>) => {
    setNotesList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updated, updatedAt: new Date().toISOString() } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotesList((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleFavoriteNote = (id: string) => {
    setNotesList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  };

  const toggleTaskCompletion = (taskId: string) => {
    setDailyPlan((prev: DailyStudyPlan) => {
      const updatedTasks = prev.tasks.map((t: StudyTask) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            addXP(25, 'Study Task Complete');
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });

      const completedCount = updatedTasks.filter((t: StudyTask) => t.completed).length;
      return {
        ...prev,
        tasks: updatedTasks,
        completedTasks: completedCount,
      };
    });
  };

  const updateDailyPlan = (plan: DailyStudyPlan) => {
    setDailyPlan(plan);
  };

  const upgradeSubscription = (plan: SubscriptionTier) => {
    setUser((prev) => ({
      ...prev,
      subscriptionPlan: plan,
    }));
    setIsUpgradeModalOpen(false);
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
    });
  };

  const addMistake = (
    mistakeData: Omit<MistakeItem, 'id' | 'createdAt' | 'resolved' | 'userId' | 'reviewCount' | 'correctStreak'> & {
      userId?: string;
      reviewCount?: number;
      correctStreak?: number;
    }
  ) => {
    const newMistake: MistakeItem = {
      userId: user.uid,
      reviewCount: 0,
      correctStreak: 0,
      ...mistakeData,
      id: `mistake-${Date.now()}`,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    setMistakes((prev) => [newMistake, ...prev]);
  };

  const resolveMistake = (id: string) => {
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, resolved: true, resolvedAt: new Date().toISOString() } : m))
    );
    addXP(25, 'Mistake Mastered in Drill');
  };

  const completeRevisionItem = (id: string, performanceScore: number) => {
    setRevisionQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextDays = calculateNextInterval(item.intervalDays, performanceScore);
          const nextDate = new Date(Date.now() + nextDays * 86400000).toISOString().split('T')[0];
          return {
            ...item,
            intervalDays: nextDays,
            scheduledDate: nextDate,
            lastReviewed: new Date().toISOString().split('T')[0],
            reviewCount: item.reviewCount + 1,
            masteryScore: Math.round(item.masteryScore * 0.3 + performanceScore * 0.7),
            forgettingRisk: computeForgettingRisk(nextDate),
            status: 'scheduled',
          };
        }
        return item;
      })
    );
    addXP(30, 'Spaced Repetition Completed');
  };

  const saveExamAttempt = (attempt: ExamAttempt) => {
    setExamAttempts((prev) => [attempt, ...prev]);
    addXP(100, `Completed ${attempt.examTitle}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newN: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newN, ...prev]);
  };

  const { signInWithGoogle, logout: authLogout } = useAuth();
  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      setIsOnboarded(true);
      localStorage.setItem('studypilot_onboarded', 'true');
    } catch(err) { console.error(err); }
  };

  const logout = async () => {
    localStorage.removeItem('studypilot_user');
    localStorage.removeItem('studypilot_onboarded');
    localStorage.removeItem('studypilot_progress');
    localStorage.removeItem('studypilot_quizzes');
    localStorage.removeItem('studypilot_notes');
    localStorage.removeItem('studypilot_mistakes');
    localStorage.removeItem('studypilot_revision_queue');
    localStorage.removeItem('studypilot_exams');
    localStorage.removeItem('studypilot_plan');
    localStorage.removeItem('studypilot_achievements');
    localStorage.removeItem('studypilot_notifications');
    setUser(DEFAULT_USER);
    setTopicProgressList([]);
    setQuizAttempts([]);
    setNotesList([]);
    setMistakes([]);
    setRevisionQueue([]);
    setExamAttempts([]);
    setNotifications([]);
    setAchievements(INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, currentCount: 0 })));
    setIsOnboarded(false);
    await authLogout();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isOnboarded,
        activeTab,
        setActiveTab,
        topicProgressList,
        quizAttempts,
        notesList,
        notes: notesList,
        dailyPlan,
        customTimetable,
        setCustomTimetable,
        saveCustomTimetable,
        achievements,
        usageToday,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        activeRecoveryTopic,
        setActiveRecoveryTopic,
        mistakes,
        revisionQueue,
        examAttempts,
        learningProfile,
        notifications,
        selectedChapter,
        setSelectedChapter,
        language,
        setLanguage,
        isOffline,
        isProfileLoading,
        isDarkMode,
        toggleDarkMode,
        isDeepWork,
        toggleDeepWork,
        completeOnboarding,
        updateProfile,
        recordQuizAttempt,
        saveNote,
        updateNote,
        deleteNote,
        toggleFavoriteNote,
        toggleTaskCompletion,
        updateDailyPlan,
        checkAndConsumeUsage,
        upgradeSubscription,
        addXP,
        logout,
        loginWithGoogle,
        addMistake,
        resolveMistake,
        completeRevisionItem,
        saveExamAttempt,
        markNotificationRead,
        addNotification,
        studyGroupMembers,
        inviteStudyPartner,
        removeStudyPartner,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
