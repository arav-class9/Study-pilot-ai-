import {
  NCERTPageContent,
  NCERTQuizQuestion,
  NCERTQuizResult,
  NCERTChapterAnalyticsData,
  NCERTRevisionItem,
  NCERTClass,
  NCERTSubjectId,
  NCERTPageProgress,
  NCERTSelectionActionResult,
  NCERTUploadedBook,
  NCERTFullBookTest,
} from '../types/ncert';
import { CLASS_10_SCIENCE_CH1_PAGES, CLASS_10_MATH_CH4_PAGES, getNCERTChapterById } from '../data/ncertBooksData';
import { extractPDFPages, PDFExtractionProgress } from '../utils/pdfExtractor';
import { processNCERTBook } from '../utils/ncertBookProcessor';
import { NCERTBookStorage } from './ncertBookStorage';
import { auth, db } from '../lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn('Could not retrieve auth token for NCERT API:', err);
  }
  return headers;
}

export class NCERTService {
  /**
   * Fetch or generate page content for any NCERT book page
   */
  static async getPageContent(params: {
    chapterId: string;
    classLevel: NCERTClass;
    subjectId: NCERTSubjectId;
    chapterName: string;
    pageNumber: number;
  }): Promise<NCERTPageContent> {
    const { chapterId, classLevel, subjectId, chapterName, pageNumber } = params;

    // 1. Check preloaded high-fidelity pages
    if (chapterId === 'c10-sci-ch1' && CLASS_10_SCIENCE_CH1_PAGES[pageNumber]) {
      return CLASS_10_SCIENCE_CH1_PAGES[pageNumber];
    }
    if (chapterId === 'c10-math-ch4' && CLASS_10_MATH_CH4_PAGES[pageNumber]) {
      return CLASS_10_MATH_CH4_PAGES[pageNumber];
    }

    // 2. Check local storage cache
    const cacheKey = `ncert_page_${classLevel}_${subjectId}_${chapterId}_p${pageNumber}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }

    // 3. Request from backend AI service
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/ai/ncert-page-content', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          classLevel,
          subject: subjectId,
          chapterName,
          pageNumber,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(json.data));
          } catch (e) {
            // ignore quota exceeded
          }
          return json.data;
        }
      }
    } catch (error) {
      console.error('API /ncert-page-content error:', error);
    }

    // Fallback page
    return {
      pageNumber,
      sectionTitle: `${chapterName} • Page ${pageNumber}`,
      heading: `Study Notes & NCERT Curriculum Concepts`,
      paragraphs: [
        `This section of NCERT Class ${classLevel} ${subjectId} introduces foundational principles for ${chapterName}.`,
        `NCERT textbooks emphasize sequential problem solving, laboratory observations, and standard mathematical formulations.`,
        `Read through the highlighted points below to prepare for the instant page quiz.`,
      ],
      keyConcepts: [
        `Core theoretical formulation for ${chapterName}`,
        `Standard CBSE Board Exam terminology and notations`,
      ],
      ncertHighlights: [
        `NCERT Key Point: Always verify standard definitions and state symbols when answering exam questions.`,
      ],
      pageType: 'theory',
    };
  }

  /**
   * Generate interactive quiz strictly from page content
   */
  static async generateQuizForPage(params: {
    pageContent: string;
    pageNumber: number;
    chapterName: string;
    subject: string;
    classLevel: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
    count?: number;
  }): Promise<NCERTQuizQuestion[]> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ai/ncert-page-quiz', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate page quiz');
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Process uploaded book page (photo or text) via OCR
   */
  static async processUploadedPage(params: {
    image?: string;
    text?: string;
    classLevel?: string;
    subject?: string;
    chapterHint?: string;
  }): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ai/ncert-page-ocr', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process uploaded page');
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Save a completed page quiz result & update chapter analytics
   */
  static async recordQuizResult(result: NCERTQuizResult): Promise<void> {
    const storageKey = `ncert_results_${result.userId}_${result.chapterId}`;
    let history: NCERTQuizResult[] = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) history = JSON.parse(raw);
    } catch (e) {
      // ignore
    }

    history.unshift(result);
    // keep latest 30
    history = history.slice(0, 30);
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (e) {
      // ignore
    }

    // Update page progress
    const pageProgKey = `ncert_page_prog_${result.userId}_${result.chapterId}_p${result.pageNumber}`;
    const prevProgRaw = localStorage.getItem(pageProgKey);
    let prevProg: NCERTPageProgress = prevProgRaw
      ? JSON.parse(prevProgRaw)
      : {
          pageNumber: result.pageNumber,
          isRead: true,
          quizAttemptsCount: 0,
          highestScorePercentage: 0,
          status: 'not_started',
        };

    prevProg.quizAttemptsCount += 1;
    prevProg.lastScorePercentage = result.percentage;
    prevProg.highestScorePercentage = Math.max(prevProg.highestScorePercentage, result.percentage);
    prevProg.status = prevProg.highestScorePercentage >= 80 ? 'mastered' : 'needs_revision';

    try {
      localStorage.setItem(pageProgKey, JSON.stringify(prevProg));
    } catch (e) {
      // ignore
    }

    // Sync to Firestore if authenticated
    try {
      if (auth.currentUser && db) {
        const docRef = doc(db, 'quizAttempts', result.id);
        await setDoc(docRef, {
          ...result,
          type: 'ncert_page_quiz',
          timestamp: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore quiz record sync failed, saved locally:', err);
    }
  }

  /**
   * Get chapter analytics data
   */
  static getChapterAnalytics(params: {
    userId: string;
    chapterId: string;
    totalPages: number;
    chapterName: string;
    subjectId: NCERTSubjectId;
    classLevel: NCERTClass;
  }): NCERTChapterAnalyticsData {
    const { userId, chapterId, totalPages, chapterName, subjectId, classLevel } = params;
    const storageKey = `ncert_results_${userId}_${chapterId}`;
    let attempts: NCERTQuizResult[] = [];

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) attempts = JSON.parse(raw);
    } catch (e) {
      // ignore
    }

    const pageProgressMap: Record<number, NCERTPageProgress> = {};
    let pagesReadCount = 0;
    let pagesMasteredCount = 0;

    for (let p = 1; p <= totalPages; p++) {
      const pageProgKey = `ncert_page_prog_${userId}_${chapterId}_p${p}`;
      const raw = localStorage.getItem(pageProgKey);
      if (raw) {
        const prog = JSON.parse(raw) as NCERTPageProgress;
        pageProgressMap[p] = prog;
        if (prog.isRead) pagesReadCount++;
        if (prog.status === 'mastered') pagesMasteredCount++;
      } else {
        pageProgressMap[p] = {
          pageNumber: p,
          isRead: false,
          quizAttemptsCount: 0,
          highestScorePercentage: 0,
          status: 'not_started',
        };
      }
    }

    let avgScore = 0;
    if (attempts.length > 0) {
      const sum = attempts.reduce((acc, a) => acc + a.percentage, 0);
      avgScore = Math.round(sum / attempts.length);
    }

    const masteryLevelPercentage = Math.min(
      100,
      Math.round(
        (pagesMasteredCount / Math.max(1, totalPages)) * 60 +
          (avgScore * 0.4)
      )
    );

    return {
      chapterId,
      chapterName,
      subjectId,
      classLevel,
      totalPages,
      pagesReadCount,
      pagesMasteredCount,
      totalQuizzesTaken: attempts.length,
      averageScorePercentage: avgScore,
      masteryLevelPercentage,
      weakConcepts: avgScore < 70 ? ['Formula Balancing & Notation', 'In-Text Activities Analysis'] : [],
      strongConcepts: avgScore >= 70 ? ['Core Definitions', 'Physical & Chemical Indicators'] : [],
      pageProgressMap,
      recentAttempts: attempts.slice(0, 10),
    };
  }

  /**
   * Mark a page as read
   */
  static markPageAsRead(userId: string, chapterId: string, pageNumber: number): void {
    const pageProgKey = `ncert_page_prog_${userId}_${chapterId}_p${pageNumber}`;
    try {
      const raw = localStorage.getItem(pageProgKey);
      let prog: NCERTPageProgress = raw
        ? JSON.parse(raw)
        : {
            pageNumber,
            isRead: true,
            quizAttemptsCount: 0,
            highestScorePercentage: 0,
            status: 'read_only',
          };
      prog.isRead = true;
      prog.lastReadDate = new Date().toISOString();
      if (prog.status === 'not_started') {
        prog.status = 'read_only';
      }
      localStorage.setItem(pageProgKey, JSON.stringify(prog));
    } catch (e) {
      // ignore
    }
  }

  /**
   * Add question to Revision Deck
   */
  static addQuestionToRevision(item: NCERTRevisionItem): void {
    const key = `ncert_revision_deck_${item.userId}`;
    let deck: NCERTRevisionItem[] = [];
    try {
      const raw = localStorage.getItem(key);
      if (raw) deck = JSON.parse(raw);
    } catch (e) {
      // ignore
    }

    const existingIndex = deck.findIndex((d) => d.id === item.id);
    if (existingIndex >= 0) {
      deck[existingIndex] = item;
    } else {
      deck.unshift(item);
    }

    try {
      localStorage.setItem(key, JSON.stringify(deck));
    } catch (e) {
      // ignore
    }
  }

  /**
   * Get Revision items
   */
  static getRevisionDeck(userId: string, chapterId?: string): NCERTRevisionItem[] {
    const key = `ncert_revision_deck_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const deck = JSON.parse(raw) as NCERTRevisionItem[];
        if (chapterId) {
          return deck.filter((d) => d.chapterId === chapterId);
        }
        return deck;
      }
    } catch (e) {
      // ignore
    }
    return [];
  }

  /**
   * Mark Revision item mastered or update review
   */
  static updateRevisionItem(userId: string, itemId: string, mastered: boolean): void {
    const key = `ncert_revision_deck_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const deck = JSON.parse(raw) as NCERTRevisionItem[];
        const target = deck.find((d) => d.id === itemId);
        if (target) {
          target.reviewCount += 1;
          target.mastered = mastered;
          target.nextReviewDate = new Date(Date.now() + 86400000 * (mastered ? 7 : 1)).toISOString();
          localStorage.setItem(key, JSON.stringify(deck));
        }
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Execute Action (Notes, Explanation, Strict Quiz) on Selected Textbook Text
   */
  static async executeSelectionAction(params: {
    actionType: 'notes' | 'explain' | 'quiz';
    selectedText: string;
    pageNumber: number;
    chapterName: string;
    subject: string;
    classLevel: string;
  }): Promise<NCERTSelectionActionResult> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ai/ncert-selection-actions', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process selected text.');
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Generate Full-Book / Multi-Chapter Comprehensive Mock Test
   */
  static async generateFullBookTest(params: {
    bookTitle: string;
    classLevel: string;
    subject: string;
    pages: {
      pageNumber: number;
      chapterNumber: number;
      chapterTitle: string;
      sectionTitle: string;
      excerptText: string;
    }[];
    questionCount?: number;
  }): Promise<{ bookTitle: string; totalQuestions: number; questions: NCERTQuizQuestion[] }> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/ai/ncert-fullbook-test', {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate comprehensive NCERT test.');
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Process and index complete NCERT Book PDF
   */
  static async processAndStorePDFBook(
    file: File,
    options: {
      bookTitle?: string;
      classLevel: NCERTClass;
      subjectId: NCERTSubjectId;
    },
    onProgress?: (prog: PDFExtractionProgress) => void
  ): Promise<NCERTUploadedBook> {
    // 1. Extract authentic page-by-page text from PDF
    const pages = await extractPDFPages(file, onProgress);
    if (pages.length === 0) {
      throw new Error('No readable text could be extracted from this PDF.');
    }

    // 2. Automatically detect chapters, headings, topics, exercises, diagrams, formulas & search index
    const processedBook = processNCERTBook(pages, {
      bookTitle: options.bookTitle,
      classLevel: options.classLevel,
      subjectId: options.subjectId,
      fileName: file.name,
      fileSize: file.size,
    });

    // 3. Save to storage
    await NCERTBookStorage.saveBook(processedBook);

    return processedBook;
  }
}

