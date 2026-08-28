import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateAIWeaknessPlan } from '../services/aiClient';
import { WeaknessRecoveryPlan, TopicProgress } from '../types';
import {
  Target,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Play,
  Clock,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Award,
  Zap,
  Loader2,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const WeaknessRadarPage: React.FC = () => {
  const {
    user,
    topicProgressList,
    activeRecoveryTopic,
    setActiveRecoveryTopic,
    addXP,
    checkAndConsumeUsage,
  } = useApp();

  const [selectedTopic, setSelectedTopic] = useState<TopicProgress>(
    topicProgressList.find((t) => t.status === 'weak') || topicProgressList[0]
  );

  const [filterCategory, setFilterCategory] = useState<'all' | 'weak' | 'developing' | 'mastered'>('all');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [activePlan, setActivePlan] = useState<WeaknessRecoveryPlan | null>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [miniTestAnswers, setMiniTestAnswers] = useState<Record<number, number>>({});
  const [planCompleted, setPlanCompleted] = useState(false);

  // If redirected from home with activeRecoveryTopic, automatically select it
  useEffect(() => {
    if (activeRecoveryTopic) {
      const match = topicProgressList.find((t) => t.topicName.toLowerCase().includes(activeRecoveryTopic.topicName.toLowerCase()));
      if (match) {
        setSelectedTopic(match);
      }
    }
  }, [activeRecoveryTopic, topicProgressList]);

  // Phase Timer effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && phaseTimer > 0) {
      interval = setInterval(() => {
        setPhaseTimer((prev) => prev - 1);
      }, 1000);
    } else if (phaseTimer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, phaseTimer]);

  const handleLaunchPlan = async (topic: TopicProgress) => {
    if (!checkAndConsumeUsage('aiQuestions')) return;

    setIsGeneratingPlan(true);
    setActivePlan(null);
    setPlanCompleted(false);
    setMiniTestAnswers({});
    setActivePhaseIndex(0);

    try {
      const plan = await generateAIWeaknessPlan({
        topicName: topic.topicName,
        subjectName: topic.subjectId,
        classLevel: user.classLevel,
        accuracy: topic.accuracy,
      });

      setActivePlan(plan);
      const initialStepDuration = plan.steps?.[0]?.durationMinutes || 7;
      setPhaseTimer(initialStepDuration * 60);
      setIsTimerRunning(true);
    } catch (err) {
      console.error('Failed to generate recovery plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleNextPhase = () => {
    if (!activePlan || !activePlan.steps) return;
    if (activePhaseIndex < activePlan.steps.length - 1) {
      const nextIdx = activePhaseIndex + 1;
      setActivePhaseIndex(nextIdx);
      setPhaseTimer((activePlan.steps[nextIdx]?.durationMinutes || 5) * 60);
      setIsTimerRunning(true);
    } else {
      // Completed full recovery!
      setPlanCompleted(true);
      setIsTimerRunning(false);
      addXP(100, 'Weakness Recovery Mastered');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredList = topicProgressList.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.status === filterCategory;
  });

  const currentStep = activePlan?.steps?.[activePhaseIndex];

  return (
    <div id="weakness-radar-page" className="space-y-6 pb-20 md:pb-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            <span>AI Weak-Topic Detection & Recovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Academic Weakness Radar
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Stop studying what you already know. Focus your energy on the exact 15% of concepts where you lose marks.
          </p>
        </div>
      </div>

      {/* 1. IF NO ACTIVE RECOVERY PLAN: RADAR BREAKDOWN */}
      {!activePlan && !isGeneratingPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics Breakdown List */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Topic Mastery Spectrum</h2>
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'weak', label: 'Weak (<50%)' },
                  { id: 'developing', label: 'Developing' },
                  { id: 'mastered', label: 'Mastered' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterCategory(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      filterCategory === tab.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredList.map((item) => {
                const isSelected = selectedTopic?.topicId === item.topicId;
                const isWeak = item.status === 'weak';

                return (
                  <div
                    key={item.topicId}
                    onClick={() => setSelectedTopic(item)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            item.status === 'weak'
                              ? 'bg-rose-100 text-rose-700'
                              : item.status === 'developing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 uppercase">
                          {item.subjectId} • {item.attempts} attempts
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">{item.topicName}</h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                        <p
                          className={`text-lg font-black ${
                            isWeak ? 'text-rose-600' : item.accuracy >= 75 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {item.accuracy}%
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchPlan(item);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                          isWeak
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>20-Min Fix</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Topic Diagnostic Card */}
          {selectedTopic && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Diagnostic Deep Dive</span>
                    <h3 className="font-extrabold text-slate-900 text-base">{selectedTopic.topicName}</h3>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Question Drills:</span>
                    <strong className="text-slate-900">{selectedTopic.attempts}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Correct Answers:</span>
                    <strong className="text-emerald-600">{selectedTopic.correct}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Errors / Mistakes:</span>
                    <strong className="text-rose-600">{selectedTopic.incorrect}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                    <span>Mastery Level:</span>
                    <strong className="text-indigo-600 font-extrabold">{selectedTopic.masteryScore}/100</strong>
                  </div>
                </div>

                <div className="bg-rose-50/70 border border-rose-100 p-3.5 rounded-2xl text-xs text-rose-950 space-y-1">
                  <p className="font-extrabold">🚨 AI Diagnostic Note:</p>
                  <p className="leading-relaxed">
                    Recurring errors detected in formula substitution and unit conversions. A targeted 20-minute session will rapidly boost your retention.
                  </p>
                </div>
              </div>

              <button
                id="launch-recovery-action-btn"
                type="button"
                onClick={() => handleLaunchPlan(selectedTopic)}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Start 20-Minute Recovery Plan</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. LOADING RECOVERY PLAN GENERATION */}
      {isGeneratingPlan && (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-4">
          <Loader2 className="w-12 h-12 text-rose-600 animate-spin mx-auto" />
          <h2 className="text-xl font-extrabold text-slate-900">Architecting 20-Minute Recovery Plan...</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Structuring Phase 1 Concept Revision, Phase 2 Worked Solutions, Phase 3 Step Drills, and Phase 4 Mini Checkpoint.
          </p>
        </div>
      )}

      {/* 3. ACTIVE 20-MINUTE RECOVERY PLAN RUNNER */}
      {activePlan && !planCompleted && currentStep && (
        <div className="space-y-6">
          {/* Recovery Plan Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                  Live Recovery Session
                </span>
                <span className="text-xs font-bold text-slate-500">{activePlan.topicName}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {currentStep.title}
              </h2>
            </div>

            {/* Micro Timer Pill */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex items-center gap-2 font-mono font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Phase Timer: {formatTimer(phaseTimer)}</span>
              </div>

              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                {isTimerRunning ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>

          {/* Phase Steps Indicator Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activePlan.steps.map((step, idx) => {
              const isCurrent = activePhaseIndex === idx;
              const isDone = activePhaseIndex > idx;

              return (
                <div
                  key={step.stepIndex}
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-extrabold shadow-xs'
                      : isDone
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  <p className="text-[10px] uppercase font-bold">Step {step.stepIndex} ({step.durationMinutes}m)</p>
                  <p className="text-xs font-bold truncate">{step.title}</p>
                </div>
              );
            })}
          </div>

          {/* Active Phase Content */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {currentStep.content}
              </div>

              {/* Practice Items if present in step */}
              {currentStep.practiceItems && currentStep.practiceItems.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Practice Drill Items</h3>
                  {currentStep.practiceItems.map((item, pIdx) => (
                    <div key={pIdx} className="border border-slate-200 rounded-2xl p-4 bg-indigo-50/40 space-y-2">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{pIdx + 1}. {item.question}</p>
                      {item.hint && <p className="text-xs text-indigo-800 italic">💡 Hint: {item.hint}</p>}
                      {item.solution && (
                        <div className="mt-2 p-3 bg-white border border-indigo-100 rounded-xl text-xs text-slate-700">
                          <strong>Solution:</strong> {item.solution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bottom Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleNextPhase}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer"
              >
                <span>{activePhaseIndex < activePlan.steps.length - 1 ? 'Next Step & Continue' : 'Finish Recovery Plan 🎉'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PLAN COMPLETED SUCCESS SCREEN */}
      {planCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-6 max-w-xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">Weakness Eliminated! 🚀</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              You completed the 20-minute recovery sprint for <strong>{activePlan?.topicName}</strong>.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-around">
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-800">Mastery Boost</p>
              <p className="text-xl font-black text-emerald-950">+15%</p>
            </div>
            <div className="h-8 w-px bg-emerald-200" />
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-800">XP Awarded</p>
              <p className="text-xl font-black text-emerald-950">+100 XP</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActivePlan(null)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
          >
            Back to Weakness Radar
          </button>
        </motion.div>
      )}
    </div>
  );
};
