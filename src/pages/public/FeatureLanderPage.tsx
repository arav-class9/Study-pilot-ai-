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
  Calendar,
  Brain,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  BookOpen,
} from 'lucide-react';

interface FeatureLanderPageProps {
  feature: 'planner' | 'notes' | 'quiz';
  onNavigate?: (path: string) => void;
}

const CONFIGS = {
  planner: {
    path: '/ai-study-planner',
    title: 'AI Study Planner & Daily Timetable Generator | StudyPilot AI',
    description:
      'Plan your school exam preparation with StudyPilot AI study timetable. Automatically distributes NCERT chapters into manageable daily revision blocks.',
    h1: 'AI Study Planner & Intelligent Daily Timetable',
    subtitle:
      'Stop cramming before exam day. Input your subjects and exam date, and let our cognitive engine design a spaced revision timetable.',
    icon: Calendar,
    color: 'indigo',
    points: [
      'Automatic distribution of high-yield NCERT chapters according to board weightage',
      'Spaced repetition review slots built directly into your weekly schedule',
      'Daily 45-minute Pomodoro study intervals with active recall checkpoints',
      'Seamless adjustment when you complete tasks ahead of or behind schedule',
    ],
    sampleTitle: 'Example: 30-Day CBSE Class 10 Science & Math Plan',
    sampleItems: [
      { slot: '04:30 PM - 05:15 PM', task: 'Science: Chemical Reactions and Equations (Balancing Numericals)' },
      { slot: '05:30 PM - 06:15 PM', task: 'Math: Quadratic Equations (Quadratic Formula Drills)' },
      { slot: '06:30 PM - 07:00 PM', task: 'Active Recall Checkpoint: 10 Spaced Repetition Flashcards' },
    ],
    faqs: [
      {
        question: 'How does the AI Study Planner prioritize chapters?',
        answer:
          'It analyzes CBSE past year question paper trends, placing higher-weightage units (such as Light, Electricity, and Triangles) earlier in your revision cycle so you master them with multiple spaced repetitions.',
      },
      {
        question: 'Can I change my daily study hours?',
        answer:
          'Yes. You can customize daily target minutes from 30 minutes to 4 hours. The planner recalculates your completion date instantly.',
      },
    ],
  },
  notes: {
    path: '/ai-notes',
    title: 'AI Revision Notes & NCERT Chapter Summaries | StudyPilot AI',
    description:
      'Generate high-yield revision notes, chemical equations, mathematical formulas, and NCERT chapter summaries with StudyPilot AI.',
    h1: 'AI Revision Notes & Concept Cheat Sheets',
    subtitle:
      'Get crisp, syllabus-accurate study notes with key definitions, formulas, and board exam tips for any NCERT chapter.',
    icon: Brain,
    color: 'purple',
    points: [
      'Comprehensive concept summaries extracted directly from official textbook chapters',
      'Ready-to-memorize formula sheets and balanced chemical reaction cheat sheets',
      'Highlighting of common student misconceptions and board exam pitfalls',
      'Downloadable or savable to your private personal revision workspace',
    ],
    sampleTitle: 'Sample High-Yield Note: Chemical Reactions & Equations',
    sampleItems: [
      { slot: 'Law of Conservation of Mass', task: 'Total mass of reactants must equal total mass of products in any chemical reaction.' },
      { slot: 'Precipitation Reaction', task: 'Pb(NO₃)₂ + 2KI → PbI₂↓ (yellow precipitate) + 2KNO₃' },
      { slot: 'Redox Definition', task: 'Oxidation is gain of oxygen/loss of hydrogen; Reduction is loss of oxygen/gain of hydrogen.' },
    ],
    faqs: [
      {
        question: 'Are the AI notes aligned with NCERT?',
        answer:
          'Yes. StudyPilot AI strictly grounds all note generation in authentic NCERT textbook text and CBSE marking schemes.',
      },
      {
        question: 'Can I create notes for my own uploaded textbooks?',
        answer:
          'Yes. Once signed in, you can upload any textbook PDF or chapter photo, and the AI will summarize individual pages into structured notes.',
      },
    ],
  },
  quiz: {
    path: '/ai-quiz-generator',
    title: 'AI Quiz Generator & CBSE Board Question Bank | StudyPilot AI',
    description:
      'Practice adaptive CBSE quizzes, assertion-reason questions, and NCERT textbook exercise drills with instant step-by-step explanations.',
    h1: 'AI Quiz Generator & Board Exam Question Drills',
    subtitle:
      'Test your understanding before the exam. Solve adaptive MCQs, numericals, and assertion-reason questions with step-by-step solutions.',
    icon: Layers,
    color: 'emerald',
    points: [
      'Questions mapped to Bloom’s taxonomy: Recall, Conceptual, Numerical, and Application',
      'Authentic CBSE question formats including Assertion & Reason and Case-Based MCQs',
      'Instant explanation citing the exact NCERT textbook page for mistake correction',
      'Dynamic difficulty adaptation that challenges you as your accuracy increases',
    ],
    sampleTitle: 'Sample Board Exam Practice Questions',
    sampleItems: [
      { slot: 'Assertion-Reason', task: 'A: Rusting of iron is an endothermic process. R: Heat is absorbed during iron oxidation. (Evaluate correctness)' },
      { slot: 'Numerical Problem', task: 'Calculate resistance of a conductor with 2V potential difference and 0.5A current.' },
      { slot: 'Conceptual MCQ', task: 'Why does dry HCl gas not change the colour of dry litmus paper? (Absence of H⁺ ions in dry state)' },
    ],
    faqs: [
      {
        question: 'What types of questions are generated?',
        answer:
          'Multiple Choice Questions (MCQs), Assertion-Reason, Short Answer, and Numerical Calculation problems matching latest board patterns.',
      },
      {
        question: 'How does it help fix weak topics?',
        answer:
          'Whenever you answer incorrectly, the question is logged to your Weakness Radar with a direct citation to the NCERT textbook page to review.',
      },
    ],
  },
};

