import React from 'react';
import { useApp } from '../context/AppContext';
import { SUBJECTS_META } from '../data/curriculum';
import { CurriculumSubject } from '../types';
import {
  BarChart3,
  Flame,
  Zap,
  Trophy,
  Award,
  CheckCircle2,
  TrendingUp,
  Target,
  Clock,
  BookOpen,
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { user, topicProgressList, quizAttempts, achievements, isProfileLoading } = useApp();

  const subjectsList: CurriculumSubject[] = Object.values(SUBJECTS_META);

  // Subject Mastery calculation
  const subjectStats = subjectsList.map((sub) => {
    const topics = topicProgressList.filter((t) => t.subjectId === sub.id);
    const totalAttempts = topics.reduce((acc, curr) => acc + curr.attempts, 0);
    const totalCorrect = topics.reduce((acc, curr) => acc + curr.correct, 0);
    const avgAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const avgMastery = topics.length > 0 ? Math.round(topics.reduce((a, b) => a + b.masteryScore, 0) / topics.length) : 0;

    return {
      id: sub.id,
      name: sub.name,
      topicsCount: topics.length,
      avgAccuracy,
      avgMastery,
      totalAttempts,
    };
  });

  const totalQuestionsSolved = topicProgressList.reduce((acc, t) => acc + t.attempts, 0);
  const totalMasteredTopics = topicProgressList.filter((t) => t.status === 'mastered' || t.status === 'strong').length;

  return (
    <div id="progress-page" className="space-y-6 pb-20 md:pb-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Academic Progress & Mastery</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Real-time telemetry of your CBSE concept retention, practice tests, and streak.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div>
              <p className="text-[10px] font-extrabold uppercase text-amber-700">Streak</p>
              <p className="text-sm font-black text-amber-900">{user.streak} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-2xl">
            <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            <div>
              <p className="text-[10px] font-extrabold uppercase text-indigo-700">Level {user.level || 1}</p>
              <p className="text-sm font-black text-indigo-900">{isProfileLoading ? 'Loading XP...' : `${user.totalXP ?? 0} XP`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Drills Solved</p>
          <p className="text-2xl font-black text-slate-900">{totalQuestionsSolved}</p>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Concept practice telemetry
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Mastered Concepts</p>
          <p className="text-2xl font-black text-slate-900">{totalMasteredTopics} / {topicProgressList.length}</p>
          <p className="text-[11px] text-indigo-600 font-bold">Over 75% accuracy threshold</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Quizzes Taken</p>
          <p className="text-2xl font-black text-slate-900">{quizAttempts.length}</p>
          <p className="text-[11px] text-slate-500">Adaptive AI evaluations</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Study Streak</p>
          <p className="text-2xl font-black text-amber-600">{user.streak} Days</p>
          <p className="text-[11px] text-amber-700 font-bold">
            {user.streak > 0 ? `${user.streak} consecutive days active` : 'Study today to start your streak'}
          </p>
        </div>
      </div>

      {/* Subject Mastery Spectrum */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Subject-Wise Mastery Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjectStats.map((sub) => (
            <div key={sub.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base">{sub.name}</h3>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {sub.avgMastery}% Mastery
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sub.avgMastery}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 pt-1">
                <span>Accuracy: <strong className="text-slate-800">{sub.avgAccuracy}%</strong></span>
                <span>Questions: <strong className="text-slate-800">{sub.totalAttempts}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements & Badges Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Achievements & Badges Gallery</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                ach.unlocked
                  ? 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{ach.icon}</span>
                  {ach.unlocked ? (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-slate-400">Locked</span>
                  )}
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{ach.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{ach.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Reward:</span>
                <strong className="text-indigo-600">+{ach.xpReward} XP</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
