import React, { useState } from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import {
  getCanonicalUrl,
  getWebSiteSchema,
  getOrganizationSchema,
  getWebApplicationSchema,
  getFAQSchema,
} from '../../services/seoService';
import {
  Sparkles,
  BookOpen,
  Brain,
  Layers,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Award,
  Zap,
  GraduationCap,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { NCERTClass } from '../../types/ncert';
import { COMPREHENSIVE_NCERT_CATALOG } from '../../data/ncertCurriculumCatalog';

interface PublicHomePageProps {
  onNavigate?: (path: string) => void;
  onGetStarted?: () => void;
}

const PUBLIC_FAQS = [
  {
    question: 'What is StudyPilot AI?',
    answer:
      'StudyPilot AI is an adaptive, research-backed learning platform for Indian school students (CBSE, ICSE, and State Boards). It features official NCERT page-by-page interactive readers, AI study timetable planners, and spaced repetition quizzes.',
  },
  {
    question: 'Are all NCERT textbooks and curriculum covered?',
    answer:
      'Yes. StudyPilot AI includes comprehensive curriculum mappings for Classes 6 through 12 across Science, Mathematics, Physics, Chemistry, Biology, and Social Science.',
  },
  {
    question: 'Is StudyPilot AI free to use?',
    answer:
      'Yes. All public NCERT chapter syllabus overviews, key formulas, chemical reaction sheets, and practice questions are completely free to browse.',
  },
  {
    question: 'How does the AI Study Planner work?',
    answer:
      'You enter your upcoming exam date and subjects. StudyPilot AI schedules your chapters into daily 45-minute study slots, prioritizing high-yield board topics and spacing out reviews.',
  },
];

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  onNavigate,
  onGetStarted,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const canonicalUrl = getCanonicalUrl('/');

  const jsonLd = [
    getWebSiteSchema(),
    getOrganizationSchema(),
    getWebApplicationSchema(),
    getFAQSchema(PUBLIC_FAQS),
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    if (onNavigate) {
      onNavigate(`/ncert?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // High-yield sample chapters from catalog
  const sampleChapters = [
    {
      title: 'Chemical Reactions and Equations',
      classLevel: '10',
      subject: 'science',
      path: '/ncert/class-10/science/chemical-reactions-and-equations',
      weightage: '7-8 Marks',
      desc: 'Balancing equations, types of reactions, corrosion & rancidity.',
    },
    {
      title: "Newton's Laws of Motion",
      classLevel: '9',
      subject: 'physics',
      path: '/topic/newtons-laws-of-motion',
      weightage: '8-9 Marks',
      desc: 'Inertia, F=ma, Action-Reaction pairs and momentum conservation.',
    },
    {
      title: 'Matter in Our Surroundings',
      classLevel: '9',
      subject: 'science',
      path: '/ncert/class-9/science/matter-in-our-surroundings',
      weightage: '6-7 Marks',
      desc: 'States of matter, latent heat of fusion & vaporisation, evaporation.',
    },
    {
      title: 'The Fundamental Unit of Life',
      classLevel: '9',
      subject: 'science',
      path: '/ncert/class-9/science/the-fundamental-unit-of-life',
      weightage: '7-8 Marks',
      desc: 'Cell theory, cell organelles, osmosis, diffusion & cell division.',
    },
  ];

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <SEOHead
        metadata={{
          title: 'StudyPilot AI – NCERT Textbooks, AI Study Planner & Interactive Quizzes',
          description:
            'Master CBSE & NCERT syllabus for Classes 6–12 with StudyPilot AI. Official textbook readers, AI study timetable planner, spaced repetition quizzes, and formula sheets.',
          canonicalUrl,
          jsonLd,
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>AI-POWERED NCERT LEARNING COMPANION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Master Your NCERT Syllabus with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Adaptive AI</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Read official CBSE textbooks page-by-page, test retention with micro-quizzes, and build a stress-free daily study timetable tailored to your school exam date.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Launch Study Pilot</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="/ncert"
              onClick={(e) => handleLinkClick(e, '/ncert')}
              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm shadow-xs hover:border-indigo-400 transition-all cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Browse NCERT Textbooks</span>
            </a>
          </div>
        </header>

        {/* Quick Search Bar */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search NCERT chapters, topics, or formulas (e.g., Chemical Reactions, Newton's Laws)..."
              className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
              aria-label="Search curriculum topics and chapters"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* NCERT Class Quick Filter Grid */}
        <section aria-labelledby="quick-classes-heading" className="space-y-3">
          <div className="text-center">
            <h2 id="quick-classes-heading" className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Select Your NCERT / CBSE Class Level
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {(['6', '7', '8', '9', '10', '11', '12'] as NCERTClass[]).map((cls) => (
              <a
                key={cls}
                href={`/ncert/class-${cls}`}
                onClick={(e) => handleLinkClick(e, `/ncert/class-${cls}`)}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-xs text-center transition-all group cursor-pointer"
              >
                <span className="block text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Class {cls}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {cls === '10' || cls === '12' ? 'Board Exam' : 'Textbooks & Quizzes'}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* High-Yield Chapter Highlights */}
        <section aria-labelledby="high-yield-heading" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="high-yield-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Featured NCERT Chapters &amp; Topics
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                High-yield chapters frequently tested on CBSE board examinations
              </p>
            </div>
            <a
              href="/ncert"
              onClick={(e) => handleLinkClick(e, '/ncert')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleChapters.map((ch, idx) => (
              <a
                key={idx}
                href={ch.path}
                onClick={(e) => handleLinkClick(e, ch.path)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs transition-all space-y-2 block cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Class {ch.classLevel} • {ch.subject.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {ch.weightage}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {ch.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {ch.desc}
                </p>

                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Read Chapter Notes &amp; Practice Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Cognitive Framework Overview */}
        <section aria-labelledby="cognitive-heading" className="space-y-4 pt-6">
          <h2 id="cognitive-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-center sm:text-left">
            Why Students Excel with StudyPilot AI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Feynman Active Recall
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Explain complex theorems in your own voice. The AI tutor evaluates conceptual completeness and corrects blind spots immediately.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Spaced Revision Timetable
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatically schedules chapter reviews at 1, 3, and 7-day intervals to lock information into long-term memory before exam day.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Authentic NCERT Alignment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero hallucinated topics. Every question, formula, and explanation corresponds to verified CBSE textbook standards.
              </p>
            </div>
          </div>
        </section>

        {/* Visible FAQs */}
        <section aria-labelledby="home-faqs-heading" className="space-y-4 pt-6">
          <h2 id="home-faqs-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {PUBLIC_FAQS.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
              >
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </article>
  );
};
