import { NCERTChapter, NCERTSubject, NCERTClass } from '../types/ncert';
import { COMPREHENSIVE_NCERT_CATALOG } from './ncertCurriculumCatalog';

// Re-export authentic preloaded textbook page repositories
export {
  CLASS_10_SCIENCE_CH1_PAGES,
  CLASS_10_MATH_CH4_PAGES,
} from './ncertCorePages';

export {
  CLASS_9_SCIENCE_CH1_PAGES,
  CLASS_10_SCIENCE_CH2_PAGES,
  CLASS_12_PHYSICS_CH1_PAGES,
} from './ncertExtendedPages';

export {
  CLASS_9_MATH_CH2_PAGES,
} from './ncertPolynomialsData';

// Comprehensive Supported NCERT Subjects & Catalog
export const NCERT_SUBJECTS_CATALOG: NCERTSubject[] = COMPREHENSIVE_NCERT_CATALOG;

export function getNCERTSubjectById(subjectId: string): NCERTSubject | undefined {
  return NCERT_SUBJECTS_CATALOG.find((s) => s.id === subjectId);
}

export function getNCERTChaptersForClass(classLevel: NCERTClass, subjectId?: string): NCERTChapter[] {
  const result: NCERTChapter[] = [];
  for (const subject of NCERT_SUBJECTS_CATALOG) {
    if (subjectId && subject.id !== subjectId) continue;
    for (const chapter of subject.chapters) {
      if (chapter.classLevel === classLevel) {
        result.push(chapter);
      }
    }
  }
  return result;
}

export function getNCERTChapterById(chapterId: string): NCERTChapter | undefined {
  for (const subject of NCERT_SUBJECTS_CATALOG) {
    const found = subject.chapters.find((c) => c.id === chapterId);
    if (found) return found;
  }
  return undefined;
}
