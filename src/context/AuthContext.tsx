import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase/config';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously
} from 'firebase/auth';
import { DatabaseService } from '../lib/firebase/db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInGuest: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

/**
 * Ensures no local storage keys containing 'demo' or 'mock' data exist,
 * and clears cached user telemetry if the cached UID does not match the active user.
 */
export const purgeMismatchedStorage = (activeUid?: string | null) => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('demo') || 
          lowerKey.includes('mock') || 
          lowerKey.includes('sample') ||
          lowerKey.includes('pilot-student')
        ) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    const savedUserStr = localStorage.getItem('studypilot_user');
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        if (!activeUid || !parsed?.uid || parsed.uid !== activeUid || parsed.uid === 'pilot-student-001') {
          const oldUid = parsed?.uid;
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
          localStorage.removeItem('studypilot_custom_timetable');
          localStorage.removeItem('studypilot_study_group');
          if (oldUid) {
            localStorage.removeItem(`studypilot_custom_timetable_${oldUid}`);
            localStorage.removeItem(`studypilot_plan_${oldUid}`);
            localStorage.removeItem(`studypilot_study_group_${oldUid}`);
            localStorage.removeItem(`studypilot_topic_workspaces_${oldUid}`);
          }
        }
      } catch {
        localStorage.removeItem('studypilot_user');
      }
    }
  } catch (err) {
    console.warn('Storage purge warning:', err);
  }
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Purge any stale mock/demo keys and clear cache if UID does not match
      purgeMismatchedStorage(currentUser?.uid);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      purgeMismatchedStorage(res.user.uid);
      const existing = await DatabaseService.getProfile(res.user.uid);
      if (!existing) {
        await DatabaseService.createInitialUserProfile(res.user.uid, res.user);
      }
    }
  };

  const signInGuest = async () => {
    try {
      const res = await signInAnonymously(auth);
      if (res.user) {
        purgeMismatchedStorage(res.user.uid);
        const existing = await DatabaseService.getProfile(res.user.uid);
        if (!existing) {
          await DatabaseService.createInitialUserProfile(res.user.uid, {
            displayName: 'Guest Student',
            email: 'guest@studypilot.ai',
          } as any);
        }
      }
    } catch (err: any) {
      console.warn('Anonymous auth unavailable, trying demo guest fallback:', err);
      try {
        await signInWithEmailAndPassword(auth, 'guest.student@studypilot.ai', 'StudyPilot123!');
      } catch {
        try {
          const res = await createUserWithEmailAndPassword(auth, 'guest.student@studypilot.ai', 'StudyPilot123!');
          if (res.user) {
            purgeMismatchedStorage(res.user.uid);
            await DatabaseService.createInitialUserProfile(res.user.uid, {
              displayName: 'Guest Student',
              email: 'guest.student@studypilot.ai',
            } as any);
          }
        } catch {
          throw err;
        }
      }
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      purgeMismatchedStorage(res.user.uid);
    }
  };

  const signup = async (email: string, pass: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      purgeMismatchedStorage(res.user.uid);
      await DatabaseService.createInitialUserProfile(res.user.uid, res.user);
    }
  };

  const logout = async () => {
    purgeMismatchedStorage(null);
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInGuest, logout, login, signup, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