export const FeatureLanderPage: React.FC<FeatureLanderPageProps> = ({ feature, onNavigate }) => {
  const conf = CONFIGS[feature];
  const canonicalUrl = getCanonicalUrl(conf.path);
  const breadcrumbs = [
    { label: 'Features', url: '/features' },
    { label: conf.h1, url: conf.path },
  ];

  const jsonLd = [
    getWebApplicationSchema(),
    getBreadcrumbSchema(breadcrumbs),
    getFAQSchema(conf.faqs),
  ];

  const Icon = conf.icon;

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <SEOHead
        metadata={{
          title: conf.title,
          description: conf.description,
          canonicalUrl,
          breadcrumbs,
          jsonLd,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        <SEOBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />

        {/* Hero Header */}
        <header className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Icon className="w-3.5 h-3.5" />
            <span>STUDYPILOT AI CAPABILITY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {conf.h1}
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {conf.subtitle}
          </p>
        </header>

        {/* Benefits Grid */}
        <section aria-labelledby="benefits-heading" className="space-y-4">
          <h2 id="benefits-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Key Educational Advantages
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {conf.points.map((pt, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">
                  {pt}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Concrete Curriculum Example */}
        <section
          aria-labelledby="sample-heading"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 id="sample-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {conf.sampleTitle}
            </h2>
          </div>

          <div className="space-y-2.5">
            {conf.sampleItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {item.slot}
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {item.task}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section aria-labelledby="faqs-heading" className="space-y-4">
          <h2 id="faqs-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Common Questions
          </h2>

          <div className="space-y-3">
            {conf.faqs.map((faq, i) => (
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

        {/* CTA */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Start preparing with StudyPilot AI today</h3>
            <p className="text-xs text-indigo-100">
              Access authentic NCERT textbook materials and smart interactive study tools.
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
            <span>Explore All Chapters</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  );
};
