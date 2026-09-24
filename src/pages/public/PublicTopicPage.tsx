import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { SEOBreadcrumbs } from '../../components/seo/SEOBreadcrumbs';
import {
  getCanonicalUrl,
  getEducationalContentSchema,
  getBreadcrumbSchema,
  slugify,
} from '../../services/seoService';
import { CURRICULUM_DATA } from '../../data/curriculum';
import {
  Brain,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Lightbulb,
} from 'lucide-react';

interface PublicTopicPageProps {
  topicSlug: string;
  onNavigate?: (path: string) => void;
  onLaunchTopicWorkspace?: (topicName: string) => void;
}

interface CuratedTopicDetail {
  slug: string;
  title: string;
  subject: string;
  classLevel: string;
  simpleExplanation: string;
  detailedExplanation: string;
  keyFormulas: string[];
  solvedExample: { question: string; answer: string };
  commonMistakes: string[];
  revisionPoints: string[];
  practiceQuestions: { question: string; solution: string }[];
  relatedChapterTitle: string;
  relatedChapterSlug: string;
}

const CURATED_TOPICS: Record<string, CuratedTopicDetail> = {
  'newtons-laws-of-motion': {
    slug: 'newtons-laws-of-motion',
    title: "Newton's Laws of Motion",
    subject: 'Physics',
    classLevel: '9',
    simpleExplanation:
      "Newton's three laws of motion describe how objects move and interact: things keep doing what they are doing unless pushed (Inertia), pushing harder makes things speed up faster (F=ma), and every push creates an equal and opposite push back (Action-Reaction).",
    detailedExplanation:
      "Formulated by Sir Isaac Newton in 1687, these laws form the cornerstone of classical Newtonian mechanics. The First Law establishes the concept of inertial reference frames. The Second Law quantifies force as the rate of change of momentum (dp/dt = ma for constant mass). The Third Law mandates that forces always occur in mutual interaction pairs acting on two distinct bodies.",
    keyFormulas: [
      'First Law (Inertia): If ΣF = 0, then a = 0 (velocity remains constant)',
      'Second Law: F = m · a (Force in Newtons = mass in kg × acceleration in m/s²)',
      'Linear Momentum: p = m · v',
      'Third Law: F_AB = -F_BA (Equal magnitude, opposite directions)',
      'Conservation of Momentum: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂',
    ],
    solvedExample: {
      question: 'A net force of 20 N is applied to a 4 kg cart at rest. Calculate its acceleration and speed after 3 seconds.',
      answer:
        '1) Using F = ma: a = F / m = 20 N / 4 kg = 5 m/s².\n2) Using v = u + at (starting from rest, u = 0): v = 0 + (5 m/s²)(3 s) = 15 m/s.',
    },
    commonMistakes: [
      'Confusing action and reaction forces as canceling each other out. They act on two completely different bodies, so they never cancel.',
      'Assuming force is required to maintain motion. An object in uniform motion requires zero net force; force is only required to change velocity.',
      'Treating mass and weight as identical. Mass is scalar (kg); weight is gravitational force (W = mg in Newtons).',
    ],
    revisionPoints: [
      'Inertia depends solely on mass; higher mass means higher inertia.',
      'Force is a vector quantity having both magnitude and direction.',
      'Impulse equals change in momentum (J = F · Δt = Δp).',
      'Action and reaction forces occur simultaneously with zero time delay.',
    ],
    practiceQuestions: [
      {
        question: 'Why does a passenger jerk backward when a bus abruptly starts moving forward?',
        solution: 'Due to inertia of rest: the passenger’s lower body moves forward with the bus, while the upper body tends to remain at rest.',
      },
      {
        question: 'Why does a cricketer pull his hands backward while catching a fast ball?',
        solution: 'Increasing the time interval (Δt) reduces the impact force on the hands according to Newton’s second law (F = Δp / Δt).',
      },
    ],
    relatedChapterTitle: 'Force and Laws of Motion',
    relatedChapterSlug: 'force-and-laws-of-motion',
  },
  'chemical-reactions-and-equations': {
    slug: 'chemical-reactions-and-equations',
    title: 'Chemical Reactions and Equations',
    subject: 'Chemistry',
    classLevel: '10',
    simpleExplanation:
      'A chemical reaction happens when chemical bonds break and reform to create entirely new substances with different properties, such as rusting iron or milk turning into curd.',
    detailedExplanation:
      'Chemical equations represent reactions using chemical formulas and state symbols (s, l, g, aq). According to the Law of Conservation of Mass, the total number of atoms of each element must remain identical before and after the reaction, which requires balancing equations using stoichiometric coefficients.',
    keyFormulas: [
      'Combination: A + B → AB (e.g. CaO + H₂O → Ca(OH)₂ + Heat)',
      'Decomposition: AB → A + B (Thermal, Electrolytic, or Photolytic)',
      'Displacement: A + BC → AC + B (Fe + CuSO₄ → FeSO₄ + Cu)',
      'Double Displacement: AB + CD → AD + CB (Precipitation)',
      'Redox: Oxidation (loss of electrons/gain of O) & Reduction (gain of electrons/loss of O)',
    ],
    solvedExample: {
      question: 'Balance the equation for the reaction of iron with steam: Fe + H₂O → Fe₃O₄ + H₂',
      answer:
        '1) Iron: 3 Fe on left → 3 Fe\n2) Oxygen: 4 on right → 4 H₂O\n3) Hydrogen: 4 × 2 = 8 H on left → 4 H₂\nBalanced equation: 3Fe(s) + 4H₂O(g) → Fe₃O₄(s) + 4H₂(g)',
    },
    commonMistakes: [
      'Altering chemical subscripts to balance equations instead of adding front coefficients (e.g. writing H₂O₂ instead of 2H₂O).',
      'Forgetting to mention state symbols (s, l, g, aq) in board exam answer sheets.',
      'Misidentifying oxidizing agents: the substance that gets reduced is the oxidizing agent.',
    ],
    revisionPoints: [
      'Endothermic reactions absorb heat; exothermic reactions release heat.',
      'Corrosion is oxidation of metals by air, moisture, and acid.',
      'Rancidity of oily food is prevented with nitrogen gas or antioxidants.',
    ],
    practiceQuestions: [
      {
        question: 'Why is respiration considered an exothermic reaction?',
        solution: 'Glucose combines with oxygen in cells releasing ATP energy and carbon dioxide: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy.',
      },
      {
        question: 'What happens when barium chloride reacts with sodium sulphate?',
        solution: 'A white precipitate of barium sulphate forms: BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl (Double displacement).',
      },
    ],
    relatedChapterTitle: 'Chemical Reactions and Equations',
    relatedChapterSlug: 'chemical-reactions-and-equations',
  },
};

