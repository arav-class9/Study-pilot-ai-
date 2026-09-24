import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { SEOBreadcrumbs } from '../../components/seo/SEOBreadcrumbs';
import {
  getCanonicalUrl,
  getSoftwareApplicationSchema,
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
  HelpCircle,
  Lightbulb,
  Zap,
  BookOpen,
} from 'lucide-react';

export type FeatureType =
  | 'assistant'
  | 'notes'
  | 'quiz'
  | 'flashcards'
  | 'planner'
  | 'solver';

interface FeatureLanderPageProps {
  feature: FeatureType;
  onNavigate?: (path: string) => void;
}

interface FeatureConfig {
  path: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  icon: React.ElementType;
  points: string[];
  sampleTitle: string;
  sampleItems: { slot: string; task: string }[];
  faqs: { question: string; answer: string }[];
  relatedLinks: { label: string; path: string }[];
}

const CONFIGS: Record<FeatureType, FeatureConfig> = {
  assistant: {
    path: '/ai-study-assistant',
    title: 'AI Study Assistant for School Students & NCERT | StudyPilot AI',
    description:
      'Learn smarter with StudyPilot AI study assistant. Get personalized explanations, textbook concept breakdowns, step-by-step doubt resolution, and interactive revision support.',
    h1: 'AI Study Assistant for School Students',
    subtitle:
      'Understand tough concepts faster with personalized explanations grounded directly in your syllabus and textbook chapters.',
    icon: Sparkles,
    points: [
      'Grounded explanations directly matching CBSE and NCERT textbook curricula',
      'Step-by-step breakdown of complex formulas, definitions, and scientific processes',
      'Interactive Socratic dialogue that guides you to the solution without giving away answers immediately',
      'Adaptable explanations available in simple student-friendly English and Hinglish',
    ],
    sampleTitle: 'Sample Student Query & AI Explanation',
    sampleItems: [
      {
        slot: 'Question',
        task: 'Why do planets not twinkle like stars?',
      },
      {
        slot: 'Core Concept',
        task: 'Atmospheric Refraction & Extended Light Sources (NCERT Class 10 Science, Ch 11).',
      },
      {
        slot: 'Explanation Summary',
        task: 'Planets are much closer to Earth and act as extended sources composed of multiple point sources of light. The variations in light intensity from individual points average out to zero.',
      },
    ],
    faqs: [
      {
        question: 'How does the StudyPilot AI assistant differ from general chatbots?',
        answer:
          'StudyPilot AI is specifically tuned for Indian school curricula (Classes 6 to 12). Its explanations refer directly to official NCERT chapters, key exam terms, and board marking schemes.',
      },
      {
        question: 'Can I ask questions from any textbook chapter?',
        answer:
          'Yes. You can explore explanations across Science, Mathematics, Social Science, English, and Physics, Chemistry, and Biology.',
      },
    ],
    relatedLinks: [
      { label: 'NCERT Class 9 Science', path: '/ncert/class-9/science' },
      { label: 'AI Notes Generator', path: '/ai-notes-generator' },
      { label: 'AI Quiz Generator', path: '/ai-quiz-generator' },
    ],
  },
  notes: {
    path: '/ai-notes-generator',
    title: 'AI Notes Generator & NCERT Chapter Summaries | StudyPilot AI',
    description:
      'Generate high-yield revision notes, formula sheets, chemical equations, and NCERT chapter summaries with StudyPilot AI notes generator.',
    h1: 'AI Notes Generator & High-Yield Revision Summaries',
    subtitle:
      'Generate structured, syllabus-aligned revision notes, key definitions, and formula cheat sheets for any school textbook chapter.',
    icon: Brain,
    points: [
      'Structured concept summaries extracted from authentic NCERT textbook chapters',
      'Curated formula sheets, units, and balanced chemical reaction cheat sheets',
      'Clear identification of common exam pitfalls and high-frequency board questions',
      'Designed for quick 10-minute active revision before tests and exams',
    ],
    sampleTitle: 'Sample High-Yield Note: Chemical Reactions & Equations (Class 10)',
    sampleItems: [
      {
        slot: 'Law of Conservation of Mass',
        task: 'Total mass of reactants must equal total mass of products in every chemical reaction.',
      },
      {
        slot: 'Precipitation Reaction',
        task: 'Pb(NO₃)₂ (aq) + 2KI (aq) → PbI₂↓ (yellow precipitate) + 2KNO₃ (aq)',
      },
      {
        slot: 'Redox Definition',
        task: 'Oxidation is the gain of oxygen or loss of hydrogen; Reduction is the loss of oxygen or gain of hydrogen.',
      },
    ],
    faqs: [
      {
        question: 'Are the AI notes strictly aligned with the NCERT syllabus?',
        answer:
          'Yes. Every generated summary strictly uses official terminology, balanced reactions, and standard formulas compliant with NCERT guidelines.',
      },
      {
        question: 'Can I download or save the notes for offline revision?',
        answer:
          'Yes. Registered students can save generated notes directly to their personal workspace for quick access across devices.',
      },
    ],
    relatedLinks: [
      { label: 'NCERT Class 10 Science', path: '/ncert/class-10/science' },
      { label: 'AI Flashcards', path: '/ai-flashcards' },
      { label: 'AI Study Assistant', path: '/ai-study-assistant' },
    ],
  },
  quiz: {
    path: '/ai-quiz-generator',
    title: 'AI Quiz Generator & CBSE Board Question Bank | StudyPilot AI',
    description:
      'Practice adaptive CBSE quizzes, assertion-reason questions, and NCERT textbook exercise drills with instant step-by-step explanations.',
    h1: 'AI Quiz Generator & Adaptive Practice Questions',
    subtitle:
      'Test your understanding before exam day. Practice adaptive MCQs, numericals, and assertion-reason drills with instant step-by-step explanations.',
    icon: Layers,
    points: [
      'Questions mapped to Bloom’s taxonomy: Recall, Conceptual Understanding, and Application',
      'Official board exam question formats including Assertion & Reason and Case-Based MCQs',
      'Instant pedagogical explanations identifying the exact concept to review upon mistake',
      'Dynamic difficulty adaptation that matches your mastery level as you improve',
    ],
    sampleTitle: 'Sample Board Exam Practice Questions',
    sampleItems: [
      {
        slot: 'Assertion-Reason',
        task: 'Assertion: Rusting of iron is an oxidation reaction. Reason: Iron reacts with oxygen and moisture in air to form hydrated iron oxide.',
      },
      {
        slot: 'Numerical Problem',
        task: 'Calculate the equivalent resistance when two 6-ohm resistors are connected in parallel. (Answer: 3 Ohms)',
      },
      {
        slot: 'Conceptual MCQ',
        task: 'Why does dry HCl gas not change the colour of dry litmus paper? (Absence of free H⁺ / H₃O⁺ ions in non-aqueous state)',
      },
    ],
    faqs: [
      {
        question: 'What types of questions does the AI quiz generator create?',
        answer:
          'It generates Multiple Choice Questions (MCQs), Assertion-Reason questions, one-word recall questions, and multi-step numerical calculation problems.',
      },
      {
        question: 'How do quizzes help with exam preparation?',
        answer:
          'Active recall and spaced quizzing are scientifically proven to improve long-term retention compared to passive reading.',
      },
    ],
    relatedLinks: [
      { label: 'AI Flashcards', path: '/ai-flashcards' },
      { label: 'NCERT Class 9 Maths', path: '/ncert/class-9/maths' },
      { label: 'AI Question Solver', path: '/ai-question-solver' },
    ],
  },
  flashcards: {
    path: '/ai-flashcards',
    title: 'AI Flashcards & Spaced Repetition Study Tools | StudyPilot AI',
    description:
      'Memorize formulas, chemical equations, historical dates, and scientific definitions faster with AI-powered spaced repetition flashcards.',
    h1: 'AI Flashcards & Spaced Repetition Learning',
    subtitle:
      'Lock key formulas, definitions, and facts into long-term memory using intelligent spaced repetition and active recall flashcards.',
    icon: Zap,
    points: [
      'Smart flashcard generation from NCERT chapters and textbook sections',
      'Active recall prompts designed to strengthen cognitive retrieval pathways',
      'Spaced repetition scheduling (SM-2 algorithm) that resurfaces cards right before you forget them',
      'Dual-sided cards featuring clear questions on front and concise explanations on back',
    ],
    sampleTitle: 'Sample Flashcard Deck: Physics & Chemistry Essentials',
    sampleItems: [
      {
        slot: "Front: Newton's Second Law Formula",
        task: 'Back: F = dp/dt = m·a (where F is net force, m is mass, and a is acceleration).',
      },
      {
        slot: 'Front: Power of Accommodation Definition',
        task: 'Back: The ability of the eye lens to adjust its focal length using ciliary muscles.',
      },
      {
        slot: 'Front: Acid + Metal Carbonate Reaction',
        task: 'Back: Acid + Metal Carbonate → Salt + Carbon Dioxide (CO₂) + Water (H₂O).',
      },
    ],
    faqs: [
      {
        question: 'How does spaced repetition help students?',
        answer:
          'Spaced repetition counteracts the Ebbinghaus forgetting curve by reviewing concepts at systematically calculated intervals, maximizing memory retention with minimal study time.',
      },
      {
        question: 'Can I generate flashcards for specific chapters?',
        answer:
          'Yes. You can select any NCERT chapter and instantly generate targeted flashcards for formulas, terms, and key facts.',
      },
    ],
    relatedLinks: [
      { label: 'AI Notes Generator', path: '/ai-notes-generator' },
      { label: 'AI Quiz Generator', path: '/ai-quiz-generator' },
      { label: 'NCERT Hub', path: '/ncert' },
    ],
  },
  planner: {
    path: '/ai-study-planner',
    title: 'AI Study Planner & Daily Exam Timetable Generator | StudyPilot AI',
    description:
      'Plan your school exam preparation with StudyPilot AI study timetable. Automatically distributes NCERT chapters into manageable daily revision blocks.',
    h1: 'AI Study Planner & Daily Timetable Generator',
    subtitle:
      'Eliminate exam stress. Input your exam date and subjects, and let our study planner build a balanced, spaced revision schedule.',
    icon: Calendar,
    points: [
      'Automatic chapter distribution based on board exam weightage and personal strengths',
      'Built-in spaced revision days to reinforce previously covered topics',
      'Focused 45-minute Pomodoro study blocks with structured active recall checkpoints',
      'Dynamic schedule adjustment when you finish ahead of time or need extra time on tough chapters',
    ],
    sampleTitle: 'Sample 30-Day CBSE Revision Schedule',
    sampleItems: [
      {
        slot: '04:30 PM - 05:15 PM',
        task: 'Science: Chemical Reactions and Equations (Balancing & Reaction Types)',
      },
      {
        slot: '05:30 PM - 06:15 PM',
        task: 'Maths: Quadratic Equations (Roots by Factorisation & Quadratic Formula)',
      },
      {
        slot: '06:30 PM - 07:00 PM',
        task: 'Active Recall Checkpoint: 10 Spaced Repetition Flashcards & Quiz',
      },
    ],
    faqs: [
      {
        question: 'How does the AI Study Planner prioritize chapters?',
        answer:
          'It analyzes standard board weightages, placing fundamental and high-mark chapters earlier in your revision cycle so you master them with multiple review intervals.',
      },
      {
        question: 'Can I adjust my daily study hours?',
        answer:
          'Yes. You can customize daily study hours to fit your school routine, and the planner recalculates your milestones automatically.',
      },
    ],
    relatedLinks: [
      { label: 'AI Study Assistant', path: '/ai-study-assistant' },
      { label: 'AI Notes Generator', path: '/ai-notes-generator' },
      { label: 'NCERT Class 9', path: '/ncert/class-9' },
    ],
  },
  solver: {
    path: '/ai-question-solver',
    title: 'AI Question Solver & Step-by-Step Problem Explainer | StudyPilot AI',
    description:
      'Solve textbook numericals, NCERT exercise questions, and science problems with clear step-by-step reasoning on StudyPilot AI.',
    h1: 'AI Question Solver & Step-by-Step Explanations',
    subtitle:
      'Stuck on a tricky homework or exercise question? Get clear, step-by-step guidance that explains the underlying principles so you can solve it yourself.',
    icon: Lightbulb,
    points: [
      'Step-by-step mathematical derivations with clear formula statements and unit conversions',
      'Conceptual physics problem breakdowns showing free-body diagrams and equations of motion',
      'Balanced chemical equations with reaction condition explanations and state symbols',
      'Pedagogical hints that foster deep problem-solving skills rather than rote copying',
    ],
    sampleTitle: 'Sample Problem Solving Walkthrough',
    sampleItems: [
      {
        slot: 'Problem',
        task: 'An object of mass 2 kg accelerates from 4 m/s to 10 m/s in 3 seconds. Find the magnitude of the force applied.',
      },
      {
        slot: 'Step 1: Acceleration',
        task: 'a = (v - u) / t = (10 m/s - 4 m/s) / 3 s = 6 / 3 = 2 m/s²',
      },
      {
        slot: 'Step 2: Force Calculation',
        task: 'F = m · a = 2 kg · 2 m/s² = 4 N (Newtons).',
      },
    ],
    faqs: [
      {
        question: 'Can the solver handle step-by-step math and science numericals?',
        answer:
          'Yes. It provides full step-by-step derivations including given values, formulas used, unit conversions, and final answers.',
      },
      {
        question: 'Does the solver cite NCERT textbook chapters?',
        answer:
          'Yes. Each solution references the relevant chapter concept so you can review the full textbook context.',
      },
    ],
    relatedLinks: [
      { label: 'NCERT Class 9 Science', path: '/ncert/class-9/science' },
      { label: 'AI Quiz Generator', path: '/ai-quiz-generator' },
      { label: 'AI Study Assistant', path: '/ai-study-assistant' },
    ],
  },
};

