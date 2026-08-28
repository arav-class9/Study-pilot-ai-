import { HIERARCHICAL_CURRICULUM, BOARDS, CLASSES } from '../data/curriculumHierarchy';

export interface CurriculumValidationInput {
  board?: string;
  classLevel?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
}

export interface CurriculumValidationResult {
  isValid: boolean;
  error?: string;
  normalizedData: {
    board: string;
    classLevel: string;
    subject: string;
    chapterName: string;
    topicName?: string;
    chapterId?: string;
    topicId?: string;
  };
}

export function validateCurriculumSelection(input: CurriculumValidationInput): CurriculumValidationResult {
  const board = input.board ? input.board.toUpperCase().trim() : 'CBSE';
  const classLevel = input.classLevel ? String(input.classLevel).trim() : '10';
  const subjectRaw = input.subject ? input.subject.toLowerCase().trim() : 'science';

  // Normalize subject
  const subject = subjectRaw.includes('math')
    ? 'math'
    : subjectRaw.includes('sci')
    ? 'science'
    : subjectRaw.includes('eng')
    ? 'english'
    : subjectRaw.includes('soc')
    ? 'social_science'
    : 'science';

  // 1. Board validation
  const validBoard = BOARDS.some((b) => b.id.toUpperCase() === board || b.name.toUpperCase() === board);
  if (!validBoard && board !== 'CBSE' && board !== 'ICSE' && board !== 'STATE') {
    return {
      isValid: false,
      error: `Invalid education board "${input.board}". Supported boards are CBSE (NCERT), ICSE, and State Boards.`,
      normalizedData: { board, classLevel, subject, chapterName: input.chapter || '' },
    };
  }

  // 2. Class validation
  const validClass = CLASSES.some((c) => c.level === classLevel);
  if (!validClass) {
    return {
      isValid: false,
      error: `Class "${input.classLevel}" is outside the supported standard secondary curriculum range (Classes 6-12).`,
      normalizedData: { board, classLevel, subject, chapterName: input.chapter || '' },
    };
  }

  // 3. Chapter and Topic lookup in curriculum hierarchy
  if (input.chapter && input.chapter.trim() !== '') {
    const chapQuery = input.chapter.toLowerCase().trim();
    const matchedChapter = HIERARCHICAL_CURRICULUM.find(
      (c) =>
        (c.classLevel === classLevel || true) &&
        (c.name.toLowerCase().includes(chapQuery) || chapQuery.includes(c.name.toLowerCase()) || c.id.toLowerCase() === chapQuery)
    );

    if (matchedChapter) {
      let matchedTopic = undefined;
      if (input.topic && input.topic.trim() !== '') {
        const topQuery = input.topic.toLowerCase().trim();
        matchedTopic = matchedChapter.topics.find(
          (t) =>
            t.name.toLowerCase().includes(topQuery) ||
            topQuery.includes(t.name.toLowerCase()) ||
            t.id.toLowerCase() === topQuery
        );
      }

      return {
        isValid: true,
        normalizedData: {
          board,
          classLevel,
          subject,
          chapterName: matchedChapter.name,
          chapterId: matchedChapter.id,
          topicName: matchedTopic ? matchedTopic.name : input.topic,
          topicId: matchedTopic ? matchedTopic.id : undefined,
        },
      };
    }
  }

  return {
    isValid: true,
    normalizedData: {
      board,
      classLevel,
      subject,
      chapterName: input.chapter || 'Comprehensive Syllabus',
      topicName: input.topic,
    },
  };
}
