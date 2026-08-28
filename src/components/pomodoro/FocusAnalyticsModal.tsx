import React, { useMemo, useState } from 'react';
import { useFocus } from '../../context/FocusContext';
import {
  X,
  Flame,
  Clock,
  CheckCircle2,
  Trophy,
  Calendar,
  BookOpen,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const FocusAnalyticsModal: React.FC = () => {
  const {
    isAnalyticsOpen,
    closeAnalytics,
    sessionHistory,
    totalFocusedMinutes,
    completedSessions,
    currentStreakDays,
    tasks,
  } = useFocus();

  const [hoveredBar, setHoveredBar] = useState<{ day: string; minutes: number; dateStr: string } | null>(null);

  // 1. Last 7 Days Data
  const last7DaysData = useMemo(() => {
    const days: { day: string; dateStr: string; minutes: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const minutesForDay = sessionHistory
        .filter((s) => s.completedAt.startsWith(dateStr))
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      days.push({
        day: dayName,
        dateStr,
        minutes: minutesForDay,
      });
    }
    return days;
  }, [sessionHistory]);

  const maxMinutesInWeek = Math.max(60, ...last7DaysData.map((d) => d.minutes));

  // 2. Subject Breakdown Data
  const subjectDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    sessionHistory.forEach((s) => {
      map[s.subjectId] = (map[s.subjectId] || 0) + s.durationMinutes;
    });

    const colors: Record<string, string> = {
      science: '#6366f1',
      math: '#0ea5e9',
      english: '#f59e0b',
      social_science: '#10b981',
      physics: '#8b5cf6',
      chemistry: '#ec4899',
      biology: '#14b8a6',
    };

    return Object.entries(map).map(([subj, mins]) => ({
      name: subj.replace('_', ' ').toUpperCase(),
      minutes: mins,
      color: colors[subj] || '#64748b',
    }));
  }, [sessionHistory]);

  if (!isAnalyticsOpen) return null;

  const totalHours = (totalFocusedMinutes / 60).toFixed(1);
  const completedTaskCount = tasks.filter((t) => t.completed).length;
  const taskRate = tasks.length > 0 ? Math.round((completedTaskCount / tasks.length) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Focus & Pomodoro Analytics
              </h2>
              <p className="text-xs text-slate-500">
                Track your deep focus consistency, subject split & habit momentum.
              </p>
            </div>
          </div>

          <button
            onClick={closeAnalytics}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-600">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Focus
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{totalHours} hrs</p>
              <p className="text-[10px] text-slate-400 font-semibold">
                {totalFocusedMinutes} minutes total
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Flame className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Daily Streak
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{currentStreakDays} Days</p>
              <p className="text-[10px] text-slate-400 font-semibold">Consecutive study days</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-600">
                <Trophy className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Sessions Done
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{completedSessions}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Pomodoro cycles</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Task Rate
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{taskRate}%</p>
              <p className="text-[10px] text-slate-400 font-semibold">
                {completedTaskCount}/{tasks.length} goals achieved
              </p>
            </div>
          </div>

          {/* Visual Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 7-Day Trend Custom SVG Visualizer */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  7-Day Focus Minutes
                </h3>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Recent Momentum
                </span>
              </div>

              {/* Native responsive bar visualizer */}
              <div className="h-44 w-full flex flex-col justify-end pt-4">
                <div className="flex items-end justify-between gap-2 h-32 w-full px-2 border-b border-slate-100 pb-1">
                  {last7DaysData.map((d, idx) => {
                    const heightPercent = maxMinutesInWeek > 0 ? (d.minutes / maxMinutesInWeek) * 100 : 0;
                    const isToday = idx === last7DaysData.length - 1;
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative cursor-pointer"
                        onMouseEnter={() => setHoveredBar(d)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isToday
                              ? 'bg-indigo-600 group-hover:bg-indigo-500'
                              : d.minutes > 0
                              ? 'bg-indigo-400/80 group-hover:bg-indigo-500'
                              : 'bg-slate-100'
                          }`}
                          style={{ height: `${Math.max(6, heightPercent)}%` }}
                        />
                        <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {d.day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Hover Tooltip display */}
                <div className="h-5 flex items-center justify-center text-center mt-1">
                  {hoveredBar ? (
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {hoveredBar.day} ({hoveredBar.dateStr}): {hoveredBar.minutes} mins
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Hover over bars to inspect daily focus time</span>
                  )}
                </div>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  Subject Time Distribution
                </h3>
                <span className="text-[11px] font-bold text-slate-500">By Subject</span>
              </div>

              {subjectDistribution.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {subjectDistribution.map((item, idx) => {
                    const percent =
                      totalFocusedMinutes > 0
                        ? Math.round((item.minutes / totalFocusedMinutes) * 100)
                        : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.name}
                          </span>
                          <span className="text-slate-500 font-mono">
                            {item.minutes}m ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
                  <Clock className="w-8 h-8 text-slate-300" />
                  <p>No completed study sessions yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Session History Log Table */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              Recent Focus Log ({sessionHistory.length})
            </h3>

            {sessionHistory.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {sessionHistory.slice(0, 10).map((sess) => (
                  <div
                    key={sess.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-700 font-black flex items-center justify-center text-xs">
                        🍅
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 capitalize">
                          {sess.mode.replace('_', ' ')} • {sess.subjectId}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {new Date(sess.completedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="font-bold text-indigo-600">+{sess.durationMinutes} mins</span>
                      <p className="text-[10px] text-amber-600 font-bold">+{sess.xpEarned} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                Complete your first Pomodoro session to see your timeline log here!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
