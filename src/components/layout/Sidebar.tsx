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
  User,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  FileCheck2,
  Users,
  GraduationCap,
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
    { id: 'ncert', label: 'NCERT & Books', icon: BookOpen },
    { id: 'learn', label: 'Topic Workspace', icon: BookOpen },
    { id: 'practice', label: 'Practice Quiz', icon: CheckCircle2 },
    { id: 'exam', label: 'Exam Mode', icon: FileCheck2, badge: 'Mock' },
    {
      id: 'mistakes',
      label: 'Mistake Notebook',
      icon: AlertTriangle,
      badge: unresolvedMistakesCount > 0 ? `${unresolvedMistakesCount}` : undefined,
    },
    { id: 'tutor', label: 'AI Doubt Solver', icon: Bot, badge: 'AI' },
    { id: 'radar', label: 'Weakness Radar', icon: Target },
    { id: 'plan', label: 'Study Plan', icon: CalendarDays },
    { id: 'progress', label: 'Progress & Mastery', icon: BarChart3 },
    { id: 'parent', label: 'Parent Portal', icon: Users },
    { id: 'teacher', label: 'Teacher Mode', icon: GraduationCap },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  if (user.role === 'admin') {
    coreNavItems.push({ id: 'admin', label: 'Admin Insights', icon: ShieldAlert });
  }

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 border-r border-[#e6e6e6] dark:border-[#2a3440] bg-[#ffffff] dark:bg-[#12181f] min-h-[calc(100vh-64px)] p-4 shrink-0 justify-between overflow-y-auto"
    >
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#6b6b6b] dark:text-[#8a8a8a] px-3 pb-3">
          STUDYPILOT NAVIGATION
        </p>

        {coreNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-none font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-[#1c69d4] text-white'
                  : 'text-[#262626] dark:text-[#d1d1d1] hover:bg-[#f7f7f7] dark:hover:bg-[#1a2129]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#6b6b6b]'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-none ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e6e6e6] dark:bg-[#2a3440] text-[#262626] dark:text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 pt-4 border-t border-[#e6e6e6] dark:border-[#2a3440]">
        <PomodoroTimer />

        <div className="bg-[#fafafa] dark:bg-[#161e27] border border-[#e6e6e6] dark:border-[#2a3440] p-3 space-y-1.5 rounded-none">
          <div className="flex items-center justify-between text-[#262626] dark:text-white font-bold text-xs uppercase tracking-wide">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1c69d4]" />
              <span>Class {user.classLevel} ({user.board})</span>
            </div>
            {dueRevisionsCount > 0 && (
              <span className="text-[10px] font-bold bg-[#f59e0b] text-white px-1 py-0.2">
                {dueRevisionsCount} DUE
              </span>
            )}
          </div>
          <p className="text-xs text-[#6b6b6b] leading-relaxed">
            Target: <strong>{user.dailyStudyMinutes} mins/day</strong>. Stay consistent!
          </p>
        </div>
      </div>
    </aside>
  );
};
