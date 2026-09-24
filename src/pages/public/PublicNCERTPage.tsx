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
import { normalizeSubjectSlug } from '../../hooks/useSEORouter';
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

  // Normalize subject
  const cleanSubjectId = subjectId ? normalizeSubjectSlug(subjectId) : undefined;

  // Find matched subject
  const currentSubject: NCERTSubject | undefined = cleanSubjectId
    ? NCERT_SUBJECTS_CATALOG.find((s) => s.id.toLowerCase() === cleanSubjectId.toLowerCase())
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  // 1. Single Chapter View
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
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
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
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
                    onClick={(e) => handleLinkClick(e, `/ncert/class-${chClass}/${rel.subjectId}/${slugify(rel.title)}`)}
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

  // 2. Class or Subject Overview
  const activeClass = (isSpecificClass ? cleanClass : '9') as NCERTClass;
  const filteredChapters = getNCERTChaptersForClass(
    activeClass,
    currentSubject ? currentSubject.id : undefined
  );

  const pageTitle = currentSubject
    ? `NCERT Class ${activeClass} ${currentSubject.name} Notes, Solutions & Quizzes | StudyPilot AI`
    : isSpecificClass
    ? `NCERT Class ${activeClass} Textbooks, Syllabus & Chapters | StudyPilot AI`
    : 'NCERT School Textbooks (Classes 6 to 12) – Notes & Quizzes | StudyPilot AI';

  const pageDescription = currentSubject
    ? `Complete syllabus and chapter guide for NCERT Class ${activeClass} ${currentSubject.name}. Study chapter overviews, key concepts, formulas, and take interactive practice quizzes.`
    : `Explore official CBSE & NCERT textbooks for Class ${activeClass}. Covers Science, Mathematics, English, Hindi, and Social Science with chapter notes and quizzes.`;

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

  const subjectsForClass = NCERT_SUBJECTS_CATALOG.filter((s) => s.classes.includes(activeClass));

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

        {/* Page Hero */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>OFFICIAL NCERT CURRICULUM</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {currentSubject
              ? `NCERT Class ${activeClass} ${currentSubject.name}`
              : isSpecificClass
              ? `NCERT Class ${activeClass} Curriculum & Textbooks`
              : 'NCERT School Textbooks & Interactive Learning'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {pageDescription}
          </p>
        </header>

        {/* Class Selection Pills */}
        <nav aria-label="NCERT Classes" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['6', '7', '8', '9', '10', '11', '12'].map((cls) => {
            const isSelected = cls === activeClass;
            const targetUrl = `/ncert/class-${cls}${currentSubject ? `/${currentSubject.id}` : ''}`;
            return (
              <a
                key={cls}
                href={targetUrl}
                onClick={(e) => handleLinkClick(e, targetUrl)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Class {cls}
              </a>
            );
          })}
        </nav>

        {/* Subject Filter Tabs */}
        {isSpecificClass && (
          <nav aria-label="Class Subjects" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <a
              href={`/ncert/class-${activeClass}`}
              onClick={(e) => handleLinkClick(e, `/ncert/class-${activeClass}`)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                !currentSubject
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Subjects
            </a>
            {subjectsForClass.map((subj) => {
              const isSelected = currentSubject?.id === subj.id;
              const subjUrl = `/ncert/class-${activeClass}/${subj.id}`;
              return (
                <a
                  key={subj.id}
                  href={subjUrl}
                  onClick={(e) => handleLinkClick(e, subjUrl)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {subj.name}
                </a>
              );
            })}
          </nav>
        )}

        {/* Chapters Grid */}
        <section aria-labelledby="chapters-grid-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="chapters-grid-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {currentSubject ? `${currentSubject.name} Chapters` : `Class ${activeClass} Chapters`} ({filteredChapters.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChapters.map((chapter) => {
              const chUrl = `/ncert/class-${chapter.classLevel}/${chapter.subjectId}/${slugify(chapter.title)}`;
              return (
                <div
                  key={chapter.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 uppercase">
                        {chapter.subjectId} • Ch {chapter.chapterNumber}
                      </span>
                      {chapter.highYieldWeightage && (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          {chapter.highYieldWeightage}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {chapter.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {chapter.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <a
                      href={chUrl}
                      onClick={(e) => handleLinkClick(e, chUrl)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Chapter Notes &amp; Quiz</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => {
                        if (onOpenReader) {
                          onOpenReader(chapter);
                        } else if (onNavigate) {
                          onNavigate('/ncert');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                      title="Open Interactive Reader"
                      aria-label={`Open interactive reader for ${chapter.title}`}
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Educational Content / Study Tips Section */}
        <section aria-labelledby="study-tips-heading" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 id="study-tips-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            How to Excel in NCERT Class {activeClass} Examinations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400">1. Master In-Text Questions</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Over 70% of board questions are directly adapted from in-text NCERT examples and exercise problems.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400">2. Memorize Precise Definitions</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Board examiners reward standard textbook phrasing for definitions, SI units, and chemical reactions.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
              <h3 className="font-bold text-indigo-600 dark:text-indigo-400">3. Spaced Quizzing</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Use StudyPilot AI interactive quizzes to test your recall 3 days and 7 days after reading each chapter.
              </p>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
};
