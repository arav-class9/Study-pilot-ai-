import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateAIStudyPlan } from '../services/aiClient';
import { StudyCalendarWidget } from '../components/timetable/StudyCalendarWidget';
import {
  CalendarDays,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Loader2,
  Calendar,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { DailyStudyPlan, StudyTask } from '../types';

export const StudyPlanPage: React.FC = () => {
  const { user, dailyPlan, updateDailyPlan, toggleTaskCompletion, topicProgressList } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('evening');
  const [examDate, setExamDate] = useState(user.examDate || '2026-03-15');

  // Weak topics to pass to AI planner
  const weakTopics = topicProgressList.filter((t) => t.status === 'weak').map((t) => t.topicName);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const plan = await generateAIStudyPlan({
        classLevel: user.classLevel,
        dailyStudyMinutes: user.dailyStudyMinutes,
        subjects: user.subjects,
        weakTopics,
        examDate,
        preferredTimeOfDay: preferredTime,
      });

      const newPlan: DailyStudyPlan = {
        id: `plan-${Date.now()}`,
        userId: user.uid,
        date: new Date().toISOString().split('T')[0],
        tasks: (plan.tasks as StudyTask[]) || dailyPlan.tasks,
        totalStudyMinutes: user.dailyStudyMinutes,
        completedTasks: 0,
        totalTasks: plan.tasks?.length || 4,
        generatedAt: new Date().toISOString(),
        motivationQuote: plan.motivationQuote || 'Consistency is the superpower of high achievers.',
      };

      updateDailyPlan(newPlan);
    } catch (err) {
      console.error('Failed to generate study timetable:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const completedCount = dailyPlan.tasks.filter((t) => t.completed).length;
  const totalCount = dailyPlan.tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div id="study-plan-page" className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">AI Daily Study Planner</h1>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Adaptive Schedule
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Balanced daily routines prioritizing revision, practice, and weak-concept recovery.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGeneratePlan}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Optimizing Routine...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Regenerate Daily Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Motivational Quote Banner */}
      {dailyPlan.motivationQuote && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-indigo-950 font-medium italic">
          <span className="text-xl">✨</span>
          <span>"{dailyPlan.motivationQuote}"</span>
        </div>
      )}

      {/* Progress & Target Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Completion</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-slate-900">{progressPercent}%</p>
            <p className="text-xs text-slate-500">{completedCount} of {totalCount} tasks</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Planned Study Time</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-slate-900">{user.dailyStudyMinutes} mins</p>
            <p className="text-xs text-indigo-600 font-bold">Class {user.classLevel} Goal</p>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Structured into 30–45 min focused intervals</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Exam Countdown</p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-rose-600">30 Days Left</p>
            <p className="text-xs text-slate-500">Board Exams</p>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Priority given to weak-accuracy chapters</p>
        </div>
      </div>

      {/* Task Schedule Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">Today's Schedule & Sessions</h2>

        <div className="space-y-3">
          {dailyPlan.tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTaskCompletion(task.id)}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                task.completed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                    task.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white hover:border-indigo-500'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                      {task.timeSlot}
                    </span>
                    <span className="text-xs font-bold uppercase text-slate-500">
                      {task.subjectId} • {task.durationMinutes} mins
                    </span>
                  </div>
                  <h3 className={`text-sm sm:text-base font-extrabold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.chapterName} — {task.topicName}
                  </h3>
                  {task.notes && (
                    <p className="text-xs text-slate-500">{task.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    task.taskType === 'practice'
                      ? 'bg-emerald-100 text-emerald-800'
                      : task.taskType === 'learn'
                      ? 'bg-indigo-100 text-indigo-800'
                      : task.taskType === 'quiz'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {task.taskType}
                </span>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    task.priority === 'high'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Calendar & Time-Blocking Sync Widget */}
      <StudyCalendarWidget dailyPlan={dailyPlan} />
    </div>
  );
};
