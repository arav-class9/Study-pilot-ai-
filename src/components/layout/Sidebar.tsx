import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  BookOpen,
  CheckCircle2,
  Bot,
  Target,
  CalendarDays,
  BarChart3,
  FileText,
  User,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  FileCheck2,
  Users,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';
import { PomodoroTimer } from '../pomodoro/PomodoroTimer';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user, revisionQueue, mistakes } = useApp();

  const dueRevisionsCount = revisionQueue.filter(
    (r) => r.status === 'due' || new Date(r.scheduledDate) <= new Date()
  ).length;
  const unresolvedMistakesCount = mistakes.filter((m) => !m.resolved).length;

  const coreNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Workspace & Notes', icon: BookOpen },
    { id: 'practice', label: 'Practice Quiz', icon: CheckCircle2 },
    { id: 'exam', label: 'Exam Mode', icon: FileCheck2, badge: 'Mock' },
    {
      id: 'mistakes',
      label: 'Mistake Notebook',
      icon: AlertTriangle,
      badge: unresolvedMistakesCount > 0 ? `${unresolvedMistakesCount}` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    { id: 'tutor', label: 'AI Tutor', icon: Bot, badge: 'AI' },
    { id: 'radar', label: 'Weakness Radar', icon: Target, highlight: true },
    { id: 'plan', label: 'Study Plan', icon: CalendarDays },
    { id: 'progress', label: 'Progress & Mastery', icon: BarChart3 },
    { id: 'parent', label: 'Parent Portal', icon: Users },
    { id: 'teacher', label: 'Teacher Mode', icon: GraduationCap },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (user.role === 'admin') {
    coreNavItems.push({ id: 'admin', label: 'Admin Insights', icon: ShieldAlert });
  }

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md min-h-[calc(100vh-61px)] p-4 shrink-0 justify-between overflow-y-auto"
    >
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 pb-2.5">
          Navigation &amp; Study Tools
        </p>

        {coreNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 font-black scale-[1.01]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/80 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : item.highlight ? 'text-rose-500 animate-bounce' : 'text-slate-400 dark:text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeColor || 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Pomodoro Focus Timer Widget */}
      <PomodoroTimer />

      {/* Mini Academic Coach Card with Spaced Repetition Due indicator */}
      <div className="mt-4 bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 p-3.5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-indigo-900 font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Class {user.classLevel} ({user.board})</span>
          </div>
          {dueRevisionsCount > 0 && (
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
              {dueRevisionsCount} Due
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Daily goal: <strong className="text-slate-800 font-semibold">{user.dailyStudyMinutes} mins</strong>. Complete practice questions to level up!
        </p>
      </div>
    </aside>
  );
};
