import {
  NCERTClass,
  NCERTSubjectId,
  NCERTUploadedBook,
  NCERTDetectedChapter,
  NCERTProcessedBookPage,
  NCERTBookSearchIndexEntry,
  NCERTBookDiagramRef,
  NCERTBookExerciseRef,
} from '../types/ncert';
import { ExtractedPage } from './pdfExtractor';

export interface ProcessBookOptions {
  bookTitle?: string;
  classLevel: NCERTClass;
  subjectId: NCERTSubjectId;
  fileName: string;
  fileSize: number;
}

// Known NCERT standard chapter titles by class and subject for boundary cross-validation
const KNOWN_NCERT_CHAPTERS: Record<string, string[]> = {
  '10-science': [
    'Chemical Reactions and Equations',
    'Acids, Bases and Salts',
    'Metals and Non-metals',
    'Carbon and its Compounds',
    'Life Processes',
    'Control and Coordination',
    'How do Organisms Reproduce?',
    'Heredity',
    'Light – Reflection and Refraction',
    'The Human Eye and the Colourful World',
    'Electricity',
    'Magnetic Effects of Electric Current',
    'Our Environment',
  ],
  '10-math': [
    'Real Numbers',
    'Polynomials',
    'Pair of Linear Equations in Two Variables',
    'Quadratic Equations',
    'Arithmetic Progressions',
    'Triangles',
    'Coordinate Geometry',
    'Introduction to Trigonometry',
    'Some Applications of Trigonometry',
    'Circles',
    'Areas Related to Circles',
    'Surface Areas and Volumes',
    'Statistics',
    'Probability',
  ],
  '9-science': [
    'Matter in Our Surroundings',
    'Is Matter Around Us Pure',
    'Atoms and Molecules',
    'Structure of the Atom',
    'The Fundamental Unit of Life',
    'Tissues',
    'Motion',
    'Force and Laws of Motion',
    'Gravitation',
    'Work and Energy',
    'Sound',
    'Improvement in Food Resources',
  ],
};

/**
 * Automatically processes extracted PDF pages into structured chapters,
 * headings, topics, exercises, diagrams, formulas, and a searchable index.
 * Strictly preserves authentic textbook text.
 */
