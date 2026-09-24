import React, { useState } from 'react';
import {
  Sparkles,
  Atom,
  Calculator,
  FlaskConical,
  Dna,
  Globe,
  BookOpen,
  Star,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Search,
  Loader2,
  RotateCcw,
  CheckCheck,
  ListOrdered,
  Layers,
  Scale,
  Smile,
} from 'lucide-react';
import {
  StructuredVisualAnswer,
  StructuredVisualCard,
  VisualAccentColor,
  TopicWorkspaceItem,
} from '../../types/workspace';
import { fetchStructuredVisualAnswer } from '../../services/topicWorkspaceClient';

interface StructuredVisualAnswerViewProps {
  topic: TopicWorkspaceItem;
  onUpdateTopic: (updated: TopicWorkspaceItem) => void;
}

// Color theme resolver for individual cards
const getCardColorStyles = (color?: VisualAccentColor) => {
  switch (color) {
    case 'teal':
      return {
        badgeBg: 'bg-teal-600 text-white',
        border: 'border-teal-200 dark:border-teal-900/60',
        heading: 'text-teal-900 dark:text-teal-200',
        bgTint: 'bg-teal-50/40 dark:bg-teal-950/20',
        pillBg: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300',
        calloutBg: 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800',
      };
    case 'purple':
      return {
        badgeBg: 'bg-purple-600 text-white',
        border: 'border-purple-200 dark:border-purple-900/60',
        heading: 'text-purple-900 dark:text-purple-200',
        bgTint: 'bg-purple-50/40 dark:bg-purple-950/20',
        pillBg: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
        calloutBg: 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800',
      };
    case 'amber':
      return {
        badgeBg: 'bg-amber-500 text-white',
        border: 'border-amber-200 dark:border-amber-900/60',
        heading: 'text-amber-900 dark:text-amber-200',
        bgTint: 'bg-amber-50/40 dark:bg-amber-950/20',
        pillBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300',
        calloutBg: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800',
      };
    case 'pink':
    case 'rose':
      return {
        badgeBg: 'bg-pink-600 text-white',
        border: 'border-pink-200 dark:border-pink-900/60',
        heading: 'text-pink-900 dark:text-pink-200',
        bgTint: 'bg-pink-50/40 dark:bg-pink-950/20',
        pillBg: 'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300',
        calloutBg: 'bg-pink-50/80 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800',
      };
    case 'emerald':
    case 'green':
      return {
        badgeBg: 'bg-emerald-600 text-white',
        border: 'border-emerald-200 dark:border-emerald-900/60',
        heading: 'text-emerald-900 dark:text-emerald-200',
        bgTint: 'bg-emerald-50/40 dark:bg-emerald-950/20',
        pillBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300',
        calloutBg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800',
      };
    case 'blue':
      return {
        badgeBg: 'bg-blue-600 text-white',
        border: 'border-blue-200 dark:border-blue-900/60',
        heading: 'text-blue-900 dark:text-blue-200',
        bgTint: 'bg-blue-50/40 dark:bg-blue-950/20',
        pillBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
        calloutBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800',
      };
    case 'indigo':
    case 'violet':
      return {
        badgeBg: 'bg-indigo-600 text-white',
        border: 'border-indigo-200 dark:border-indigo-900/60',
        heading: 'text-indigo-900 dark:text-indigo-200',
        bgTint: 'bg-indigo-50/40 dark:bg-indigo-950/20',
        pillBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300',
        calloutBg: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800',
      };
    case 'fuchsia':
      return {
        badgeBg: 'bg-fuchsia-600 text-white',
        border: 'border-fuchsia-200 dark:border-fuchsia-900/60',
        heading: 'text-fuchsia-900 dark:text-fuchsia-200',
        bgTint: 'bg-fuchsia-50/40 dark:bg-fuchsia-950/20',
        pillBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-300',
        calloutBg: 'bg-fuchsia-50/80 dark:bg-fuchsia-950/40 border-fuchsia-300 dark:border-fuchsia-800',
      };
    case 'orange':
      return {
        badgeBg: 'bg-orange-500 text-white',
        border: 'border-orange-200 dark:border-orange-900/60',
        heading: 'text-orange-900 dark:text-orange-200',
        bgTint: 'bg-orange-50/40 dark:bg-orange-950/20',
        pillBg: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300',
        calloutBg: 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800',
      };
    default:
      return {
        badgeBg: 'bg-sky-600 text-white',
        border: 'border-sky-200 dark:border-sky-900/60',
        heading: 'text-sky-900 dark:text-sky-200',
        bgTint: 'bg-sky-50/40 dark:bg-sky-950/20',
        pillBg: 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300',
        calloutBg: 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800',
      };
  }
};

