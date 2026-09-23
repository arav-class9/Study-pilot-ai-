import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Brain, 
  BookOpen, 
  ClipboardList, 
  Target, 
  Lightbulb, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Search, 
  Bell, 
  Flame, 
  Clock, 
  GraduationCap, 
  FileUp, 
  BookMarked 
} from 'lucide-react';
import { triggerHaptic } from '../utils/androidBridge';
import { GlobalSearchModal } from '../components/search/GlobalSearchModal';
import { SEOHead } from '../components/seo/SEOHead';
import { getCanonicalUrl } from '../services/seoService';

export const HomePage: React.FC = () => {
  const { 
    setActiveTab, 
    learningProfile, 
    topicProgressList,
    dailyPlan,
    notifications,
    toggleTaskCompletion,
    user
  } = useApp();
  const { user: authUser } = useAuth();

  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  
  // Dynamic progress based on user's mastery score
  const progressPercentage = typeof learningProfile?.masteryScore === "number" ? learningProfile.masteryScore : 65;

  const quickActions = [
    { id: 'tutor', label: 'Ask AI', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-950/60' },
    { id: 'workspace', label: 'Learn Topic', icon: Layers, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-950/60' },
    { id: 'ncert', label: 'Upload PDF', icon: FileUp, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-950/60' },
    { id: 'ncert', label: 'NCERT & Books', icon: BookMarked, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950/60' },
    { id: 'practice', label: 'Generate Quiz', icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
    { id: 'flashcards', label: 'Flashcards', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-950/60' },
    { id: 'plan', label: 'Study Planner', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-950/60' },
    { id: 'exam', label: 'Practice Exam', icon: Target, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-950/60' },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-12">
      <SEOHead
        metadata={{
          title: 'Student Study Dashboard | StudyPilot AI',
          description: 'Personalized student study dashboard with daily revision plans, adaptive quizzes, and active recall progress.',
          canonicalUrl: getCanonicalUrl('/dashboard'),
          robots: 'noindex, nofollow',
        }}
      />
      
      {/* Primary Dashboard Card */}
      <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        
        {/* Top App Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">StudyPilot AI</h1>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">v2.0</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Class {user?.classLevel || '10'} • {user?.name || authUser?.displayName || 'Student'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications Button */}
            <button
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('coach');
              }}
              aria-label="Notifications"
              className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer active:scale-95"
            >
              <Bell className="w-5 h-5" />
              {notifications && notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Profile Button */}
            <button
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('profile');
              }}
              aria-label="Open Profile"
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : (authUser?.displayName ? authUser.displayName.charAt(0).toUpperCase() : 'S')}
            </button>
          </div>
        </div>

        {/* 1-Tap Global AI Search Bar */}
        <div 
          onClick={() => {
            triggerHaptic('selection');
            setIsGlobalSearchOpen(true);
          }}
          className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-xs group"
        >
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-medium flex-1">
            Search any educational topic, formula, NCERT chapter...
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            Ctrl+K
          </span>
        </div>

        {/* Quick Actions (8 Core Actions) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Actions
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveTab(action.id);
                }}
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition active:scale-95 cursor-pointer text-center group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${action.bg} ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Learning & Live Progress Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Continue Learning Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-indigo-950/30 rounded-2xl p-4 border border-indigo-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Continue Learning
                </h3>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveTab('workspace');
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Recently Studied Topics Preview */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {topicProgressList && topicProgressList.length > 0
                        ? topicProgressList[0].topicName
                        : 'Photosynthesis & Light Reactions'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Science • Class {user?.classLevel || '10'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveTab('workspace');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer active:scale-95 transition shrink-0 ml-2"
                >
                  Resume
                </button>
              </div>

              {/* Today's Study Plan Task */}
              {dailyPlan?.tasks && dailyPlan.tasks.length > 0 ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={() => {
                        triggerHaptic('success');
                        toggleTaskCompletion(dailyPlan.tasks[0].id);
                      }}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center cursor-pointer transition shrink-0 ${
                        dailyPlan.tasks[0].completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {dailyPlan.tasks[0].completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <span className={`font-semibold truncate ${dailyPlan.tasks[0].completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {dailyPlan.tasks[0].topicName}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md shrink-0 ml-2">
                    {dailyPlan.tasks[0].durationMinutes} mins
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 font-medium">Daily study goal ready for today</span>
                  <button
                    onClick={() => setActiveTab('plan')}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Open Plan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Progress Card */}
          <div className="bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-purple-950/30 rounded-2xl p-4 border border-purple-100 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                  Live Mastery
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                    <Flame className="w-4 h-4 fill-amber-500" />
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {user?.streak || 3}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">Day Streak</span>
                </div>

                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-indigo-500 mb-0.5">
                    <Clock className="w-4 h-4" />
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {user?.dailyStudyMinutes || 45}m
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">Study Time</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab('progress');
              }}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer active:scale-95 text-center"
            >
              View Analytics Report
            </button>
          </div>
        </div>

      </section>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isGlobalSearchOpen} onClose={() => setIsGlobalSearchOpen(false)} />
    </div>
  );
};
