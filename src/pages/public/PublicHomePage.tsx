import React, { useState } from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import {
  getCanonicalUrl,
  getWebSiteSchema,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
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
  Zap,
  GraduationCap,
  ShieldCheck,
  Search,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { NCERTClass } from '../../types/ncert';

interface PublicHomePageProps {
  onNavigate?: (path: string) => void;
  onGetStarted?: () => void;
}

const PUBLIC_FAQS = [
  {
    question: 'What is StudyPilot AI?',
    answer:
      'StudyPilot AI is an AI-powered study assistant for students with notes, explanations, NCERT learning, quizzes, revision tools and personalized study support for CBSE and school curricula.',
  },
  {
    question: 'How does StudyPilot AI help students learn smarter?',
    answer:
      'StudyPilot AI breaks down complex textbook topics into bite-sized concepts, creates automated daily study timetables, generates syllabus-aligned revision notes, and provides interactive practice quizzes with step-by-step explanations.',
  },
  {
    question: 'Can students study NCERT topics and textbooks with StudyPilot AI?',
    answer:
      'Yes. StudyPilot AI includes comprehensive NCERT chapter guides, key themes, formulas, and page-by-page interactive readers across Classes 6 through 12 for Science, Mathematics, Social Science, English, Hindi, Physics, Chemistry, and Biology.',
  },
  {
    question: 'Can StudyPilot AI generate quizzes and flashcards?',
    answer:
      'Yes. You can generate custom MCQs, assertion-reason questions, numerical problem sets, and spaced-repetition flashcards for any chapter to test your active recall before exams.',
  },
  {
    question: 'Is StudyPilot AI free to browse for school students?',
    answer:
      'Yes. All public NCERT chapter overviews, key concepts, formulas, study planners, and practice guides are freely accessible to help students everywhere.',
  },
];

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  onNavigate,
  onGetStarted,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const canonicalUrl = getCanonicalUrl('/');

  const jsonLd = [
    getSoftwareApplicationSchema(),
    getWebSiteSchema(),
    getOrganizationSchema(),
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
      desc: 'Balancing equations, types of chemical reactions, corrosion and rancidity.',
    },
    {
      title: "Newton's Laws of Motion",
      classLevel: '9',
      subject: 'physics',
      path: '/topic/newtons-laws-of-motion',
      weightage: '8-9 Marks',
      desc: 'Inertia, F=ma, action-reaction pairs, and momentum conservation.',
    },
    {
      title: 'Matter in Our Surroundings',
      classLevel: '9',
      subject: 'science',
      path: '/ncert/class-9/science/matter-in-our-surroundings',
      weightage: '6-7 Marks',
      desc: 'States of matter, latent heat of fusion and vaporisation, and evaporation factors.',
    },
    {
      title: 'The Fundamental Unit of Life',
      classLevel: '9',
      subject: 'science',
      path: '/ncert/class-9/science/the-fundamental-unit-of-life',
      weightage: '7-8 Marks',
      desc: 'Cell theory, cell organelles, osmosis, diffusion, and cell division.',
    },
  ];

  const coreTools = [
    {
      title: 'AI Study Assistant',
      desc: 'Syllabus-aligned explanations and concept breakdowns for any school topic.',
      path: '/ai-study-assistant',
      icon: Sparkles,
      color: 'indigo',
    },
    {
      title: 'AI Notes Generator',
      desc: 'High-yield revision cheat sheets, balanced reactions, and formula summaries.',
      path: '/ai-notes-generator',
      icon: Brain,
      color: 'purple',
    },
    {
      title: 'AI Quiz Generator',
      desc: 'Adaptive MCQs, assertion-reason questions, and board exam drills.',
      path: '/ai-quiz-generator',
      icon: Layers,
      color: 'emerald',
    },
    {
      title: 'AI Flashcards',
      desc: 'Lock key formulas and definitions into long-term memory with active recall.',
      path: '/ai-flashcards',
      icon: Zap,
      color: 'amber',
    },
    {
      title: 'AI Study Planner',
      desc: 'Intelligent daily revision timetable based on your exam date and weightage.',
      path: '/ai-study-planner',
      icon: Calendar,
      color: 'blue',
    },
    {
      title: 'AI Question Solver',
      desc: 'Step-by-step problem explanations and mathematical derivations.',
      path: '/ai-question-solver',
      icon: Lightbulb,
      color: 'rose',
    },
  ];

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <SEOHead
        metadata={{
          title: 'StudyPilot AI – AI Study Assistant, NCERT Notes, Quizzes & Learning',
          description:
            'StudyPilot AI helps students learn smarter with AI-powered explanations, NCERT learning, notes, quizzes, revision tools and personalized study support.',
          canonicalUrl,
          jsonLd,
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>AI-POWERED STUDY ASSISTANT FOR STUDENTS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Master NCERT, Ace School Exams &amp; Learn Smarter with{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              StudyPilot AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Personalized AI explanations, official NCERT chapter summaries, adaptive quizzes, spaced repetition flashcards, and intelligent study planners.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search any NCERT chapter, topic or formula (e.g., Matter, Newton)..."
                className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                aria-label="Search NCERT chapters and topics"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/ncert"
              onClick={(e) => handleLinkClick(e, '/ncert')}
              className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              Browse NCERT Textbooks
            </a>
          </div>
        </header>

        {/* NCERT Class Directory Links */}
        <section aria-labelledby="class-directory-heading" className="space-y-4 pt-4">
          <div className="text-center space-y-1">
            <h2 id="class-directory-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Your NCERT Class
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {['6', '7', '8', '9', '10', '11', '12'].map((cls) => (
              <a
                key={cls}
                href={`/ncert/class-${cls}`}
                onClick={(e) => handleLinkClick(e, `/ncert/class-${cls}`)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all text-center group cursor-pointer"
              >
                <div className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Class {cls}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  NCERT Syllabus
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* AI Study Tools Grid */}
        <section aria-labelledby="tools-heading" className="space-y-6 pt-6">
          <div className="text-center space-y-1">
            <h2 id="tools-heading" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              AI Tools Built for Student Success
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Everything you need to master your syllabus and prepare for board exams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreTools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <a
                  key={idx}
                  href={tool.path}
                  onClick={(e) => handleLinkClick(e, tool.path)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* High-Yield Chapter Highlights */}
        <section aria-labelledby="highyield-heading" className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 id="highyield-heading" className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Popular NCERT Chapters &amp; Study Notes
              </h2>
              <p className="text-xs text-slate-500">
                Explore frequently asked textbook topics with curated key concepts and quizzes.
              </p>
            </div>
            <a
              href="/ncert/class-9/science"
              onClick={(e) => handleLinkClick(e, '/ncert/class-9/science')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Class 9 Science</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleChapters.map((ch, i) => (
              <a
                key={i}
                href={ch.path}
                onClick={(e) => handleLinkClick(e, ch.path)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      Class {ch.classLevel} • {ch.subject}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {ch.weightage}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {ch.desc}
                  </p>
                </div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Explore Chapter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section aria-labelledby="faqs-heading" className="space-y-6 pt-6">
          <div className="text-center space-y-1">
            <h2 id="faqs-heading" className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Clear answers about StudyPilot AI features, NCERT textbooks, and study tools.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
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