export function processNCERTBook(
  extractedPages: ExtractedPage[],
  options: ProcessBookOptions
): NCERTUploadedBook {
  const { classLevel, subjectId, fileName, fileSize } = options;
  const bookId = `ncert_book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Step 1: Detect Chapter Boundaries across all pages
  const chapterBreakpoints: {
    chapterNumber: number;
    title: string;
    startPage: number;
  }[] = [];

  const knownList = KNOWN_NCERT_CHAPTERS[`${classLevel}-${subjectId}`] || [];

  extractedPages.forEach((p) => {
    const textUpper = p.text.toUpperCase();
    const lines = p.lines;

    // Check for explicit "CHAPTER X" or "CHAPTER 0X" or "CH-X"
    let matchedChapterNum: number | null = null;
    let matchedTitle: string | null = null;

    for (let i = 0; i < Math.min(lines.length, 12); i++) {
      const line = lines[i].trim();
      const chMatch = line.match(/^CHAPTER\s+(\d+)/i) || line.match(/^CH(?:APTER)?[- ]?(\d+)/i);
      if (chMatch) {
        matchedChapterNum = parseInt(chMatch[1], 10);
        // Next line or rest of line usually contains the chapter title
        const restOfLine = line.replace(/^CHAPTER\s+\d+[:.\s-]*/i, '').trim();
        if (restOfLine.length > 3) {
          matchedTitle = restOfLine;
        } else if (i + 1 < lines.length && lines[i + 1].trim().length > 3) {
          matchedTitle = lines[i + 1].trim();
        }
        break;
      }
    }

    // Secondary check against known NCERT titles if not matched explicitly
    if (matchedChapterNum === null) {
      for (let k = 0; k < knownList.length; k++) {
        const knownTitle = knownList[k];
        if (textUpper.includes(knownTitle.toUpperCase())) {
          // Check if it looks like a title at the top of the page
          const topText = lines.slice(0, 8).join(' ').toUpperCase();
          if (topText.includes(knownTitle.toUpperCase())) {
            matchedChapterNum = k + 1;
            matchedTitle = knownTitle;
            break;
          }
        }
      }
    }

    if (matchedChapterNum !== null) {
      // Avoid duplicate trigger for same chapter unless gap
      const last = chapterBreakpoints[chapterBreakpoints.length - 1];
      if (!last || last.chapterNumber !== matchedChapterNum) {
        chapterBreakpoints.push({
          chapterNumber: matchedChapterNum,
          title: matchedTitle || `Chapter ${matchedChapterNum}`,
          startPage: p.pageNumber,
        });
      }
    }
  });

  // If no chapter boundaries detected (e.g. single chapter PDF uploaded from NCERT like jesc101.pdf),
  // detect from first page or filename
  if (chapterBreakpoints.length === 0) {
    let defaultTitle = options.bookTitle || 'NCERT Chapter Study Unit';
    let defaultNum = 1;

    // Check filename e.g. jesc101.pdf -> Ch 1, jesc104.pdf -> Ch 4
    const fileChMatch = fileName.match(/[a-z]+(\d{1,2})\.pdf/i);
    if (fileChMatch) {
      const chIdx = parseInt(fileChMatch[1], 10);
      if (chIdx > 0) {
        defaultNum = chIdx;
        if (knownList[chIdx - 1]) {
          defaultTitle = knownList[chIdx - 1];
        }
      }
    }

    chapterBreakpoints.push({
      chapterNumber: defaultNum,
      title: defaultTitle,
      startPage: 1,
    });
  }

  // Finalize chapter ranges
  const detectedChapters: NCERTDetectedChapter[] = [];
  for (let c = 0; c < chapterBreakpoints.length; c++) {
    const cur = chapterBreakpoints[c];
    const next = chapterBreakpoints[c + 1];
    const endPage = next ? next.startPage - 1 : extractedPages.length;
    const totalChapterPages = Math.max(1, endPage - cur.startPage + 1);

    detectedChapters.push({
      id: `${bookId}-ch${cur.chapterNumber}`,
      chapterNumber: cur.chapterNumber,
      title: cur.title,
      startPage: cur.startPage,
      endPage,
      totalPages: totalChapterPages,
      headings: [],
      topics: [],
      exercises: [],
      diagrams: [],
      summaryPoints: [],
    });
  }

  // Step 2: Process Each Page in detail
  const processedPages: Record<number, NCERTProcessedBookPage> = {};
  const searchIndex: NCERTBookSearchIndexEntry[] = [];

  extractedPages.forEach((p) => {
    // Find active chapter for this page
    const activeCh =
      detectedChapters.find((ch) => p.pageNumber >= ch.startPage && p.pageNumber <= ch.endPage) ||
      detectedChapters[0];

    const lines = p.lines;
    const pageHeadings: string[] = [];
    const pageTopics: string[] = [];
    const pageDiagrams: NCERTBookDiagramRef[] = [];
    const pageExercises: NCERTBookExerciseRef[] = [];
    const pageFormulas: string[] = [];
    const inTextQuestions: { question: string; answerHint?: string }[] = [];
    const ncertHighlights: string[] = [];
    const vocabulary: { term: string; definition: string }[] = [];

    // Parse paragraphs by joining consecutive non-empty lines that don't look like headings
    const paragraphs: string[] = [];
    let currentPara: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // 1. Detect Headings (e.g., "1.1 CHEMICAL EQUATIONS", "1.2.1 Combination Reaction")
      const headingMatch = trimmed.match(/^(\d+\.\d+(?:\.\d+)?)\s+([A-Z0-9\s–—,-]+)$/);
      const isMajorHeading =
        headingMatch ||
        (/^([A-Z\s]{4,40})$/.test(trimmed) && trimmed.length > 5 && !trimmed.includes('NCERT'));

      if (isMajorHeading) {
        if (currentPara.length > 0) {
          paragraphs.push(currentPara.join(' '));
          currentPara = [];
        }
        pageHeadings.push(trimmed);
        pageTopics.push(trimmed);

        searchIndex.push({
          pageNumber: p.pageNumber,
          chapterNumber: activeCh.chapterNumber,
          chapterTitle: activeCh.title,
          sectionTitle: trimmed,
          matchSnippet: trimmed,
          type: 'heading',
        });
        return;
      }

      // 2. Detect Diagrams & Figures (e.g. "Fig. 1.1: Burning of magnesium...", "Activity 1.1")
      const figMatch = trimmed.match(/^(Fig(?:ure)?\.?\s*\d+\.\d+[:\s-]*)(.*)/i);
      if (figMatch) {
        const label = figMatch[1].trim();
        const desc = figMatch[2].trim() || 'Textbook illustration';
        pageDiagrams.push({
          label,
          title: desc,
          pageNumber: p.pageNumber,
          description: desc,
        });

        searchIndex.push({
          pageNumber: p.pageNumber,
          chapterNumber: activeCh.chapterNumber,
          chapterTitle: activeCh.title,
          sectionTitle: label,
          matchSnippet: `${label}: ${desc}`,
          type: 'diagram',
        });
      }

      // Detect Activities
      const actMatch = trimmed.match(/^(Activity\s*\d+\.\d+[:\s-]*)(.*)/i);
      if (actMatch) {
        const label = actMatch[1].trim();
        const desc = actMatch[2].trim() || 'Laboratory / Conceptual Activity';
        pageDiagrams.push({
          label,
          title: desc,
          pageNumber: p.pageNumber,
          description: desc,
        });
        ncertHighlights.push(`NCERT ${label}: ${desc}`);
      }

      // 3. Detect Exercises / Questions
      const isExerciseHeader = /^(EXERCISES|QUESTIONS|What you have learnt)/i.test(trimmed);
      if (isExerciseHeader) {
        pageExercises.push({
          title: trimmed,
          pageNumber: p.pageNumber,
          questions: [],
        });
      }

      // Numbered in-text question: "1. Why should a magnesium ribbon...", "Q1.", "1."
      const questionMatch = trimmed.match(/^(\d+\.|Q\d+[\.:])\s+([A-Z].*\?)$/);
      if (questionMatch) {
        inTextQuestions.push({
          question: trimmed,
        });
        searchIndex.push({
          pageNumber: p.pageNumber,
          chapterNumber: activeCh.chapterNumber,
          chapterTitle: activeCh.title,
          sectionTitle: `Question Page ${p.pageNumber}`,
          matchSnippet: trimmed,
          type: 'exercise',
        });
      }

      // 4. Detect Chemical Equations / Formulas (e.g. "2Mg + O2 -> 2MgO", "E = mc^2", "v = u + at")
      if (
        (trimmed.includes('→') || trimmed.includes('->') || trimmed.includes('=')) &&
        /\b[A-Z][a-z]?\d*\b/.test(trimmed) &&
        !trimmed.startsWith('Fig') &&
        trimmed.length < 80
      ) {
        pageFormulas.push(trimmed);
        searchIndex.push({
          pageNumber: p.pageNumber,
          chapterNumber: activeCh.chapterNumber,
          chapterTitle: activeCh.title,
          sectionTitle: 'Formula / Equation',
          matchSnippet: trimmed,
          type: 'formula',
        });
      }

      // 5. Detect NCERT Highlight Callouts (e.g., "Note:", "Remember:", "Do you know?")
      if (/^(Note:|Do you know\?|Think it over:|Remember:)/i.test(trimmed)) {
        ncertHighlights.push(trimmed);
      }

      // Normal paragraph line
      currentPara.push(trimmed);
    });

    if (currentPara.length > 0) {
      paragraphs.push(currentPara.join(' '));
    }

    // Determine primary section title
    const primarySectionTitle =
      pageHeadings[0] ||
      (pageDiagrams.length > 0 ? pageDiagrams[0].label : `${activeCh.title} • Page ${p.pageNumber}`);

    // Determine page type
    let pageType: NCERTProcessedBookPage['pageType'] = 'theory';
    if (pageExercises.length > 0) pageType = 'exercise';
    else if (pageDiagrams.some((d) => d.label.includes('Activity'))) pageType = 'activity';
    else if (p.text.toLowerCase().includes('what you have learnt')) pageType = 'summary';

    // Populate processed page
    const processedPage: NCERTProcessedBookPage = {
      pageNumber: p.pageNumber,
      chapterNumber: activeCh.chapterNumber,
      chapterTitle: activeCh.title,
      sectionTitle: primarySectionTitle,
      heading: pageHeadings[1] || pageHeadings[0],
      topics: pageTopics,
      paragraphs: paragraphs.length > 0 ? paragraphs : [p.text],
      rawText: p.text, // Verbatim authentic text
      diagrams: pageDiagrams,
      exercises: pageExercises,
      formulas: pageFormulas.length > 0 ? pageFormulas : undefined,
      inTextQuestions: inTextQuestions.length > 0 ? inTextQuestions : undefined,
      ncertHighlights,
      vocabulary: vocabulary.length > 0 ? vocabulary : undefined,
      pageType,
    };

    processedPages[p.pageNumber] = processedPage;

    // Aggregate into active chapter metadata
    if (pageHeadings.length > 0) {
      activeCh.headings.push(...pageHeadings);
    }
    if (pageTopics.length > 0) {
      activeCh.topics.push(...pageTopics);
    }
    if (pageDiagrams.length > 0) {
      activeCh.diagrams.push(...pageDiagrams);
    }
    if (pageExercises.length > 0) {
      activeCh.exercises.push(...pageExercises);
    }

    // Index page text in search
    const previewSnippet = (paragraphs[0] || p.text).substring(0, 140);
    searchIndex.push({
      pageNumber: p.pageNumber,
      chapterNumber: activeCh.chapterNumber,
      chapterTitle: activeCh.title,
      sectionTitle: primarySectionTitle,
      matchSnippet: previewSnippet,
      type: 'text',
    });
  });

  // Deduplicate chapter topics & headings
  detectedChapters.forEach((ch) => {
    ch.headings = Array.from(new Set(ch.headings));
    ch.topics = Array.from(new Set(ch.topics));
  });

  const finalBookTitle =
    options.bookTitle ||
    (detectedChapters.length === 1
      ? `NCERT ${detectedChapters[0].title}`
      : `NCERT Class ${classLevel} ${subjectId.toUpperCase()} Textbook`);

  return {
    id: bookId,
    title: finalBookTitle,
    fileName,
    fileSize,
    classLevel,
    subjectId,
    uploadedAt: new Date().toISOString(),
    totalPages: extractedPages.length,
    source: 'uploaded_pdf',
    chapters: detectedChapters,
    pages: processedPages,
    searchIndex,
  };
}
