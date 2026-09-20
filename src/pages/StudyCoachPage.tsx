import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Brain,
  Layers,
  FileCheck2,
  LifeBuoy,
  Target,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PomodoroScheduleTab } from '../components/coach/PomodoroScheduleTab';
import { FeynmanCoachTab } from '../components/coach/FeynmanCoachTab';
import { ActiveRecallFlashcardsTab } from '../components/coach/ActiveRecallFlashcardsTab';
import { DiagnosticPracticeExamTab } from '../components/coach/DiagnosticPracticeExamTab';
import { StudyTriageTab } from '../components/coach/StudyTriageTab';
import { safeGetStorage } from '../utils/storage';

export type StudyCoachTabId = 'overview' | 'schedule' | 'feynman' | 'flashcards' | 'exam' | 'triage';

interface StudyCoachPageProps {
  initialTab?: StudyCoachTabId;
}

export const StudyCoachPage: React.FC<StudyCoachPageProps> = ({ initialTab = 'overview' }) => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<StudyCoachTabId>(initialTab);

  // Sync initialTab if changed externally
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Aggregate local stats
  const [pomoCount, setPomoCount] = useState(0);
  const [feynmanCount, setFeynmanCount] = useState(0);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [examCount, setExamCount] = useState(0);

  useEffect(() => {
    // 1. Pomodoro sessions
    const pomoRaw = safeGetStorage('studypilot_coach_completed_sessions');
    if (pomoRaw) {
      try {
        const parsed = JSON.parse(pomoRaw);
        setPomoCount(Object.values(parsed).filter(Boolean).length);
      } catch (e) {}
    }

    // 2. Feynman history
    const feynmanRaw = safeGetStorage('studypilot_coach_feynman_history');
    if (feynmanRaw) {
      try {
        const parsed = JSON.parse(feynmanRaw);
        setFeynmanCount(parsed.length || 0);
      } catch (e) {}
    }

    // 3. Flashcards
    const flashRaw = safeGetStorage('studypilot_coach_flashcard_decks');
    if (flashRaw) {
      try {
        const parsed = JSON.parse(flashRaw);
        let totalCards = 0;
        parsed.forEach((d: any) => {
          totalCards += d.cards?.length || 0;
        });
        setFlashcardCount(totalCards);
      } catch (e) {}
    }

    // 4. Exams
    const examRaw = safeGetStorage('studypilot_coach_diagnostic_results');
    if (examRaw) {
      try {
        const parsed = JSON.parse(examRaw);
        setExamCount(parsed.length || 0);
      } catch (e) {}
    }
  }, [activeTab]);

  const navTabs: { id: StudyCoachTabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Coach Hub', icon: Target },
    { id: 'schedule', label: 'Pomodoro Plan', icon: Clock, badge: '25+5' },
    { id: 'feynman', label: 'Feynman Coach', icon: Brain, badge: 'Class 9-10' },
    { id: 'flashcards', label: 'Active Recall', icon: Layers, badge: '10 Cards' },
    { id: 'exam', label: 'Practice Exam', icon: FileCheck2, badge: 'Auto-Graded' },
    { id: 'triage', label: 'Study Triage', icon: LifeBuoy, badge: 'Crisis' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Main Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Study Coach & Master Planner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Study Coach Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Your comprehensive learning companion for Class 9–10 board preparation. Manage daily Pomodoro schedules,
              simplify tough concepts with Feynman breakdowns, drill active recall, and triage schedules when behind.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs self-start md:self-auto">
            <div className="text-center px-2 py-1">
              <div className="text-[11px] text-slate-400 font-medium">Pomodoros</div>
              <div className="text-base font-extrabold text-rose-600 dark:text-rose-400">{pomoCount}</div>
            </div>
            <div className="text-center px-2 py-1 border-l border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Feynman</div>
              <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{feynmanCount}</div>
            </div>
            <div className="text-center px-2 py-1 border-l border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Flashcards</div>
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{flashcardCount}</div>
            </div>
            <div className="text-center px-2 py-1 border-l border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">Diagnostics</div>
              <div className="text-base font-extrabold text-purple-600 dark:text-purple-400">{examCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Bento Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1: Pomodoro Schedule */}
              <div
                onClick={() => setActiveTab('schedule')}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    Daily Study Plan & Schedule
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Generate day-by-day Pomodoro timetables with 25m focus blocks and 5m breaks. Prioritize difficult topics first and reserve mandatory revision and test buffers.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Open Pomodoro Planner</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Feynman Coach */}
              <div
                onClick={() => setActiveTab('feynman')}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    Conceptual Breakdown & Feynman Coach
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Break down complex Class 9–10 concepts into plain language with everyday analogies. Answer a 3-question mini-quiz to verify intuition before progressing.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Start Conceptual Breakdown</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: Active Recall Flashcards */}
              <div
                onClick={() => setActiveTab('flashcards')}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    Active Recall & Flashcards
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Upload notes or select a chapter to generate 10 active-recall flashcards ordered from easiest definitions to hardest synthesis. Drill cards with 3D flip animations and re-drill missed cards.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Open Flashcard Decks</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 4: Practice Exam & Diagnostics */}
              <div
                onClick={() => setActiveTab('exam')}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    Practice Exam & Weak-Spot Diagnostics
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Take realistic board exams combining MCQs and short-answer questions with answers hidden. Receive instant AI grading, mistake analysis, and isolated weak subtopic reports.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Take Diagnostic Exam</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 5: Rescheduling & Study Triage */}
              <div
                onClick={() => setActiveTab('triage')}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <LifeBuoy className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    Rescheduling & Study Triage
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Behind on preparation? Rebuild your remaining timeline strictly around high-yield board topics, while preserving non-negotiable revision buffers and mock test time.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Triage My Schedule</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Study Coach Philosophy Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-indigo-300 flex items-center justify-center font-bold text-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold">
                    Evidence-Based Cognitive Science
                  </h3>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    StudyPilot AI applies dual-coding, active memory retrieval, and Pomodoro rest intervals to ensure Class 9–10 board syllabus retention is permanent, not temporary cramming.
                  </p>
                </div>
                <div className="mt-5 text-xs text-indigo-300/80 font-medium">
                  NCERT & CBSE Board Exam Aligned
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && <PomodoroScheduleTab />}
        {activeTab === 'feynman' && <FeynmanCoachTab />}
        {activeTab === 'flashcards' && <ActiveRecallFlashcardsTab />}
        {activeTab === 'exam' && <DiagnosticPracticeExamTab />}
        {activeTab === 'triage' && <StudyTriageTab />}
      </div>
    </div>
  );
};