export const FeatureLanderPage: React.FC<FeatureLanderPageProps> = ({ feature, onNavigate }) => {
  const conf = CONFIGS[feature] || CONFIGS.assistant;
  const canonicalUrl = getCanonicalUrl(conf.path);
  const breadcrumbs = [
    { label: 'Features', url: '/features' },
    { label: conf.h1, url: conf.path },
  ];

  const jsonLd = [
    getSoftwareApplicationSchema(),
    getBreadcrumbSchema(breadcrumbs),
    getFAQSchema(conf.faqs),
  ];

  const Icon = conf.icon;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

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
            <span>STUDYPILOT AI FEATURE</span>
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
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 id="sample-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {conf.sampleTitle}
            </h2>
          </div>

          <div className="space-y-2.5">
            {conf.sampleItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs"
              >
                <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0 sm:w-48">
                  {item.slot}
                </span>
                <span className="text-slate-700 dark:text-slate-300 flex-1">
                  {item.task}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section aria-labelledby="faqs-heading" className="space-y-4">
          <h2 id="faqs-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
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

        {/* Related Educational Pages */}
        {conf.relatedLinks && conf.relatedLinks.length > 0 && (
          <section aria-labelledby="related-heading" className="space-y-3">
            <h3 id="related-heading" className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Related NCERT &amp; Study Resources
            </h3>
            <div className="flex flex-wrap gap-2">
              {conf.relatedLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.path}
                  onClick={(e) => handleLinkClick(e, link.path)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        )}

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
            onClick={(e) => handleLinkClick(e, '/ncert')}
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
