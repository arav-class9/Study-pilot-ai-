import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  CheckCircle2,
  Bot,
  Camera,
  FileText,
  Brain,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Clock,
  BookOpen,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  FileCheck2,
  Award,
} from 'lucide-react';
import { SUBJECTS_META } from '../data/curriculum';
import { RevisionSessionModal } from '../components/repetition/RevisionSessionModal';
import { HandwrittenSolutionModal } from '../components/ai/HandwrittenSolutionModal';
import { TimetableDashboard } from '../components/timetable/TimetableDashboard';
import { StreakTrackerWidget } from '../components/common/StreakTrackerWidget';

const PersonalizedGreeting: React.FC = () => {
  const { user: authUser } = useAuth();
  const displayName = authUser?.displayName || 'Student';
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };
    
    updateGreeting();
    // Optional: update every minute so it changes if the user leaves the tab open
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
      {greeting}, {displayName} 👋
    </h1>
  );
};

export const HomePage: React.FC = () => {
  const {
    user,
    setActiveTab,
    topicProgressList,
    dailyPlan,
    toggleTaskCompletion,
    setActiveRecoveryTopic,
    learningProfile,
    revisionQueue,
    mistakes,
    isProfileLoading,
  } = useApp();

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isHandwrittenModalOpen, setIsHandwrittenModalOpen] = useState(false);

  // Find lowest accuracy topic for the Weakness Radar spotlight
  const sortedWeakTopics = [...topicProgressList].sort((a, b) => a.accuracy - b.accuracy);
  const lowestTopic = sortedWeakTopics.length > 0 && sortedWeakTopics[0].accuracy < 85 ? sortedWeakTopics[0] : null;

  const dueRevisions = revisionQueue.filter((r) => r.status === 'due' || new Date(r.scheduledDate) <= new Date());
  const unresolvedMistakes = mistakes.filter((m) => !m.resolved);

  const completedTasks = dailyPlan.tasks.filter((t) => t.completed).length;
  const totalTasks = dailyPlan.tasks.length;
  const goalProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Exam countdown calculation
  const examDaysLeft = user.examDate
    ? Math.ceil((new Date(user.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleStartRecovery = (topic: any) => {
    const subjectName = SUBJECTS_META[topic.subjectId as keyof typeof SUBJECTS_META]?.name || 'Science';
    setActiveRecoveryTopic({
      topicName: topic.topicName,
      subjectName,
      accuracy: topic.accuracy,
    });
    setActiveTab('radar');
  };

  return (
    <div id="home-dashboard-page" className="flex flex-col gap-6 pb-24 md:pb-12 w-full">
      {/* Top Greeting & Hero Card */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden flex flex-col gap-6">
        {/* Subtle decorative glow */}
        

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Class {user.classLevel} {user.board} Curriculum Grounding</span>
            </div>
            <PersonalizedGreeting />
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Study smarter. Improve every day. Active learning loop: Learn → Practice → Detect Weaknesses → Revise & Master.
            </p>
          </div>

          {/* Streak & XP Metric Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4 shrink-0 border border-slate-700 w-full sm:w-auto">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6 fill-amber-400 animate-pulse" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Study Streak</p>
                {isProfileLoading ? (
                  <p className="text-xl sm:text-2xl font-black animate-pulse text-amber-200">--</p>
                ) : (
                  <p className="text-xl sm:text-2xl font-black">{user.streak} Days 🔥</p>
                )}
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4 shrink-0 border border-slate-700 w-full sm:w-auto">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Zap className="w-6 h-6 fill-indigo-300" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">XP Earned</p>
                {isProfileLoading ? (
                  <p className="text-xl sm:text-2xl font-black animate-pulse text-indigo-200">--</p>
                ) : (
                  <p className="text-xl sm:text-2xl font-black">{user.totalXP ?? 0} XP</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Central Learning Profile Bar */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-slate-300 uppercase font-bold text-[10px] block">Overall Mastery</span>
            {isProfileLoading ? (
              <span className="text-lg font-black text-slate-300 animate-pulse">Loading...</span>
            ) : (
              <span className="text-lg font-black text-white">{learningProfile.masteryScore}%</span>
            )}
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-slate-300 uppercase font-bold text-[10px] block">Quiz Accuracy</span>
            {isProfileLoading ? (
              <span className="text-lg font-black text-emerald-300/70 animate-pulse">Loading...</span>
            ) : (
              <span className="text-lg font-black text-emerald-300">{learningProfile.accuracyScore}%</span>
            )}
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-slate-300 uppercase font-bold text-[10px] block">Estimated Board Score</span>
            {isProfileLoading ? (
              <span className="text-lg font-black text-amber-300/70 animate-pulse">Loading...</span>
            ) : (
              <span className="text-lg font-black text-amber-300">{learningProfile.estimatedExamScore}%</span>
            )}
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-slate-300 uppercase font-bold text-[10px] block">Unresolved Mistakes</span>
            {isProfileLoading ? (
              <span className="text-lg font-black text-rose-300/70 animate-pulse">Loading...</span>
            ) : (
              <span className="text-lg font-black text-rose-300">{unresolvedMistakes.length} errors</span>
            )}
          </div>
        </div>
      </div>

      {/* Daily Streak Tracker & Reinforcement Widget */}
      <StreakTrackerWidget />

      {/* Personalized Dashboard Top Row: Today's Goal & Exam Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Goal Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Today's Goal Progress</h2>
                <p className="text-xs text-slate-500">
                  {completedTasks} of {totalTasks} tasks completed today
                </p>
              </div>
            </div>
            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {goalProgressPercent}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${goalProgressPercent}%` }}
            />
          </div>

          {totalTasks === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
              <p className="text-xs font-semibold text-slate-600">No tasks scheduled for today yet.</p>
              <button
                onClick={() => setActiveTab('plan')}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                + Generate Study Plan
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Goal: {user.dailyStudyMinutes || 60} mins daily</span>
              <button
                onClick={() => setActiveTab('plan')}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Exam Countdown Card */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-amber-300 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-base">Target Exam Countdown</h2>
                <p className="text-xs text-slate-300">
                  {user.board} Class {user.classLevel} Final Board Examination
                </p>
              </div>
            </div>
            {examDaysLeft !== null && examDaysLeft >= 0 ? (
              <span className="text-xs font-black bg-amber-400 text-slate-900 px-3 py-1 rounded-full shadow-xs">
                {examDaysLeft} Days Left
              </span>
            ) : (
              <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                No Date Set
              </span>
            )}
          </div>

          <div className="relative z-10 pt-2">
            {examDaysLeft !== null && examDaysLeft >= 0 ? (
              <p className="text-xs text-slate-300 leading-relaxed">
                Your target exam date is <span className="font-bold text-amber-300">{user.examDate}</span>. Keep up your daily revision and practice streaks to secure top marks!
              </p>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                Set your exam date in your profile or exam mode to enable personalized countdown tracking and syllabus planning.
              </p>
            )}
          </div>

          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-slate-400">Exam Mode & Mock Tests</span>
            <button
              onClick={() => setActiveTab('exam')}
              className="font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Start Mock Exam</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Due Banner */}
      {dueRevisions.length > 0 && (
        <div
          id="spaced-repetition-due-alert"
          className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <RotateCcw className="w-6 h-6 animate-spin-reverse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Spaced Repetition Due
                </span>
                <span className="text-xs font-bold text-amber-800">{dueRevisions.length} Concepts Scheduled</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                Lock in long-term memory before the forgetting curve takes effect
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsRevisionModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md cursor-pointer transition-all shrink-0"
          >
            <span>Start Active Recall Drill</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Action Hub */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
          Study Tools & Accelerators
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            id="quick-action-ask-ai"
            onClick={() => setActiveTab('tutor')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">Ask AI Doubt</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Step-wise solutions</p>
          </button>

          <button
            id="quick-action-check-handwriting"
            onClick={() => setIsHandwrittenModalOpen(true)}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">Check Working</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Handwritten audit</p>
          </button>

          <button
            id="quick-action-exam-mode"
            onClick={() => setActiveTab('exam')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">Exam Mode</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Timed board mock</p>
          </button>

          <button
            id="quick-action-mistake-notebook"
            onClick={() => setActiveTab('mistakes')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">Mistakes ({unresolvedMistakes.length})</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Re-test error drills</p>
          </button>

          <button
            id="quick-action-make-notes"
            onClick={() => setActiveTab('learn')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">Make Notes</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Revision cheat sheets</p>
          </button>

          <button
            id="quick-action-start-quiz"
            onClick={() => setActiveTab('practice')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">Adaptive Quiz</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Concept mastery</p>
          </button>
        </div>
      </div>

      {/* Signature Feature: AI Weakness Radar & Practice Recommendations Banner */}
      <div
        id="weakness-radar-spotlight"
        className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-5 sm:p-6 transition-all relative overflow-hidden"
      >
        {lowestTopic ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-200">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded-full">
                      AI Weak Topic Recommendation
                    </span>
                    <span className="text-xs font-bold text-rose-700">{lowestTopic.accuracy}% Accuracy</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Focus Topic: {lowestTopic.topicName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                    Our weakness radar detected concept gaps in this topic. Start targeted practice to rapidly improve your score.
                  </p>
                </div>
              </div>

              <button
                id="start-recovery-plan-btn"
                onClick={() => handleStartRecovery(lowestTopic)}
                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md shadow-rose-200 hover:shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <span>Practice Weak Topics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mini Weak Topics Grid */}
            {sortedWeakTopics.length > 0 && (
              <div className="mt-4 pt-4 border-t border-rose-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {sortedWeakTopics.slice(0, 3).map((item) => (
                  <div
                    key={item.topicId}
                    onClick={() => handleStartRecovery(item)}
                    className="bg-white/80 border border-rose-100 hover:border-rose-300 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.topicName}</p>
                      <p className="text-[10px] text-slate-500">Mastery: {item.masteryScore}/100</p>
                    </div>
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded shrink-0">
                      {item.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full">
                    Weakness Radar & Practice
                  </span>
                  <span className="text-xs font-bold text-indigo-700">No Weak Topics Yet</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Great job! You have no weak topics flagged right now.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                  Take adaptive quizzes or subject tests to keep your mastery score high and test your exam readiness.
                </p>
              </div>
            </div>

            <button
              id="start-first-quiz-btn"
              onClick={() => setActiveTab('practice')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md shadow-indigo-200 hover:shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <span>Start Adaptive Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Today's Plan & Recommended Lesson */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Custom Timetable */}
        <div className="lg:col-span-2 space-y-4">
          <TimetableDashboard />
        </div>

        {/* Recommended Lesson & Fast Practice */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-sky-50/70 rounded-3xl p-5 sm:p-6 border border-indigo-100 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Recommended Revision</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {learningProfile.recommendedNextFocus}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Solve high-yield questions to boost your overall mastery from {learningProfile.masteryScore}% to {Math.min(100, learningProfile.masteryScore + 6)}%.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-indigo-200/60">
            <button
              onClick={() => setActiveTab('practice')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Brain className="w-4 h-4" />
              <span>Take 5-Min Smart Quiz</span>
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Read Chapter Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Modals for Home triggers */}
      <RevisionSessionModal isOpen={isRevisionModalOpen} onClose={() => setIsRevisionModalOpen(false)} />
      <HandwrittenSolutionModal
        isOpen={isHandwrittenModalOpen}
        onClose={() => setIsHandwrittenModalOpen(false)}
        subject="Science"
        classLevel={user.classLevel}
      />
    </div>
  );
};

