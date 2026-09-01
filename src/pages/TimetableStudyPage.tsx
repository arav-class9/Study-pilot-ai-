import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimetableDashboard } from '../components/timetable/TimetableDashboard';
import { CalendarDays, Sparkles, Clock, CheckCircle2, Plus, Zap, Award } from 'lucide-react';

export const TimetableStudyPage: React.FC = () => {
  const { user, customTimetable } = useApp();

  const completedSessions = customTimetable?.sessions?.filter((s) => s.status === 'completed').length || 0;
  const totalSessions = customTimetable?.sessions?.filter((s) => s.type === 'study').length || 0;
  const studyMinutes = customTimetable?.sessions
    ?.filter((s) => s.type === 'study' && s.status === 'completed')
    .reduce((acc, s) => acc + s.durationMinutes, 0) || 0;

  return (
    <div id="timetable-study-page" className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                AI Timetable Studio
              </span>
              <span className="text-xs text-indigo-300">Class {user.classLevel} • {user.board}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Daily Study Timetable</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Organize your study blocks, schedule smart breaks, and conquer your CBSE syllabus with disciplined time management.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-indigo-200">Completed Sessions</p>
            <p className="text-xl font-black text-white mt-0.5">{completedSessions} / {totalSessions}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-indigo-200">Study Time Today</p>
            <p className="text-xl font-black text-amber-300 mt-0.5">{studyMinutes} mins</p>
          </div>
        </div>
      </div>

      {/* Main Timetable Dashboard */}
      <TimetableDashboard />
    </div>
  );
};
