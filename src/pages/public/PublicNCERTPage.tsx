import React, { useMemo } from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { SEOBreadcrumbs } from '../../components/seo/SEOBreadcrumbs';
import {
  getCanonicalUrl,
  getEducationalContentSchema,
  getBreadcrumbSchema,
  slugify,
} from '../../services/seoService';
import {
  NCERT_SUBJECTS_CATALOG,
  getNCERTChaptersForClass,
  getNCERTChapterById,
} from '../../data/ncertBooksData';
import { NCERTClass, NCERTChapter, NCERTSubject } from '../../types/ncert';
import {
  BookOpen,
  ArrowRight,
  Calculator,
  Atom,
  Globe,
  Languages,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface PublicNCERTPageProps {
  classLevel?: string;
  subjectId?: string;
  chapterSlug?: string;
  onNavigate?: (path: string) => void;
  onOpenReader?: (chapter: NCERTChapter) => void;
}

export const PublicNCERTPage: React.FC<PublicNCERTPageProps> = ({
  classLevel,
  subjectId,
  chapterSlug,
  onNavigate,
  onOpenReader,
}) => {
  // Normalize class level (e.g., 'class-10' -> '10' or '10')
  const cleanClass = (classLevel ? classLevel.replace('class-', '') : '') as NCERTClass;
  const isSpecificClass = ['6', '7', '8', '9', '10', '11', '12'].includes(cleanClass);

  // Find matched subject
  const currentSubject: NCERTSubject | undefined = subjectId
    ? NCERT_SUBJECTS_CATALOG.find((s) => s.id.toLowerCase() === subjectId.toLowerCase())
    : undefined;

  // Find matched chapter if slug provided
  const matchedChapter: NCERTChapter | undefined = useMemo(() => {
    if (!chapterSlug) return undefined;
    for (const sub of NCERT_SUBJECTS_CATALOG) {
      for (const ch of sub.chapters) {
        if (
          (!isSpecificClass || ch.classLevel === cleanClass) &&
          (!currentSubject || ch.subjectId === currentSubject.id)
        ) {
          if (slugify(ch.title) === chapterSlug || ch.id === chapterSlug) {
            return ch;
          }
        }
      }
    }
    return undefined;
  }, [chapterSlug, cleanClass, currentSubject, isSpecificClass]);

  // Handle Chapter View
  if (matchedChapter) {
    const chClass = matchedChapter.classLevel;
    const chSubject = matchedChapter.subjectId.toUpperCase();
    const pageUrl = `/ncert/class-${chClass}/${matchedChapter.subjectId}/${slugify(matchedChapter.title)}`;
    const canonicalUrl = getCanonicalUrl(pageUrl);

    const breadcrumbs = [
      { label: 'NCERT Hub', url: '/ncert' },
      { label: `Class ${chClass}`, url: `/ncert/class-${chClass}` },
      { label: chSubject, url: `/ncert/class-${chClass}/${matchedChapter.subjectId}` },
      { label: matchedChapter.title, url: pageUrl },
    ];

    const jsonLd = [
      getEducationalContentSchema({
        title: `NCERT Class ${chClass} ${chSubject} Ch ${matchedChapter.chapterNumber}: ${matchedChapter.title}`,
        description: matchedChapter.description,
        url: canonicalUrl,
        educationalLevel: `Class ${chClass} Secondary Education`,
        subject: chSubject,
      }),
      getBreadcrumbSchema(breadcrumbs),
    ];

    return (
      <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
        <SEOHead
          metadata={{
            title: `Class ${chClass} ${chSubject} Ch ${matchedChapter.chapterNumber}: ${matchedChapter.title} – Notes & Quiz`,
            description: `${matchedChapter.title} - Official NCERT textbook chapter for Class ${chClass} ${chSubject}. Covers ${matchedChapter.description} with key themes, high-yield board weightage, and interactive quizzes.`,
            canonicalUrl,
            breadcrumbs,
            jsonLd,
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
          <SEOBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />

          {/* Chapter Main Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase">
                NCERT Class {chClass} • {chSubject}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
                Board Weightage: {matchedChapter.highYieldWeightage || '5-8 Marks'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {matchedChapter.totalPages} Textbook Pages
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Chapter {matchedChapter.chapterNumber}: {matchedChapter.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {matchedChapter.description}
            </p>
          </header>

          {/* Interactive CTAs */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={() => {
                if (onOpenReader) {
                  onOpenReader(matchedChapter);
                } else if (onNavigate) {
                  onNavigate('/ncert');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Chapter Page-by-Page</span>
            </button>

            <button
              onClick={() => {
                if (onOpenReader) {
                  onOpenReader(matchedChapter);
                } else if (onNavigate) {
                  onNavigate('/ncert');
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400 dark:text-indigo-600" />
              <span>Take Chapter Practice Quiz</span>
            </button>
          </div>

          {/* Key Themes & Concepts Section */}
          <section aria-labelledby="key-themes-heading" className="space-y-4">
            <h2 id="key-themes-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Core Syllabus Concepts &amp; Learning Objectives
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedChapter.keyThemes.map((theme, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {theme}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Sample Solved Questions for SEO Content Value */}
          <section aria-labelledby="practice-questions-heading" className="space-y-4">
            <h2 id="practice-questions-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              High-Frequency NCERT Practice Questions &amp; Solutions
            </h2>

            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Q1: Explain the fundamental principles covered in {matchedChapter.title}.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  In NCERT Class {chClass} {chSubject}, this chapter establishes foundational concepts around {matchedChapter.description.toLowerCase()}. Mastery requires understanding the underlying laws, solving standard numerical exercises, and connecting theoretical definitions to real-world applications.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Q2: What are common board exam questions from this chapter?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  CBSE board papers regularly test 1-mark objective questions on key definitions, 2-mark conceptual reasoning problems (e.g. why reactions occur or how systems behave), and 3-to-5 mark numerical or derivations directly drawn from NCERT in-text questions.
                </p>
              </div>
            </div>
          </section>

          {/* Related Chapters in this Subject */}
          <section aria-labelledby="related-chapters-heading" className="space-y-4">
            <h2 id="related-chapters-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Related Class {chClass} {chSubject} Chapters
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {getNCERTChaptersForClass(chClass as NCERTClass, matchedChapter.subjectId)
                .filter((c) => c.id !== matchedChapter.id)
                .slice(0, 6)
                .map((rel) => (
                  <a
                    key={rel.id}
                    href={`/ncert/class-${chClass}/${rel.subjectId}/${slugify(rel.title)}`}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(`/ncert/class-${chClass}/${rel.subjectId}/${slugify(rel.title)}`);
                      }
                    }}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-all space-y-1 block cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      Chapter {rel.chapterNumber}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {rel.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {rel.description}
                    </p>
                  </a>
                ))}
            </div>
          </section>
        </div>
      </article>
    );
  }

  // Handle Class or Subject Overview
  const activeClass = (isSpecificClass ? cleanClass : '10') as NCERTClass;
  const filteredChapters = getNCERTChaptersForClass(
    activeClass,
    currentSubject ? currentSubject.id : undefined
  );

  const pageTitle = currentSubject
    ? `NCERT Class ${activeClass} ${currentSubject.name} Textbooks & Chapters | StudyPilot AI`
    : isSpecificClass
    ? `NCERT Class ${activeClass} Textbooks, Syllabus & Chapters | StudyPilot AI`
    : 'NCERT School Textbooks (Classes 6 to 12) – Notes & Quizzes | StudyPilot AI';

  const pageDescription = currentSubject
    ? `Complete syllabus and chapter guide for NCERT Class ${activeClass} ${currentSubject.name}. Read official textbook chapters page-by-page and solve interactive practice quizzes.`
    : `Explore official CBSE & NCERT textbooks for Class ${activeClass}. Covers Science, Mathematics, English, and Social Science with chapter notes and quizzes.`;

  const pageUrl = currentSubject
    ? `/ncert/class-${activeClass}/${currentSubject.id}`
    : isSpecificClass
    ? `/ncert/class-${activeClass}`
    : '/ncert';

  const canonicalUrl = getCanonicalUrl(pageUrl);

  const breadcrumbs = [
    { label: 'NCERT Hub', url: '/ncert' },
    ...(isSpecificClass ? [{ label: `Class ${activeClass}`, url: `/ncert/class-${activeClass}` }] : []),
    ...(currentSubject ? [{ label: currentSubject.name, url: `/ncert/class-${activeClass}/${currentSubject.id}` }] : []),
  ];

  const jsonLd = [
    getEducationalContentSchema({
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      educationalLevel: `Class ${activeClass} Secondary Education`,
      subject: currentSubject?.name || 'All Subjects',
    }),
    getBreadcrumbSchema(breadcrumbs),
  ];

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <SEOHead
        metadata={{
          title: pageTitle,
          description: pageDescription,
          canonicalUrl,
          breadcrumbs,
          jsonLd,
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        <SEOBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />

        {/* Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>OFFICIAL CBSE &amp; NCERT CURRICULUM</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {currentSubject
              ? `NCERT Class ${activeClass} ${currentSubject.name} – Chapters & Quizzes`
              : isSpecificClass
              ? `NCERT Class ${activeClass} Textbooks & Curriculum`
              : 'NCERT Textbooks & Chapters (Classes 6 to 12)'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {pageDescription}
          </p>
        </header>

        {/* Class Selection Strip */}
        <section aria-labelledby="class-select-heading" className="space-y-2">
          <h2 id="class-select-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Grade / Class:
          </h2>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['6', '7', '8', '9', '10', '11', '12'] as NCERTClass[]).map((cls) => (
              <a
                key={cls}
                href={`/ncert/class-${cls}`}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(`/ncert/class-${cls}`);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeClass === cls
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                }`}
              >
                Class {cls}
              </a>
            ))}
          </div>
        </section>

        {/* Subject Filter Tabs */}
        <section aria-labelledby="subjects-heading" className="space-y-2">
          <h2 id="subjects-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Filter by Subject:
          </h2>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <a
              href={`/ncert/class-${activeClass}`}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate(`/ncert/class-${activeClass}`);
                }
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                !currentSubject
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              All Subjects
            </a>

            {NCERT_SUBJECTS_CATALOG.filter((s) => s.classes.includes(activeClass)).map((subj) => (
              <a
                key={subj.id}
                href={`/ncert/class-${activeClass}/${subj.id}`}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(`/ncert/class-${activeClass}/${subj.id}`);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentSubject?.id === subj.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                }`}
              >
                <span>{subj.name}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Chapters Grid */}
        <section aria-labelledby="chapter-list-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="chapter-list-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Class {activeClass} Chapters ({filteredChapters.length})
            </h2>
            <span className="text-xs text-slate-500">
              Click any chapter to view syllabus notes and practice quizzes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChapters.map((chapter) => {
              const chUrl = `/ncert/class-${chapter.classLevel}/${chapter.subjectId}/${slugify(chapter.title)}`;
              return (
                <div
                  key={chapter.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Chapter {chapter.chapterNumber} • {chapter.subjectId.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {chapter.highYieldWeightage || 'Board Core'}
                      </span>
                    </div>

                    <a
                      href={chUrl}
                      onClick={(e) => {
                        if (onNavigate) {
                          e.preventDefault();
                          onNavigate(chUrl);
                        }
                      }}
                      className="block group"
                    >
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {chapter.title}
                      </h3>
                    </a>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {chapter.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={chUrl}
                      onClick={(e) => {
                        if (onNavigate) {
                          e.preventDefault();
                          onNavigate(chUrl);
                        }
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Chapter Notes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>

                    {onOpenReader && (
                      <button
                        onClick={() => onOpenReader(chapter)}
                        className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Read this chapter page-by-page"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </article>
  );
};
