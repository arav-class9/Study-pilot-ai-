import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  RotateCcw,
  BookOpen,
  Filter,
  Play,
  ArrowRight,
  Flame,
  Award,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MistakeCategory, MistakeItem } from '../types';

export const MistakesPage: React.FC = () => {
  const { mistakes, resolveMistake, user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeChallengeMistake, setActiveChallengeMistake] = useState<MistakeItem | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeResult, setChallengeResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  const categories: MistakeCategory[] = [
    'Concept Gap',
    'Calculation Error',
    'Formula Confusion',
    'Unit Error',
    'Reading Error',
    'Careless Error',
    'Misconception',
  ];

  // Mistake Statistics
  const totalMistakes = mistakes.length;
  const unresolvedMistakes = mistakes.filter((m) => !m.resolved);
  const resolvedMistakes = mistakes.filter((m) => m.resolved);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => (counts[c] = 0));
    mistakes.forEach((m) => {
      if (counts[m.mistakeType] !== undefined) {
        counts[m.mistakeType]++;
      }
    });
    return counts;
  }, [mistakes]);

  const topMistakeType = useMemo(() => {
    let max = 0;
    let type = '';
    Object.entries(categoryCounts).forEach(([k, v]) => {
      const count = Number(v) || 0;
      if (count > max) {
        max = count;
        type = k;
      }
    });
    return { type: max > 0 ? type : 'None Recorded', count: max };
  }, [categoryCounts]);

  const filteredMistakes = useMemo(() => {
    if (selectedCategory === 'all') return mistakes;
    if (selectedCategory === 'unresolved') return unresolvedMistakes;
    if (selectedCategory === 'resolved') return resolvedMistakes;
    return mistakes.filter((m) => m.mistakeType === selectedCategory);
  }, [mistakes, selectedCategory, unresolvedMistakes, resolvedMistakes]);

  const handleStartChallenge = () => {
    if (unresolvedMistakes.length > 0) {
      setActiveChallengeMistake(unresolvedMistakes[0]);
      setChallengeAnswer('');
      setChallengeResult(null);
    }
  };

  const handleVerifyChallengeAnswer = () => {
    if (!activeChallengeMistake) return;
    const isCorrect =
      challengeAnswer.trim().toLowerCase() === activeChallengeMistake.correctAnswer.trim().toLowerCase() ||
      challengeAnswer.length > 0;

    if (isCorrect) {
      resolveMistake(activeChallengeMistake.id);
      setChallengeResult({
        isCorrect: true,
        feedback: `Great job! You mastered ${activeChallengeMistake.topic} and resolved this mistake. +25 XP Earned!`,
      });
    } else {
      setChallengeResult({
        isCorrect: false,
        feedback: `Not quite. Correct answer: "${activeChallengeMistake.correctAnswer}". Review explanation below.`,
      });
    }
  };

  return (
    <div id="mistakes-notebook-page" className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-400/30 px-3 py-1 rounded-full text-xs font-semibold text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Smart Error Recovery Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              My Mistakes Notebook 📓
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Every incorrect answer is logged and categorized. Retest unresolved mistakes in targeted drills to ensure you never lose marks on board exams!
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              id="start-mistake-challenge-btn"
              onClick={handleStartChallenge}
              disabled={unresolvedMistakes.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Mistake Challenge Drill ({unresolvedMistakes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Total Logged</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalMistakes}</p>
          <span className="text-[11px] text-slate-400 font-medium">Logged across quizzes & exams</span>
        </div>

        <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-bold uppercase mb-1">
            <span>Unresolved</span>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-rose-700">{unresolvedMistakes.length}</p>
          <span className="text-[11px] text-rose-600 font-medium">Requires re-testing</span>
        </div>

        <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase mb-1">
            <span>Mastered & Fixed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{resolvedMistakes.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Overcome in challenge drills</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Frequent Error Pattern</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-sm font-black text-slate-900 truncate mt-1">{topMistakeType.type}</p>
          <span className="text-[11px] text-slate-400 font-medium">{topMistakeType.count} mistakes recorded</span>
        </div>
      </div>

      {/* Active Challenge Drill Section (if open) */}
      {activeChallengeMistake && (
        <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-700 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg">
                Active Mistake Drill
              </span>
              <span className="text-indigo-200 text-xs font-semibold">
                {activeChallengeMistake.chapter} • {activeChallengeMistake.topic}
              </span>
            </div>
            <button
              onClick={() => setActiveChallengeMistake(null)}
              className="text-xs text-indigo-300 hover:text-white"
            >
              Close Drill
            </button>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 space-y-2 border border-white/15">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Question Challenge</p>
            <h3 className="text-base font-bold">{activeChallengeMistake.question}</h3>
          </div>

          {!challengeResult ? (
            <div className="space-y-3">
              <label className="block text-xs text-indigo-200 font-semibold">
                Your Corrected Answer or Solution Step:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={challengeAnswer}
                  onChange={(e) => setChallengeAnswer(e.target.value)}
                  placeholder="Type the corrected answer..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-hidden focus:bg-white/20"
                />
                <button
                  onClick={handleVerifyChallengeAnswer}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
                >
                  Verify & Resolve
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm">
                {challengeResult.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                <span>{challengeResult.feedback}</span>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed">
                <strong>Pedagogical Explanation:</strong> {activeChallengeMistake.explanation}
              </p>
              <button
                onClick={() => {
                  const nextIndex = unresolvedMistakes.findIndex((m) => m.id === activeChallengeMistake.id) + 1;
                  if (nextIndex < unresolvedMistakes.length) {
                    setActiveChallengeMistake(unresolvedMistakes[nextIndex]);
                    setChallengeAnswer('');
                    setChallengeResult(null);
                  } else {
                    setActiveChallengeMistake(null);
                  }
                }}
                className="bg-white text-indigo-900 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Next Mistake Drill
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({totalMistakes})
        </button>
        <button
          onClick={() => setSelectedCategory('unresolved')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
            selectedCategory === 'unresolved'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Unresolved ({unresolvedMistakes.length})
        </button>
        <button
          onClick={() => setSelectedCategory('resolved')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
            selectedCategory === 'resolved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          Mastered ({resolvedMistakes.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat} ({categoryCounts[cat] || 0})
          </button>
        ))}
      </div>

      {/* Mistake Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMistakes.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No mistakes in this filter</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Any errors made during adaptive quizzes and mock tests will automatically appear here for spaced practice.
            </p>
          </div>
        ) : (
          filteredMistakes.map((item) => (
            <div
              key={item.id}
              id={`mistake-card-${item.id}`}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                    {item.mistakeType}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      item.resolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.resolved ? 'Mastered' : 'Unresolved'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.question}</h4>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="text-rose-700 font-semibold">
                    <span className="text-slate-500 font-normal">Your initial answer:</span> {item.studentAnswer}
                  </div>
                  <div className="text-emerald-700 font-semibold">
                    <span className="text-slate-500 font-normal">Correct answer:</span> {item.correctAnswer}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.explanation}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{item.chapter}</span>
                {!item.resolved ? (
                  <button
                    onClick={() => {
                      setActiveChallengeMistake(item);
                      setChallengeAnswer('');
                      setChallengeResult(null);
                    }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Practice Drill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fixed</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
