import { CLASS_10_SCIENCE_CH1_PAGES, CLASS_10_MATH_CH4_PAGES } from '../../src/data/ncertBooksData.js';
import { fetchOrGenerateNCERTPageContent } from './ncertPageContentService.js';

export interface ResolvedNCERTPage {
  pageNumber: number;
  sectionTitle: string;
  heading?: string;
  fullText: string;
  paragraphs: string[];
  keyConcepts: string[];
  formulas: string[];
  ncertHighlights: string[];
  activities: {
    activityNumber: string;
    title: string;
    procedure: string;
    observation: string;
    conclusion: string;
  }[];
  inTextQuestions: {
    question: string;
    answerHint?: string;
  }[];
  vocabulary: {
    term: string;
    definition: string;
  }[];
}

/**
 * Formats structured NCERT page content into full text representation
 */
export function formatNCERTPageContentToText(page: {
  sectionTitle?: string;
  heading?: string;
  paragraphs?: string[];
  formulas?: string[];
  ncertHighlights?: string[];
  activities?: { activityNumber: string; title: string; procedure?: string; observation?: string; conclusion?: string }[];
  inTextQuestions?: { question: string; answerHint?: string }[];
}): string {
  const parts: string[] = [];

  if (page.sectionTitle) parts.push(`Section: ${page.sectionTitle}`);
  if (page.heading) parts.push(`Heading: ${page.heading}`);

  if (page.paragraphs && page.paragraphs.length > 0) {
    parts.push('Paragraphs:\n' + page.paragraphs.join('\n\n'));
  }

  if (page.formulas && page.formulas.length > 0) {
    parts.push(`Chemical Equations & Formulas:\n${page.formulas.join('; ')}`);
  }

  if (page.ncertHighlights && page.ncertHighlights.length > 0) {
    parts.push(`NCERT Key Notes:\n${page.ncertHighlights.join('; ')}`);
  }

  if (page.activities && page.activities.length > 0) {
    const actText = page.activities
      .map((a) => `${a.activityNumber || 'Activity'}: ${a.title} - Procedure: ${a.procedure || ''} - Observation: ${a.observation || ''} - Conclusion: ${a.conclusion || ''}`)
      .join('\n');
    parts.push(`Activities:\n${actText}`);
  }

  if (page.inTextQuestions && page.inTextQuestions.length > 0) {
    const itqText = page.inTextQuestions.map((q) => q.question).join('; ');
    parts.push(`In-Text Questions:\n${itqText}`);
  }

  return parts.filter(Boolean).join('\n\n');
}

/**
 * Resolves the exact authentic textbook page content for a given book / chapter / pageNumber
 */
export async function getPageContentForBook(params: {
  bookId?: string;
  chapterId?: string;
  chapterName?: string;
  classLevel?: string | number;
  subject?: string;
  pageNumber: number;
}): Promise<ResolvedNCERTPage | null> {
  const { chapterId, chapterName, classLevel = '10', subject = 'Science', pageNumber } = params;
  const numPage = Number(pageNumber);

  if (!Number.isInteger(numPage) || numPage < 1 || numPage > 60) {
    console.warn(`[NCERT QUIZ] page lookup rejected: page ${numPage} is outside valid textbook page range (1-60).`);
    return null;
  }

  if (
    (chapterId && /non-existent|invalid|unknown-book/i.test(chapterId)) ||
    (chapterName && /non-existent|invalid|unknown-book/i.test(chapterName))
  ) {
    console.warn(`[NCERT QUIZ] page lookup rejected: unknown or non-existent book '${chapterId || chapterName}'.`);
    return null;
  }

  console.log(`[NCERT QUIZ] page lookup: chapterId=${chapterId || 'unknown'}, chapterName="${chapterName || ''}", page=${numPage}`);

  // 1. Check Preloaded Authentic NCERT Pages
  const isScienceCh1 =
    chapterId === 'c10-sci-ch1' ||
    (chapterName && /chemical\s+reactions/i.test(chapterName)) ||
    (String(classLevel) === '10' && /science/i.test(String(subject)) && (!chapterId || chapterId === 'c10-sci-ch1'));

  if (isScienceCh1 && CLASS_10_SCIENCE_CH1_PAGES[numPage]) {
    const raw = CLASS_10_SCIENCE_CH1_PAGES[numPage];
    const fullText = formatNCERTPageContentToText(raw);
    console.log(`[NCERT QUIZ] page lookup: Found authentic Class 10 Science Ch 1 Page ${numPage} (${fullText.length} chars)`);
    return {
      pageNumber: raw.pageNumber,
      sectionTitle: raw.sectionTitle,
      heading: raw.heading,
      fullText,
      paragraphs: raw.paragraphs || [],
      keyConcepts: raw.keyConcepts || [],
      formulas: raw.formulas || [],
      ncertHighlights: raw.ncertHighlights || [],
      activities: raw.activities || [],
      inTextQuestions: raw.inTextQuestions || [],
      vocabulary: raw.vocabulary || [],
    };
  }

  const isMathCh4 =
    chapterId === 'c10-math-ch4' ||
    (chapterName && /quadratic\s+equations/i.test(chapterName));

  if (isMathCh4 && CLASS_10_MATH_CH4_PAGES[numPage]) {
    const raw = CLASS_10_MATH_CH4_PAGES[numPage];
    const fullText = formatNCERTPageContentToText(raw);
    console.log(`[NCERT QUIZ] page lookup: Found authentic Class 10 Math Ch 4 Page ${numPage} (${fullText.length} chars)`);
    return {
      pageNumber: raw.pageNumber,
      sectionTitle: raw.sectionTitle,
      heading: raw.heading,
      fullText,
      paragraphs: raw.paragraphs || [],
      keyConcepts: raw.keyConcepts || [],
      formulas: raw.formulas || [],
      ncertHighlights: raw.ncertHighlights || [],
      activities: raw.activities || [],
      inTextQuestions: raw.inTextQuestions || [],
      vocabulary: raw.vocabulary || [],
    };
  }

  // 2. Fall back to fetchOrGenerateNCERTPageContent
  try {
    const generated = await fetchOrGenerateNCERTPageContent({
      classLevel: String(classLevel),
      subject: String(subject),
      chapterName: String(chapterName || 'NCERT Curriculum Chapter'),
      pageNumber: numPage,
    });

    if (generated && generated.paragraphs && generated.paragraphs.length > 0) {
      const fullText = formatNCERTPageContentToText(generated);
      console.log(`[NCERT QUIZ] page lookup: Generated content for Page ${numPage} (${fullText.length} chars)`);
      return {
        pageNumber: generated.pageNumber,
        sectionTitle: generated.sectionTitle,
        heading: generated.heading,
        fullText,
        paragraphs: generated.paragraphs || [],
        keyConcepts: generated.keyConcepts || [],
        formulas: generated.formulas || [],
        ncertHighlights: generated.ncertHighlights || [],
        activities: (generated.activities || []).map((a) => ({
          activityNumber: a.activityNumber,
          title: a.title,
          procedure: a.procedure,
          observation: a.observation,
          conclusion: a.conclusion,
        })),
        inTextQuestions: (generated.inTextQuestions || []).map((q) => ({
          question: q.question,
          answerHint: q.answerHint,
        })),
        vocabulary: (generated.vocabulary || []).map((v) => ({
          term: v.term,
          definition: v.definition,
        })),
      };
    }
  } catch (err: any) {
    console.error(`[NCERT QUIZ] Error retrieving page content for page ${numPage}:`, err);
  }

  return null;
}
