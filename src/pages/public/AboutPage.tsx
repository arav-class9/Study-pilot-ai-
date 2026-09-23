import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { SEOBreadcrumbs } from '../../components/seo/SEOBreadcrumbs';
import {
  getCanonicalUrl,
  getOrganizationSchema,
  getFAQSchema,
  getBreadcrumbSchema,
} from '../../services/seoService';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Brain,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (path: string) => void;
}

const FAQS = [
  {
    question: 'How does StudyPilot AI align with the CBSE & NCERT curriculum?',
    answer:
      'StudyPilot AI is structured directly around authentic NCERT curriculum standards for Classes 6 through 12. Every chapter, topic, learning objective, and practice quiz follows board exam weightage and pedagogical guidelines.',
  },
  {
    question: 'What learning techniques does StudyPilot AI use?',
    answer:
      'StudyPilot AI integrates three scientifically verified cognitive learning principles: the Feynman Self-Explanation Technique for conceptual clarity, Spaced Repetition for long-term memory retention, and Active Recall for exam accuracy.',
  },
  {
    question: 'Can students use StudyPilot AI without creating an account?',
    answer:
      'Yes. Students can explore all public NCERT syllabus guides, chapter summaries, key formulas, and topic overviews completely free without registration. Account creation unlocks personalized study plans, progress syncing, and custom note storage.',
  },
  {
    question: 'Does StudyPilot AI share private student data or uploaded notes?',
    answer:
      'No. User data, uploaded PDFs, personal study notes, and diagnostic quiz results are completely private, encrypted, and excluded from search engine indexing.',
  },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const canonicalUrl = getCanonicalUrl('/about');
  const breadcrumbs = [{ label: 'About StudyPilot AI', url: '/about' }];

  const jsonLd = [
    getOrganizationSchema(),
    getBreadcrumbSchema(breadcrumbs),
    getFAQSchema(FAQS),
  ];

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <SEOHead
        metadata={{
          title: 'About StudyPilot AI – Mission, Curriculum & Learning Methodology',
          description:
            'Discover how StudyPilot AI combines authentic NCERT curriculum with spaced repetition, Feynman technique, and AI tutoring to help school students excel.',
          canonicalUrl,
          breadcrumbs,
          jsonLd,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        <SEOBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />

        {/* Page Header */}
        <header className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>EDUCATIONAL MISSION &amp; PEDAGOGY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            About StudyPilot AI – Smarter Learning for Every Student
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            StudyPilot AI is an adaptive, research-backed learning companion designed specifically for Indian school students (CBSE, ICSE, and State Boards). We bridge the gap between heavy textbooks and effortless mastery through active cognitive recall.
          </p>
        </header>

        {/* Core Pillars */}
        <section aria-labelledby="core-pillars-heading" className="space-y-4">
          <h2 id="core-pillars-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Our Cognitive Learning Framework
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Feynman Self-Explanation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If you cannot explain a concept in simple words, you do not understand it deeply yet. Our system guides students to articulate theories in their own voice with instant AI validation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Spaced Repetition Engine
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Counteracts the Ebbinghaus forgetting curve by scheduling targeted revisions at 1-day, 3-day, and 7-day intervals based on individual mistake patterns.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Authentic NCERT Grounding
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every quiz, definition, and formula is mapped to official curriculum chapters for Class 6 to 12. No hallucinated syllabus, pure board alignment.
              </p>
            </div>
          </div>
        </section>

        {/* Curriculum Coverage Summary */}
        <section aria-labelledby="curriculum-heading" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h2 id="curriculum-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Curriculum &amp; Board Exam Coverage
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            StudyPilot AI covers key academic disciplines across Secondary and Senior Secondary grades:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-semibold">
              🔬 Science (Classes 6–10)
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-semibold">
              📐 Mathematics (Classes 6–12)
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-semibold">
              ⚡ Physics (Classes 11–12)
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-semibold">
              🧪 Chemistry (Classes 11–12)
            </div>
          </div>
        </section>

        {/* Visible Frequently Asked Questions (FAQPage Schema validated) */}
        <section aria-labelledby="faq-heading" className="space-y-4">
          <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
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

        {/* Internal Link CTA */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Ready to master your syllabus?</h3>
            <p className="text-xs text-indigo-100">
              Browse authentic NCERT textbook chapters, formulas, and interactive quizzes.
            </p>
          </div>
          <a
            href="/ncert"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('/ncert');
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <span>Explore NCERT Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  );
};
