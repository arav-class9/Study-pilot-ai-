import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  Award,
  BookOpen,
  ChevronRight,
  Layers,
  History,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchFeynmanBreakdown, verifyFeynmanQuiz } from '../../services/studyCoachClient';
import { FeynmanBreakdownResult, FeynmanQuizVerificationResult } from '../../types/studyCoach';
import { safeGetStorage, safeSetStorage } from '../../utils/storage';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

const HISTORY_STORAGE_KEY = 'studypilot_coach_feynman_history';

const SAMPLE_CONCEPTS = [
  'Newton\'s Third Law of Motion',
  'Refraction of Light through Prism',
  'Ohm\'s Law & Electric Resistance',
  'Photosynthesis & Light Reactions',
  'Mendelian Monohybrid Cross',
  'Exothermic vs Endothermic Reactions',
  'Quadratic Equations & Discriminant',
];

export const FeynmanCoachTab: React.FC = () => {
  const { user, addXP } = useApp();

  const [conceptInput, setConceptInput] = useState('');
  const [subject, setSubject] = useState(user.selectedSubject || 'Science');

  const [breakdown, setBreakdown] = useState<FeynmanBreakdownResult | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [verificationResult, setVerificationResult] = useState<FeynmanQuizVerificationResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [masteredHistory, setMasteredHistory] = useState<FeynmanBreakdownResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from storage
  useEffect(() => {
    const raw = safeGetStorage(HISTORY_STORAGE_KEY);
    if (raw) {
      try {
        setMasteredHistory(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to parse Feynman history');
      }
    }
  }, []);

  const handleExplain = async (targetConcept?: string) => {
    const conceptToFetch = (targetConcept || conceptInput).trim();
    if (!conceptToFetch) {
      toast.error('Please enter a concept to explain.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setBreakdown(null);
    setSelectedAnswers({});
    setVerificationResult(null);

    try {
      const result = await fetchFeynmanBreakdown({
        concept: conceptToFetch,
        subject,
        classLevel: user.classLevel || '10',
      });

      setBreakdown(result);
      setConceptInput(conceptToFetch);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Could not generate Feynman explanation. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    // If already verified, allow resetting to try again
    if (verificationResult) {
      setVerificationResult(null);
    }
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleVerifyAnswers = async () => {
    if (!breakdown) return;

    // Check that all 3 questions have answers
    const unanswered = breakdown.miniQuiz.some((_, idx) => selectedAnswers[idx] === undefined);
    if (unanswered) {
      toast.error('Please answer all 3 mini-quiz questions before submitting.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyFeynmanQuiz({
        concept: breakdown.concept,
        questions: breakdown.miniQuiz,
        studentAnswers: selectedAnswers,
      });

      setVerificationResult(result);

      if (result.conceptMastered) {
        addXP(50);
        toast.success(`Concept Mastered! +50 XP awarded!`, { icon: '🎓' });
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });

        // Save to history if not already saved
        setMasteredHistory((prev) => {
          const exists = prev.some((item) => item.concept.toLowerCase() === breakdown.concept.toLowerCase());
          if (exists) return prev;
          const updated = [{ ...breakdown, savedAt: new Date().toISOString() }, ...prev];
          safeSetStorage(HISTORY_STORAGE_KEY, JSON.stringify(updated.slice(0, 20)));
          return updated;
        });
      } else {
        toast('Review the explanations below and try again!', { icon: '💡' });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Could not verify answers. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setVerificationResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 mb-2">
              <Brain className="w-3.5 h-3.5" />
              <span>Feynman Mental Model Technique</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Conceptual Breakdown & Feynman Coach
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Understand any difficult board concept explained in simple Class 9–10 plain language using relatable
              analogies. Test your intuition with a 3-question mini-quiz to verify mastery before progressing.
            </p>
          </div>

          {masteredHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer self-start md:self-auto"
            >
              <History className="w-4 h-4" />
              <span>Mastered Concepts Archive ({masteredHistory.length})</span>
            </button>
          )}
        </div>

        {/* Mastered concepts history drawer */}
        {showHistory && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Your Previously Mastered Concepts:
            </div>
            <div className="flex flex-wrap gap-2">
              {masteredHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setBreakdown(item);
                    setConceptInput(item.concept);
                    setSelectedAnswers({});
                    setVerificationResult(null);
                    setShowHistory(false);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500 font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{item.concept}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Enter Any Concept or Topic to Break Down
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={conceptInput}
            onChange={(e) => setConceptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
            placeholder="e.g. Refraction through glass prism, Snell's law, Mitosis, Archimedes Principle..."
            className="flex-1 px-4 py-3 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => handleExplain()}
            disabled={isLoading || !conceptInput.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Simplifying Concept...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explain Like I'm in Class 10</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Chips */}
        <div className="mt-4">
          <span className="text-xs font-medium text-slate-500 block mb-2">Try a popular board exam concept:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_CONCEPTS.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setConceptInput(c);
                  handleExplain(c);
                }}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium transition cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
            <button
              onClick={() => handleExplain()}
              className="ml-auto font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Explanation & Analogies View */}
      {breakdown && (
        <div className="space-y-6">
          {/* Main Plain English Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Feynman Plain-Language Breakdown
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {breakdown.concept}
              </h3>
            </div>

            {/* Simple Explanation */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Plain-English Intuition (Zero Jargon)
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {breakdown.simpleExplanation}
              </p>
            </div>

            {/* Everyday Analogies */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Vivid Everyday Analogies
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {breakdown.everydayAnalogies.map((analogy, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed"
                  >
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                      Analogy #{idx + 1}:
                    </span>
                    {analogy}
                  </div>
                ))}
              </div>
            </div>

            {/* Real World Examples & Core Takeaways */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Real-World Observations
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                  {breakdown.realWorldExamples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-2">
                  Common Traps & Misconceptions
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-300 list-disc list-inside">
                  {breakdown.commonMisconceptions.map((trap, i) => (
                    <li key={i}>{trap}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Golden Rules of Thumb */}
            <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Aha! Rules of Thumb (Core Takeaways)
              </h4>
              <div className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
                {breakdown.coreTakeaways.map((takeaway, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3-Question Mini-Quiz Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Step 2: Check Your Understanding
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  3-Question Conceptual Mini-Quiz
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Answer all 3 questions to test your intuition. The AI Coach will evaluate your reasoning before unlocking mastery!
                </p>
              </div>

              {verificationResult && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      verificationResult.conceptMastered
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                    }`}
                  >
                    Score: {verificationResult.score} / {verificationResult.total}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="text-xs px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition cursor-pointer"
                  >
                    Retry Quiz
                  </button>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {breakdown.miniQuiz.map((q, qIdx) => {
                const selectedOption = selectedAnswers[qIdx];
                const feedback = verificationResult?.detailedFeedback[qIdx];

                return (
                  <div
                    key={q.id || qIdx}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      feedback
                        ? feedback.isCorrect
                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        Q{qIdx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                          {q.question}
                        </p>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedOption === optIdx;
                            const isCorrectOpt = q.correctOptionIndex === optIdx;

                            let optStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400';

                            if (verificationResult) {
                              if (isCorrectOpt) {
                                optStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                              } else if (isChosen && !isCorrectOpt) {
                                optStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-semibold';
                              }
                            } else if (isChosen) {
                              optStyle = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-100 font-semibold ring-1 ring-indigo-500';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${optStyle}`}
                              >
                                <span className="font-mono font-bold text-slate-400 shrink-0">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Post-Verification Feedback */}
                        {feedback && (
                          <div
                            className={`mt-3.5 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                              feedback.isCorrect
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900'
                                : 'bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900'
                            }`}
                          >
                            {feedback.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-semibold">{feedback.advice}</div>
                              <div className="mt-1 text-slate-600 dark:text-slate-300">
                                {feedback.explanation}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Check Answers Button */}
            {!verificationResult ? (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleVerifyAnswers}
                  disabled={isVerifying}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Checking Answers...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Check My Answers & Verify Mastery</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Feynman Coach Assessment
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {verificationResult.overallReview}
                </p>

                {verificationResult.conceptMastered && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Concept Unlocked & Saved to Mastery Archive (+50 XP)!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