export const StructuredVisualAnswerView: React.FC<StructuredVisualAnswerViewProps> = ({
  topic,
  onUpdateTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const answer = topic.structuredVisualAnswer;

  const handleAskOrSearch = async (queryToUse?: string) => {
    const q = (queryToUse || searchQuery || topic.topicName).trim();
    if (!q) return;

    setIsLoading(true);
    try {
      const combinedUploadContext = topic.uploadedFiles
        .map((f) => f.extractedText)
        .filter(Boolean)
        .join('\n\n');

      const result = await fetchStructuredVisualAnswer({
        topicOrQuestion: q,
        subject: topic.subject,
        classLevel: topic.classLevel,
        chapter: topic.chapter,
        uploadedContextText: combinedUploadContext,
      });

      const updated: TopicWorkspaceItem = {
        ...topic,
        topicName: result.topicTitle || topic.topicName,
        structuredVisualAnswer: result,
      };

      onUpdateTopic(updated);
    } catch (err) {
      console.error('Failed to generate visual answer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSolution = (key: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const copySummary = () => {
    if (!answer) return;
    const text = `⭐ ${answer.topicTitle} (${answer.subject} - ${answer.classLevel})\n💡 Big Idea: ${answer.bigIdea}\n\n` +
      answer.cards.map((c, i) => `${i + 1}. ${c.title}\n${c.importantPoint?.quoteOrText || ''}\n${c.formula?.equation ? `Formula: ${c.formula.equation}\n` : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render subject icon emblem
  const renderSubjectIcon = (icon?: string) => {
    switch (icon) {
      case 'atom':
        return <Atom className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300" />;
      case 'calculator':
        return <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />;
      case 'flask':
        return <FlaskConical className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-300" />;
      case 'dna':
        return <Dna className="w-8 h-8 sm:w-10 sm:h-10 text-rose-300" />;
      case 'globe':
        return <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-300" />;
      default:
        return <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-sky-300" />;
    }
  };

  const sampleQueries = [
    "Newton's Laws of Motion",
    "What is inertia?",
    "Solving Quadratic Equations",
    "Explain Photosynthesis",
    "Connective Tissue & Tendons",
  ];

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 font-sans">
      {/* 🚀 SMART SEARCH / ASK BAR */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border-2 border-amber-300/80 dark:border-slate-800 shadow-sm space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskOrSearch();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Ask StudyPilot AI any question or topic (e.g. "What is inertia?", "Explain Newton's Laws")...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking & Structuring...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Explain Topic 🚀</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Query Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quick Examples:
          </span>
          {sampleQueries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setSearchQuery(item);
                handleAskOrSearch(item);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-amber-200/60 dark:border-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="py-16 bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center space-y-4 text-center shadow-md">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              StudyPilot AI Tutor is Analyzing Your Question...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
              Determining key principles, formulas, step-by-step examples, comparison tables, and exam traps to construct the perfect visual cards.
            </p>
          </div>
        </div>
      )}

      {/* 🟦 1. MAIN TITLE CARD & BIG IDEA HEADER */}
      {answer && !isLoading && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 sm:p-7 md:p-8 text-white shadow-xl border border-blue-700/50">
            {/* Background Decorative Glow */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Side: Subject Emblem & Topic Title */}
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                  {renderSubjectIcon(answer.subjectIcon)}
                </div>

                <div className="min-w-0 space-y-1">
                  {/* Subject & Class Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-blue-200">
                    <span className="bg-blue-800/80 px-2.5 py-0.5 rounded-full border border-blue-700/60">
                      Subject: {answer.subject}
                    </span>
                    <span>•</span>
                    <span className="bg-indigo-800/80 px-2.5 py-0.5 rounded-full border border-indigo-700/60">
                      Class: {answer.classLevel}
                    </span>
                    <span>•</span>
                    <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                      Chapter: {answer.chapter}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-xs">
                    {answer.topicTitle}
                  </h1>

                  <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl font-medium leading-relaxed">
                    {answer.oneLineDescription}
                  </p>
                </div>
              </div>

              {/* Right Side: 💡 BIG IDEA CARD */}
              <div className="lg:max-w-md w-full shrink-0">
                <div className="bg-sky-50 dark:bg-slate-800/95 text-slate-900 dark:text-slate-100 p-4 sm:p-5 rounded-2xl border-2 border-sky-300 dark:border-sky-700 shadow-lg relative">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-200/80 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 text-xs font-black uppercase tracking-wider">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span>Big Idea</span>
                    </div>

                    <button
                      onClick={copySummary}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                      title="Copy Visual Summary"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {answer.bigIdea}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 🎨 DYNAMIC VISUAL CARDS GRID (1, 2, or 3-columns responsive layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
            {answer.cards.map((card, idx) => {
              const styles = getCardColorStyles(card.accentColor);
              const cardNum = card.cardNumber ?? idx + 1;

              return (
                <div
                  key={card.id || `card-${idx}`}
                  className={`bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 ${styles.border} shadow-md hover:shadow-lg transition-all duration-200 p-4 sm:p-5 flex flex-col space-y-4 relative overflow-hidden`}
                >
                  {/* Card Header with Colored Number Pill */}
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${styles.badgeBg} flex items-center justify-center text-xs sm:text-sm font-black shadow-xs shrink-0`}
                    >
                      {cardNum}
                    </div>
                    <h3 className={`text-sm sm:text-base font-black tracking-tight ${styles.heading} leading-tight`}>
                      {card.title}
                    </h3>
                  </div>

                  {/* ⭐ Important Point Callout */}
                  {card.importantPoint && (
                    <div
                      className={`p-3.5 rounded-xl border-l-4 ${styles.calloutBg} space-y-1.5 shadow-2xs`}
                    >
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-2xs">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{card.importantPoint.badgeText || 'Important Point'}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {card.importantPoint.quoteOrText}
                      </div>
                    </div>
                  )}

                  {/* Normal Paragraphs */}
                  {card.paragraphs && card.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {p}
                    </p>
                  ))}

                  {/* Bullet Points */}
                  {card.bullets && card.bullets.length > 0 && (
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {card.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-2 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* ⚡ Formula Box */}
                  {card.formula && (
                    <div className="bg-teal-50/70 dark:bg-teal-950/30 p-3 sm:p-4 rounded-xl border border-teal-200 dark:border-teal-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-teal-800 dark:text-teal-300">
                        <Zap className="w-3.5 h-3.5 text-teal-600 fill-teal-600" />
                        <span>Formula</span>
                      </div>

                      {/* Prominent Formula Equation Box */}
                      <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-teal-300 dark:border-teal-700 text-center font-mono font-black text-sm sm:text-base text-teal-900 dark:text-teal-200 shadow-2xs">
                        {card.formula.boxedFormula || card.formula.equation}
                      </div>

                      {card.formula.explanation && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {card.formula.explanation}
                        </p>
                      )}

                      {card.formula.conditionOrWhenToUse && (
                        <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-300">
                          When to use: {card.formula.conditionOrWhenToUse}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 📊 Comparison Table */}
                  {card.comparison && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                      {card.comparison.title && (
                        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 font-black uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                          {card.comparison.title}
                        </div>
                      )}
                      {/* Columns Header */}
                      <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-extrabold text-center">
                        {card.comparison.columns.map((col, cIdx) => (
                          <div
                            key={cIdx}
                            className={`p-2 ${
                              cIdx === 0
                                ? 'border-r border-slate-200 dark:border-slate-800 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/30'
                                : 'text-pink-700 dark:text-pink-300 bg-pink-50/50 dark:bg-pink-950/30'
                            }`}
                          >
                            {col}
                          </div>
                        ))}
                      </div>
                      {/* Rows */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {card.comparison.rows.map((row, rIdx) => (
                          <div key={rIdx} className="grid grid-cols-2 text-[11px] sm:text-xs">
                            {row.values.map((val, vIdx) => (
                              <div
                                key={vIdx}
                                className={`p-2 text-slate-700 dark:text-slate-300 ${
                                  vIdx === 0 ? 'border-r border-slate-100 dark:border-slate-800' : ''
                                }`}
                              >
                                {val}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 📝 Example Block (Numerical or Conceptual) */}
                  {card.example && (
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3 sm:p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 font-black uppercase text-emerald-800 dark:text-emerald-300 text-xs">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Example: {card.example.title || 'Practical Illustration'}</span>
                      </div>

                      {card.example.type === 'numerical' ? (
                        <div className="space-y-1.5 text-xs">
                          {card.example.given && (
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100">Given: </span>
                              <span className="text-slate-700 dark:text-slate-300">{card.example.given.join(', ')}</span>
                            </div>
                          )}
                          {card.example.toFind && (
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100">To Find: </span>
                              <span className="text-slate-700 dark:text-slate-300">{card.example.toFind}</span>
                            </div>
                          )}
                          {card.example.formula && (
                            <div>
                              <span className="font-bold text-slate-900 dark:text-slate-100">Formula: </span>
                              <code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                                {card.example.formula}
                              </code>
                            </div>
                          )}
                          {card.example.calculation && (
                            <div className="bg-white/90 dark:bg-slate-900/90 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed">
                              {card.example.calculation}
                            </div>
                          )}
                          {card.example.answer && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-2xs">
                              <Check className="w-3.5 h-3.5" />
                              <span>Answer: {card.example.answer}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                          {card.example.situation && (
                            <p><strong className="text-slate-900 dark:text-slate-100">Situation:</strong> {card.example.situation}</p>
                          )}
                          {card.example.explanation && (
                            <p><strong className="text-slate-900 dark:text-slate-100">Explanation:</strong> {card.example.explanation}</p>
                          )}
                          {card.example.conclusion && (
                            <p className="font-bold text-emerald-800 dark:text-emerald-300">➔ {card.example.conclusion}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 🔄 Process / Step Block */}
                  {card.processSteps && card.processSteps.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        How It Works (Step-by-Step)
                      </div>
                      <div className="space-y-2">
                        {card.processSteps.map((st) => (
                          <div
                            key={st.stepNumber}
                            className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                          >
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-black text-xs shrink-0">
                              {st.stepNumber}
                            </span>
                            <div className="text-xs">
                              <div className="font-bold text-slate-900 dark:text-slate-100">{st.title}</div>
                              <div className="text-slate-600 dark:text-slate-400 mt-0.5">{st.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🌍 Real-Life Applications */}
                  {card.realLifeApplications && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Real-Life Applications</span>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {card.realLifeApplications.items.map((app, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold shrink-0">✔</span>
                            <span>{app}</span>
                          </li>
                        ))}
                      </ul>

                      {card.realLifeApplications.calloutDoodleText && (
                        <div className="p-2.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-[11px] sm:text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                          <Smile className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{card.realLifeApplications.calloutDoodleText}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ⚠️ Exam Trap Card */}
                  {card.examTrap && (
                    <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase text-rose-800 dark:text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Exam Warning / Common Trap</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-start gap-1.5 text-rose-700 dark:text-rose-300">
                          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div><strong className="font-bold">Wrong:</strong> {card.examTrap.wrongIdea}</div>
                        </div>

                        <div className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div><strong className="font-bold">Correct:</strong> {card.examTrap.correctConcept}</div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
                          {card.examTrap.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 💡 Memory Trick */}
                  {card.memoryTrick && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        <span>Memory Trick</span>
                      </div>
                      <div className="font-bold text-xs text-amber-950 dark:text-amber-100">
                        {card.memoryTrick.mnemonic}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        {card.memoryTrick.explanation}
                      </div>
                    </div>
                  )}

                  {/* 🏆 Quick Revision */}
                  {card.quickRevision && (
                    <div className="space-y-3">
                      <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold">
                        {card.quickRevision.keyPoints.map((kp, kpIdx) => (
                          <li key={kpIdx} className="flex items-start gap-2">
                            <span className="text-fuchsia-600 font-bold shrink-0">✦</span>
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>

                      {card.quickRevision.takeawayBanner && (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-fuchsia-100 to-purple-100 dark:from-fuchsia-950/60 dark:to-purple-950/60 border border-fuchsia-300 dark:border-fuchsia-800 text-center font-extrabold text-xs text-fuchsia-900 dark:text-fuchsia-200 shadow-2xs">
                          {card.quickRevision.takeawayBanner}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 🧪 Check Your Understanding (Self-Check) */}
                  {card.selfCheck && card.selfCheck.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-black uppercase text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Check Your Understanding</span>
                      </div>

                      {card.selfCheck.map((sc, scIdx) => {
                        const solKey = `${card.id}-sc-${scIdx}`;
                        const isRevealed = revealedSolutions[solKey];

                        return (
                          <div
                            key={scIdx}
                            className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                          >
                            <div className="font-bold text-slate-900 dark:text-slate-100">
                              Q: {sc.question}
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleSolution(solKey)}
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              <span>{isRevealed ? 'Hide Solution' : 'Reveal Solution'}</span>
                            </button>

                            {isRevealed && (
                              <div className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-200 space-y-1">
                                <div className="font-bold text-indigo-900 dark:text-indigo-200">
                                  {sc.answer}
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                                  {sc.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Custom Sub-Blocks (e.g. Inertia types or highlight pills) */}
                  {card.customBlocks && card.customBlocks.map((cb, cbIdx) => (
                    <div
                      key={cbIdx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs"
                    >
                      {cb.title && (
                        <div className="font-black text-slate-900 dark:text-slate-100">
                          {cb.title}
                        </div>
                      )}
                      <p className="text-slate-700 dark:text-slate-300">{cb.content}</p>

                      {cb.bullets && (
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                          {cb.bullets.map((b, bi) => (
                            <li key={bi} className="flex items-start gap-1.5">
                              <span className="text-slate-400 font-bold">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {cb.highlightPill && (
                        <div className="inline-block px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-mono font-bold text-xs border border-amber-300 dark:border-amber-800">
                          {cb.highlightPill}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback CTA if no cards generated yet */}
      {!answer && !isLoading && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-amber-300 dark:border-slate-800 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 mx-auto flex items-center justify-center shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Launch Intelligent Structured Visual Answer Engine
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Ask any question or tap below to generate a teacher-like, colorful visual digital textbook board for "{topic.topicName}".
            </p>
          </div>
          <button
            onClick={() => handleAskOrSearch(topic.topicName)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Visual Textbook for {topic.topicName}</span>
          </button>
        </div>
      )}
    </div>
  );
};
