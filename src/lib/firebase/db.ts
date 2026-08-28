import { db } from './config';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, deleteDoc, serverTimestamp, writeBatch 
} from 'firebase/firestore';

export class DatabaseService {
  // Profiles
  static async getProfile(userId: string) {
    try {
      const d = await getDoc(doc(db, 'profiles', userId));
      return d.exists() ? d.data() : null;
    } catch (e: any) {
      console.warn('getProfile offline error', e.message);
      return null;
    }
  }

  static async createInitialUserProfile(
    userId: string,
    authUser: { email?: string | null; displayName?: string | null; photoURL?: string | null }
  ) {
    const defaultData = {
      uid: userId,
      userId: userId,
      name: authUser.displayName || (authUser.email ? authUser.email.split('@')[0] : 'Student Pilot'),
      email: authUser.email || '',
      photoURL: authUser.photoURL || null,
      classLevel: '9',
      board: 'CBSE',
      subjects: ['math', 'science', 'english'],
      goals: ['Improve school marks', 'Master CBSE Class 9 concepts'],
      dailyStudyMinutes: 60,
      examDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],

      // Explicit numeric zero-values
      totalXP: 0,
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
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
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    try {
      await setDoc(doc(db, 'profiles', userId), defaultData, { merge: true });
      return defaultData;
    } catch (e: any) {
      console.warn('createInitialUserProfile error', e.message);
      return defaultData;
    }
  }

  static async setProfile(userId: string, data: any) {
    try {
      await setDoc(doc(db, 'profiles', userId), { ...data, userId, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e: any) {
      console.warn('setProfile offline error', e.message);
    }
  }
  static async updateUserXP(userId: string, totalXP: number, level: number) {
    try {
      await setDoc(
        doc(db, 'profiles', userId),
        {
          totalXP,
          xp: totalXP,
          level,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e: any) {
      console.warn('updateUserXP offline error', e.message);
    }
  }

  // Quiz Attempts
  static async saveQuizAttempt(userId: string, attempt: any) {
    const ref = doc(collection(db, 'quizAttempts'));
    try {
      await setDoc(ref, { ...attempt, id: ref.id, userId, timestamp: serverTimestamp() });
    } catch (e: any) {
      console.warn('saveQuizAttempt offline error', e.message);
    }
    return ref.id;
  }
  static async getQuizAttempts(userId: string) {
    const q = query(collection(db, 'quizAttempts'), where('userId', '==', userId), orderBy('timestamp', 'desc'));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e: any) {
      console.warn('getDocs offline error', e.message);
      return [];
    }
  }

  // Study Plans
  static async getStudyPlans(userId: string) {
    const q = query(collection(db, 'studyPlans'), where('userId', '==', userId));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e: any) {
      console.warn('getDocs offline error', e.message);
      return [];
    }
  }
  static async saveStudyPlan(userId: string, planId: string, data: any) {
    try {
      await setDoc(doc(db, 'studyPlans', planId), { ...data, userId, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e: any) {
      console.warn('saveStudyPlan offline error', e.message);
    }
  }

  // Mistakes
  static async saveMistake(userId: string, mistake: any) {
    const ref = doc(collection(db, 'mistakes'));
    const id = mistake.id || ref.id;
    try {
      await setDoc(doc(db, 'mistakes', id), { ...mistake, id, userId, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e: any) {
      console.warn('saveMistake offline error', e.message);
    }
  }
  static async getMistakes(userId: string) {
    const q = query(collection(db, 'mistakes'), where('userId', '==', userId));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e: any) {
      console.warn('getMistakes offline error', e.message);
      return [];
    }
  }

  // Revision Items
  static async saveRevisionItem(userId: string, item: any) {
    const ref = doc(collection(db, 'revisionItems'));
    const id = item.id || ref.id;
    try {
      await setDoc(doc(db, 'revisionItems', id), { ...item, id, userId, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e: any) {
      console.warn('saveRevisionItem offline error', e.message);
    }
  }
  static async getRevisionItems(userId: string) {
    const q = query(collection(db, 'revisionItems'), where('userId', '==', userId));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e: any) {
      console.warn('getRevisionItems offline error', e.message);
      return [];
    }
  }

  // Exam Attempts
  static async saveExamAttempt(userId: string, attempt: any) {
    const ref = doc(collection(db, 'examAttempts'));
    const id = attempt.id || ref.id;
    try {
      await setDoc(doc(db, 'examAttempts', id), { ...attempt, id, userId, timestamp: serverTimestamp() }, { merge: true });
    } catch (e: any) {
      console.warn('saveExamAttempt offline error', e.message);
    }
    return id;
  }
  static async getExamAttempts(userId: string) {
    const q = query(collection(db, 'examAttempts'), where('userId', '==', userId));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e: any) {
      console.warn('getExamAttempts offline error', e.message);
      return [];
    }
  }

  // AI Conversations
  static async saveConversation(userId: string, conv: any) {
    const ref = doc(db, 'aiConversations', conv.id);
    try {
      await setDoc(ref, { ...conv, userId, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e: any) {
      console.warn('saveConversation offline error', e.message);
    }
  }
}
