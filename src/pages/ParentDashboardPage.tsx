import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ParentDashboardPage: React.FC = () => {
  const { user, learningProfile, revisionQueue, dailyPlan } = useApp();
  const [copied, setCopied] = useState(false);
  const [linkCode, setLinkCode] = useState('STUDY-PILOT-8921');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(linkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedToday = dailyPlan.tasks.filter((t) => t.completed).length;
  const totalTasks = dailyPlan.tasks.length;
  const planAdherence = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  return (
    <div id="parent-dashboard-page" className="space-y-6 pb-20 md:pb-8">
      {/* Top Hero Card */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-semibold text-sky-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Parent / Guardian Oversight Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {user.name}’s Academic Progress 📊
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Real-time educational telemetry, study streak adherence, and weakness mitigation for Class {user.classLevel} ({user.board}).
            </p>
          </div>

          {/* Secure Parent Invite Link Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl space-y-2 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
              Parent Link Code
            </span>
            <div className="flex items-center gap-2">
              <code className="bg-white/20 px-3 py-1.5 rounded-xl font-mono font-bold text-sm text-white">
                {linkCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white cursor-pointer transition-colors"
                title="Copy Parent Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{user.streak} Days</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Active & consistent</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Overall Mastery</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{learningProfile.masteryScore}%</p>
          <span className="text-[11px] text-slate-400 font-medium">Weighted syllabus mastery</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Daily Goal Adherence</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{planAdherence}%</p>
          <span className="text-[11px] text-slate-400 font-medium">
            {completedToday} of {totalTasks} tasks done
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Revisions Due Today</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600">
            {revisionQueue.filter((r) => r.status === 'due').length}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Spaced recall topics</span>
        </div>
      </div>

      {/* Detailed Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Weak Areas */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-base">Key Concepts Requiring Focus</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            StudyPilot AI automatically detects chapters where your child scored under 60% accuracy during adaptive quizzes.
          </p>

          <div className="space-y-2.5">
            {learningProfile.weakTopics.map((topic, idx) => (
              <div key={idx} className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{topic}</h4>
                  <span className="text-[11px] text-rose-600 font-medium">Mastery under 60%</span>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
                  Recovery active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Board Exam Countdown & Timetable Summary */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Upcoming Exam Milestone</h3>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-indigo-900">
                Class {user.classLevel} {user.board} Board / Term Exams
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg">
                24 Days Left
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Target study pace: <strong className="font-semibold text-slate-800">{user.dailyStudyMinutes} minutes/day</strong>.
              Your student is currently on track with syllabus coverage.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900">Weekly Study Habit Summary:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Science: 4.5 hours completed this week</li>
              <li>Mathematics: 3.8 hours completed this week</li>
              <li>14 Mistake drills resolved in Spaced Repetition</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
