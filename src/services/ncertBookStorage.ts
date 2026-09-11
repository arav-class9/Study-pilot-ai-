import {
  NCERTUploadedBook,
  NCERTHighlight,
  NCERTFullBookTest,
  NCERTWeakTopicInfo,
  NCERTClass,
  NCERTSubjectId,
} from '../types/ncert';
import { CLASS_10_SCIENCE_CH1_PAGES, CLASS_10_MATH_CH4_PAGES } from '../data/ncertBooksData';

const DB_NAME = 'studypilot_ncert_db';
const DB_VERSION = 1;
const BOOKS_STORE = 'uploaded_books';
const HIGHLIGHTS_STORE = 'highlights';
const TESTS_STORE = 'fullbook_tests';
const WEAK_TOPICS_STORE = 'weak_topics';

/**
 * Open or initialize IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(HIGHLIGHTS_STORE)) {
        const hStore = db.createObjectStore(HIGHLIGHTS_STORE, { keyPath: 'id' });
        hStore.createIndex('by_book', 'bookId', { unique: false });
      }
      if (!db.objectStoreNames.contains(TESTS_STORE)) {
        db.createObjectStore(TESTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(WEAK_TOPICS_STORE)) {
        db.createObjectStore(WEAK_TOPICS_STORE, { keyPath: 'topicName' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class NCERTBookStorage {
  /**
   * Save a newly uploaded & processed NCERT Book
   */
  static async saveBook(book: NCERTUploadedBook): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(BOOKS_STORE, 'readwrite');
        const store = tx.objectStore(BOOKS_STORE);
        const req = store.put(book);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB save failed, falling back to localStorage for book summary:', err);
      // Fallback: save book metadata to localStorage
      try {
        const list = this.getBooksListFromLocalStorage();
        const existingIdx = list.findIndex((b) => b.id === book.id);
        const summary = {
          id: book.id,
          title: book.title,
          fileName: book.fileName,
          fileSize: book.fileSize,
          classLevel: book.classLevel,
          subjectId: book.subjectId,
          uploadedAt: book.uploadedAt,
          totalPages: book.totalPages,
          source: book.source,
          chaptersCount: book.chapters.length,
        };
        if (existingIdx >= 0) list[existingIdx] = summary;
        else list.unshift(summary);
        localStorage.setItem('ncert_uploaded_books_meta', JSON.stringify(list));
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Get all uploaded NCERT Books
   */
  static async getAllBooks(): Promise<NCERTUploadedBook[]> {
    try {
      const db = await openDB();
      return await new Promise<NCERTUploadedBook[]>((resolve, reject) => {
        const tx = db.transaction(BOOKS_STORE, 'readonly');
        const store = tx.objectStore(BOOKS_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          const results = req.result as NCERTUploadedBook[];
          if (results.length > 0) {
            resolve(results);
          } else {
            // If empty, return standard official NCERT book preset
            const defaultBook = NCERTBookStorage.generateOfficialPresetBook();
            NCERTBookStorage.saveBook(defaultBook).catch(() => {});
            resolve([defaultBook]);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB read failed:', err);
      return [NCERTBookStorage.generateOfficialPresetBook()];
    }
  }

  /**
   * Get a single book by ID
   */
  static async getBookById(id: string): Promise<NCERTUploadedBook | null> {
    try {
      const db = await openDB();
      return await new Promise<NCERTUploadedBook | null>((resolve, reject) => {
        const tx = db.transaction(BOOKS_STORE, 'readonly');
        const store = tx.objectStore(BOOKS_STORE);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB getBookById error:', err);
      return null;
    }
  }

  /**
   * Delete an uploaded book
   */
  static async deleteBook(id: string): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(BOOKS_STORE, 'readwrite');
        const store = tx.objectStore(BOOKS_STORE);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Delete book error:', err);
    }
  }

  // --- Highlights Storage ---

  static async saveHighlight(highlight: NCERTHighlight): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(HIGHLIGHTS_STORE, 'readwrite');
        const store = tx.objectStore(HIGHLIGHTS_STORE);
        const req = store.put(highlight);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      // LocalStorage fallback
      const key = `ncert_hl_${highlight.chapterId}_p${highlight.pageNumber}`;
      try {
        const list: NCERTHighlight[] = JSON.parse(localStorage.getItem(key) || '[]');
        list.push(highlight);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (e) {}
    }
  }

  static async getHighlights(chapterId: string, pageNumber?: number): Promise<NCERTHighlight[]> {
    try {
      const db = await openDB();
      return await new Promise<NCERTHighlight[]>((resolve, reject) => {
        const tx = db.transaction(HIGHLIGHTS_STORE, 'readonly');
        const store = tx.objectStore(HIGHLIGHTS_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          let list = (req.result as NCERTHighlight[]) || [];
          list = list.filter((h) => h.chapterId === chapterId);
          if (pageNumber !== undefined) {
            list = list.filter((h) => h.pageNumber === pageNumber);
          }
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      const key = `ncert_hl_${chapterId}${pageNumber !== undefined ? `_p${pageNumber}` : ''}`;
      try {
        return JSON.parse(localStorage.getItem(key) || '[]');
      } catch (e) {
        return [];
      }
    }
  }

  static async deleteHighlight(id: string): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(HIGHLIGHTS_STORE, 'readwrite');
        const store = tx.objectStore(HIGHLIGHTS_STORE);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {}
  }

  // --- Weak Topics Storage & Analytics ---

  static recordTopicAttempt(topic: {
    topicName: string;
    chapterNumber: number;
    chapterTitle: string;
    sourcePageNumber: number;
    isCorrect: boolean;
  }): void {
    const key = `ncert_weak_topic_${topic.topicName.toLowerCase().replace(/\s+/g, '_')}`;
    try {
      const raw = localStorage.getItem(key);
      const existing: NCERTWeakTopicInfo = raw
        ? JSON.parse(raw)
        : {
            topicName: topic.topicName,
            chapterNumber: topic.chapterNumber,
            chapterTitle: topic.chapterTitle,
            sourcePageNumber: topic.sourcePageNumber,
            accuracyPercentage: 100,
            attemptsCount: 0,
            lastTestedDate: new Date().toISOString(),
          };

      existing.attemptsCount += 1;
      const previousTotalCorrect = Math.round(
        (existing.accuracyPercentage / 100) * (existing.attemptsCount - 1)
      );
      const newTotalCorrect = previousTotalCorrect + (topic.isCorrect ? 1 : 0);
      existing.accuracyPercentage = Math.round((newTotalCorrect / existing.attemptsCount) * 100);
      existing.lastTestedDate = new Date().toISOString();

      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {}
  }

  static getWeakTopics(chapterTitle?: string): NCERTWeakTopicInfo[] {
    const list: NCERTWeakTopicInfo[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ncert_weak_topic_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const topic = JSON.parse(raw) as NCERTWeakTopicInfo;
            if (topic.accuracyPercentage < 65 && topic.attemptsCount >= 1) {
              if (!chapterTitle || topic.chapterTitle === chapterTitle) {
                list.push(topic);
              }
            }
          }
        }
      }
    } catch (e) {}

    // Sort by lowest accuracy first
    return list.sort((a, b) => a.accuracyPercentage - b.accuracyPercentage);
  }

  // --- Official NCERT Sample Preset Generator ---

  static generateOfficialPresetBook(): NCERTUploadedBook {
    const pages: Record<number, any> = {};

    // Transform preloaded Class 10 Science Ch 1 pages into processed pages
    Object.entries(CLASS_10_SCIENCE_CH1_PAGES).forEach(([pageStr, p]) => {
      const pageNum = parseInt(pageStr, 10);
      pages[pageNum] = {
        pageNumber: pageNum,
        chapterNumber: 1,
        chapterTitle: 'Chemical Reactions and Equations',
        sectionTitle: p.sectionTitle,
        heading: p.heading,
        topics: p.keyConcepts,
        paragraphs: p.paragraphs,
        rawText: p.paragraphs.join('\n\n'),
        diagrams: (p.activities || []).map((a) => ({
          label: a.activityNumber,
          title: a.title,
          pageNumber: pageNum,
          description: `${a.procedure} • Observation: ${a.observation}`,
        })),
        exercises: (p.inTextQuestions || []).length > 0
          ? [
              {
                title: `In-Text Questions (Page ${pageNum})`,
                pageNumber: pageNum,
                questions: (p.inTextQuestions || []).map((q) => q.question),
              },
            ]
          : [],
        formulas: p.formulas,
        inTextQuestions: p.inTextQuestions,
        ncertHighlights: p.ncertHighlights,
        vocabulary: p.vocabulary,
        pageType: p.pageType,
      };
    });

    return {
      id: 'official_ncert_class10_science',
      title: 'Official NCERT Class 10 Science (Textbook Edition)',
      fileName: 'NCERT_Class_10_Science_Official.pdf',
      fileSize: 4280000,
      classLevel: '10',
      subjectId: 'science',
      uploadedAt: '2026-09-10T10:00:00.000Z',
      totalPages: 16,
      source: 'official_ncert_pdf',
      chapters: [
        {
          id: 'official_c10_sci_ch1',
          chapterNumber: 1,
          title: 'Chemical Reactions and Equations',
          startPage: 1,
          endPage: 16,
          totalPages: 16,
          headings: [
            '1.1 CHEMICAL EQUATIONS',
            '1.1.1 Writing a Chemical Equation',
            '1.1.2 Balanced Chemical Equations',
            '1.2 TYPES OF CHEMICAL REACTIONS',
            '1.2.1 Combination Reaction',
            '1.2.2 Decomposition Reaction',
            '1.2.3 Displacement Reaction',
            '1.2.4 Double Displacement Reaction',
            '1.2.5 Oxidation and Reduction',
            '1.3 HAVE YOU OBSERVED THE EFFECTS OF OXIDATION REACTIONS IN EVERYDAY LIFE?',
          ],
          topics: [
            'Characteristics of Chemical Reactions',
            'Law of Conservation of Mass in Chemical Equations',
            'Balancing Chemical Equations by Hit and Trial',
            'Exothermic vs Endothermic Reactions',
            'Thermal, Electrolytic, and Photochemical Decomposition',
            'Reactivity Series and Displacement',
            'Precipitation Reactions',
            'Redox Processes and Electron Transfer',
            'Corrosion of Metals and Prevention',
            'Rancidity of Fats and Oils',
          ],
          exercises: [
            {
              title: 'In-Text Exercises (Page 6)',
              pageNumber: 6,
              questions: ['Why should a magnesium ribbon be cleaned before burning in air?'],
            },
            {
              title: 'In-Text Exercises (Page 10)',
              pageNumber: 10,
              questions: ['A solution of a substance X is used for whitewashing. Name substance X.'],
            },
            {
              title: 'Chapter End Exercises (Page 15-16)',
              pageNumber: 15,
              questions: ['Which of the statements about the reaction below are incorrect? 2PbO + C -> 2Pb + CO2'],
            },
          ],
          diagrams: [
            {
              label: 'Activity 1.1',
              title: 'Burning of a magnesium ribbon in air and collection of magnesium oxide',
              pageNumber: 1,
            },
            {
              label: 'Activity 1.2',
              title: 'Action of dilute sulphuric acid on zinc granules',
              pageNumber: 2,
            },
            {
              label: 'Activity 1.6',
              title: 'Electrolysis of water producing hydrogen and oxygen gases',
              pageNumber: 8,
            },
          ],
          summaryPoints: [
            'A complete chemical equation represents the reactants, products and their physical states symbolically.',
            'A chemical equation is balanced so that the numbers of atoms of each type involved in a chemical reaction are the same on the reactant and product sides.',
            'In a combination reaction two or more substances combine to form a new single substance.',
            'Decomposition reactions are opposite to combination reactions.',
            'Reactions in which energy is absorbed are known as endothermic reactions.',
          ],
        },
      ],
      pages,
      searchIndex: [
        {
          pageNumber: 1,
          chapterNumber: 1,
          chapterTitle: 'Chemical Reactions and Equations',
          sectionTitle: '1.1 CHEMICAL EQUATIONS',
          matchSnippet: 'Consider the following situations of daily life: milk is left at room temperature...',
          type: 'heading',
        },
        {
          pageNumber: 3,
          chapterNumber: 1,
          chapterTitle: 'Chemical Reactions and Equations',
          sectionTitle: '1.1.2 Balanced Chemical Equations',
          matchSnippet: 'Recall the law of conservation of mass that you studied in Class IX...',
          type: 'topic',
        },
        {
          pageNumber: 6,
          chapterNumber: 1,
          chapterTitle: 'Chemical Reactions and Equations',
          sectionTitle: '1.2.1 Combination Reaction',
          matchSnippet: 'Calcium oxide reacts vigorously with water to produce slaked lime (calcium hydroxide)...',
          type: 'topic',
        },
      ],
    };
  }

  private static getBooksListFromLocalStorage(): any[] {
    try {
      const raw = localStorage.getItem('ncert_uploaded_books_meta');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
