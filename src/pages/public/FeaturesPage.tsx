import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { SEOBreadcrumbs } from '../../components/seo/SEOBreadcrumbs';
import {
  getCanonicalUrl,
  getWebApplicationSchema,
  getBreadcrumbSchema,
  getFAQSchema,
} from '../../services/seoService';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  BarChart3,
  Calculator,
  ArrowRight,
  Brain,
  CheckCircle2,
} from 'lucide-react';

interface FeaturesPageProps {
  onNavigate?: (path: string) => void;
}

const FAQS = [
  {
    question: 'How does the NCERT Page-by-Page Quizzer work?',
    answer:
      'The NCERT Quizzer parses textbook pages and instantly creates 3-4 targeted questions based directly on that page’s content. It tests retention before you move on to the next page.',
  },
  {
    question: 'Can I generate customized study plans for my school exam date?',
    answer:
      'Yes. Simply enter your exam date and subjects. StudyPilot AI calculates remaining days and automatically distributes high-yield chapters into manageable daily revision blocks.',
  },
  {
    question: 'What is the Active Recall Weakness Radar?',
    answer:
      'The Weakness Radar analyzes your quiz attempts in real time, highlighting which topics you are struggling with and referencing the exact NCERT textbook page to re-read.',
  },
];

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  const canonicalUrl = getCanonicalUrl('/features');
  const breadcrumbs = [{ label: 'Platform Features', url: '/features' }];

  const jsonLd = [
    getWebApplicationSchema(),
    getBreadcrumbSchema(breadcrumbs),
    getFAQSchema(FAQS),
  ];

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <SEOHead
        metadata={{
          title: 'StudyPilot AI Features – Adaptive Study Tools for Board Exams',
          description:
            'Explore StudyPilot AI study features: NCERT page-by-page reader, automated study timetable, spaced repetition flashcards, and active recall diagnostics.',
          canonicalUrl,
          breadcrumbs,
          jsonLd,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        <SEOBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />

        {/* Page Header */}
        <header className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>INTELLIGENT LEARNING SUITE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            StudyPilot AI Features – Everything You Need to Ace Your Exams
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Discover a unified platform designed to turn textbook overwhelm into systematic mastery. Each tool is built on cognitive science principles for maximum retention and exam confidence.
          </p>
        </header>

        {/* Features List */}
        <section aria-labelledby="features-list-heading" className="space-y-6">
          <h2 id="features-list-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Core Learning Capabilities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Feature 1: NCERT Reader */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                1. Official NCERT Page-by-Page Reader
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Read official textbooks directly on your laptop or phone. Highlight key points, view formula sidebars, and take instant single-page micro-quizzes before turning the page.
              </p>
              <div className="pt-2">
                <a
                  href="/ncert"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('/ncert');
                    }
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                >
                  <span>Browse NCERT Textbooks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Feature 2: AI Study Planner */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Automated AI Study Planner &amp; Timetable
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Enter your target exam date. StudyPilot AI schedules your chapters into bite-sized daily slots, prioritizing high-weightage topics and past weak areas.
              </p>
              <div className="pt-2">
                <a
                  href="/ai-study-planner"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('/ai-study-planner');
                    }
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore AI Study Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Feature 3: Smart Notes */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. High-Yield AI Revision Notes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate instant structured notes, chapter summaries, key definitions, and chemical reactions for any chapter or syllabus topic.
              </p>
              <div className="pt-2">
                <a
                  href="/ai-notes"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('/ai-notes');
                    }
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                >
                  <span>Generate AI Revision Notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Feature 4: Adaptive Quiz Generator */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                4. CBSE Adaptive Quiz Generator
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Practice chapter-level quizzes matching CBSE question patterns: MCQs, assertion-reasoning, numericals, and short answers with step-by-step solutions.
              </p>
              <div className="pt-2">
                <a
                  href="/ai-quiz-generator"
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('/ai-quiz-generator');
                    }
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
                >
                  <span>Practice AI Quizzes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Visible FAQs */}
        <section aria-labelledby="faq-features-heading" className="space-y-4">
          <h2 id="faq-features-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Features FAQ
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
      </div>
    </article>
  );
};
