import { HIERARCHICAL_CURRICULUM } from '../../src/data/curriculumHierarchy';

export interface SearchInput {
  query: string;
  classLevel?: string;
  notes?: any[];
}

export async function searchCurriculumAndNotes(input: SearchInput) {
  const query = (input.query || '').toLowerCase().trim();
  if (!query) return [];

  const results: any[] = [];

  // 1. Search Curriculum (Chapters & Topics)
  HIERARCHICAL_CURRICULUM.forEach((chapter) => {
    const matchesChapter =
      chapter.name.toLowerCase().includes(query) ||
      chapter.description.toLowerCase().includes(query) ||
      chapter.subjectId.toLowerCase().includes(query);

    if (matchesChapter) {
      results.push({
        id: `chap-${chapter.id}`,
        title: chapter.name,
        subtitle: `Chapter in ${chapter.subjectId.toUpperCase()} (Class ${chapter.classLevel})`,
        category: 'chapter',
        targetTab: 'learn',
        metadata: { chapter },
      });
    }

    chapter.topics.forEach((topic) => {
      const matchesTopic =
        topic.name.toLowerCase().includes(query) ||
        topic.keyConcepts.some((c) => c.toLowerCase().includes(query)) ||
        topic.formulaList?.some((f) => f.toLowerCase().includes(query));

      if (matchesTopic && !results.some((r) => r.id === `chap-${chapter.id}`)) {
        results.push({
          id: `topic-${topic.id}`,
          title: topic.name,
          subtitle: `Topic in ${chapter.name}`,
          category: 'topic',
          targetTab: 'learn',
          metadata: { chapter, topic },
        });
      }
    });
  });

  // 2. Search Questions (Mock Question Bank pool)
  const questionPool = [
    { id: 'q-1', question: 'An electric heater rated 1500 W operates for 2 hours daily. What is electrical energy consumed in 30 days?', concept: 'Commercial Electrical Energy', chapter: 'Electricity', subject: 'science' },
    { id: 'q-2', question: 'Where should an object be placed in front of a convex lens to get a real image of the same size?', concept: 'Convex Lens Image Formation', chapter: 'Light — Reflection and Refraction', subject: 'science' },
    { id: 'q-3', question: 'What is the nature of the roots of the quadratic equation 2x² - 4x + 3 = 0?', concept: 'Discriminant & Roots', chapter: 'Quadratic Equations', subject: 'math' },
    { id: 'q-4', question: 'State Newton\'s Second Law of Motion and derive F = ma.', concept: 'Newton\'s Laws of Motion', chapter: 'Force and Laws of Motion', subject: 'science' },
    { id: 'q-5', question: 'Find the area of a triangle with side lengths 13 cm, 14 cm and 15 cm using Heron\'s formula.', concept: 'Heron\'s Formula Area', chapter: 'Heron\'s Formula', subject: 'math' },
    { id: 'q-6', question: 'Explain the mechanism of photosynthesis in green plants and write the balanced chemical equation.', concept: 'Photosynthesis Mechanism', chapter: 'Life Processes', subject: 'biology' },
  ];

  questionPool.forEach((q) => {
    if (q.question.toLowerCase().includes(query) || q.concept.toLowerCase().includes(query) || q.chapter.toLowerCase().includes(query)) {
      results.push({
        id: `question-${q.id}`,
        title: q.question,
        subtitle: `Question Bank • ${q.chapter}`,
        category: 'saved_question',
        targetTab: 'practice',
        metadata: { questionItem: q },
      });
    }
  });

  // 3. Search Saved Notes if provided
  if (input.notes && Array.isArray(input.notes)) {
    input.notes.forEach((note) => {
      if (
        (note.title && note.title.toLowerCase().includes(query)) ||
        (note.topicName && note.topicName.toLowerCase().includes(query)) ||
        (note.chapterName && note.chapterName.toLowerCase().includes(query)) ||
        (note.content && note.content.toLowerCase().includes(query))
      ) {
        results.push({
          id: `note-${note.id}`,
          title: note.title || 'Saved Study Note',
          subtitle: `Saved Note • ${note.chapterName || 'General'}`,
          category: 'note',
          targetTab: 'notes',
          metadata: { note },
        });
      }
    });
  }

  return results.slice(0, 15);
}