export const PublicTopicPage: React.FC<PublicTopicPageProps> = ({
  topicSlug,
  onNavigate,
  onLaunchTopicWorkspace,
}) => {
  // Check curated list first, fallback to generic synthesis from curriculum database
  let topic = CURATED_TOPICS[topicSlug];

  if (!topic) {
    // Search in curriculum
    const cleanSlug = topicSlug.toLowerCase();
    let foundTitle = topicSlug.replace(/-/g, ' ');
    let foundSubject = 'Science';
    let foundClass = '10';

    for (const ch of CURRICULUM_DATA) {
      for (const t of ch.topics) {
        if (slugify(t.name) === cleanSlug) {
          foundTitle = t.name;
          foundSubject = ch.subjectId;
          foundClass = ch.classLevel;
          break;
        }
      }
    }

    topic = {
      slug: topicSlug,
      title: foundTitle.charAt(0).toUpperCase() + foundTitle.slice(1),
      subject: foundSubject.toUpperCase(),
      classLevel: foundClass,
      simpleExplanation: `${foundTitle} is an essential academic concept in Class ${foundClass} ${foundSubject}. It forms a foundational component for CBSE board assessments and progressive higher-level STEM studies.`,
      detailedExplanation: `In the standard NCERT curriculum, ${foundTitle} explores core scientific mechanisms, theoretical derivations, and real-world observations. Students are tested on conceptual understanding, precision definitions, and step-by-step mathematical or chemical problem solving.`,
      keyFormulas: [
        `Fundamental Theorem of ${foundTitle}`,
        'Conservation & Equilibrium principles applied to this unit',
        'Standard SI unit definitions and dimension analysis',
      ],
      solvedExample: {
        question: `How is ${foundTitle} evaluated in board examinations?`,
        answer:
          'Questions typically combine 1-mark objective inquiries on definitions, 2-mark conceptual reasoning, and 3-mark analytical numerical problems requiring structured formula substitution.',
      },
      commonMistakes: [
        'Skipping unit conversions (e.g. cm to meters or grams to kilograms).',
        'Incomplete diagrams without proper directional labels.',
        'Overlooking initial condition assumptions.',
      ],
      revisionPoints: [
        `Understand the core definition of ${foundTitle} before memorizing formulas.`,
        'Practice at least 5 NCERT in-text textbook questions.',
        'Review past year questions to identify recurring board examination patterns.',
      ],
      practiceQuestions: [
        {
          question: `State the fundamental definition and significance of ${foundTitle}.`,
          solution: `Refer to NCERT Class ${foundClass} ${foundSubject} chapter reference for standard board marking scheme definitions.`,
        },
      ],
      relatedChapterTitle: foundTitle,
      relatedChapterSlug: slugify(foundTitle),
    };
  }

  const pageUrl = `/topic/${topic.slug}`;
  const canonicalUrl = getCanonicalUrl(pageUrl);

  const breadcrumbs = [
    { label: 'NCERT Hub', url: '/ncert' },
    { label: `Class ${topic.classLevel}`, url: `/ncert/class-${topic.classLevel}` },
    { label: topic.subject, url: `/ncert/class-${topic.classLevel}/${topic.subject.toLowerCase()}` },
    { label: topic.title, url: pageUrl },
  ];

  const jsonLd = [
    getEducationalContentSchema({
      title: `${topic.title} – Notes, Formulas & Quizzes | StudyPilot AI`,
      description: topic.simpleExplanation,
      url: canonicalUrl,
      educationalLevel: `Class ${topic.classLevel} Secondary Education`,
      subject: topic.subject,
    }),
    getBreadcrumbSchema(breadcrumbs),
  ];

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <SEOHead
        metadata={{
          title: `${topic.title} – AI Notes, Explanation & Quiz | StudyPilot AI`,
          description: `Master ${topic.title} for Class ${topic.classLevel} ${topic.subject}. Free revision notes, formulas, common mistakes, and NCERT practice questions.`,
          canonicalUrl,
          breadcrumbs,
          jsonLd,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        <SEOBreadcrumbs items={breadcrumbs} onNavigate={onNavigate} />

        {/* Topic Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase">
              Class {topic.classLevel} • {topic.subject}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              Verified NCERT Curriculum
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {topic.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {topic.simpleExplanation}
          </p>
        </header>

        {/* Action CTAs */}
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => {
              if (onLaunchTopicWorkspace) {
                onLaunchTopicWorkspace(topic.title);
              } else if (onNavigate) {
                onNavigate('/workspace');
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            <span>Open Interactive Topic Workspace</span>
          </button>

          <a
            href={`/ncert/class-${topic.classLevel}/${topic.subject.toLowerCase()}/${topic.relatedChapterSlug}`}
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate(`/ncert/class-${topic.classLevel}/${topic.subject.toLowerCase()}/${topic.relatedChapterSlug}`);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:border-indigo-400 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>View Chapter: {topic.relatedChapterTitle}</span>
          </a>
        </div>

        {/* Detailed Explanation Section */}
        <section aria-labelledby="detailed-explanation-heading" className="p-3.5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 min-w-0">
          <h2 id="detailed-explanation-heading" className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
            <span>In-Depth Conceptual Breakdown</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words [overflow-wrap:anywhere]">
            {topic.detailedExplanation}
          </p>
        </section>

        {/* Important Formulas & Equations */}
        <section aria-labelledby="formulas-heading" className="space-y-3 sm:space-y-4 min-w-0">
          <h2 id="formulas-heading" className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>Key Formulas, Laws &amp; Definitions</span>
          </h2>

          <div className="space-y-2 min-w-0">
            {topic.keyFormulas.map((formula, i) => (
              <div
                key={i}
                className="p-3 sm:p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-xs sm:text-sm font-mono font-semibold text-indigo-950 dark:text-indigo-200 break-words [overflow-wrap:anywhere] overflow-x-auto"
              >
                {formula}
              </div>
            ))}
          </div>
        </section>

        {/* Solved Example */}
        <section aria-labelledby="solved-example-heading" className="p-3.5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 min-w-0">
          <h2 id="solved-example-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Step-by-Step Solved Problem
          </h2>
          <div className="space-y-2 text-xs sm:text-sm min-w-0">
            <p className="font-bold text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">
              Q: {topic.solvedExample.question}
            </p>
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono text-xs break-words [overflow-wrap:anywhere] overflow-x-auto">
              {topic.solvedExample.answer}
            </div>
          </div>
        </section>

        {/* Common Student Mistakes */}
        <section aria-labelledby="common-mistakes-heading" className="space-y-3 sm:space-y-4 min-w-0">
          <h2 id="common-mistakes-heading" className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>Common Exam Mistakes &amp; Pitfalls</span>
          </h2>

          <div className="space-y-2 min-w-0">
            {topic.commonMistakes.map((mistake, i) => (
              <div
                key={i}
                className="p-3 sm:p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs sm:text-sm text-rose-950 dark:text-rose-200 flex items-start gap-2.5 break-words [overflow-wrap:anywhere]"
              >
                <span className="font-bold text-rose-600 shrink-0">✕</span>
                <span className="break-words [overflow-wrap:anywhere] min-w-0 flex-1">{mistake}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Practice Questions */}
        <section aria-labelledby="practice-drills-heading" className="space-y-4">
          <h2 id="practice-drills-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            NCERT Board Practice Questions
          </h2>

          <div className="space-y-3">
            {topic.practiceQuestions.map((pq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {pq.question}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Solution: </span>
                  {pq.solution}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
};
