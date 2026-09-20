import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Video,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { TopicWorkspaceItem } from '../../types/workspace';

interface TopicProgressTrackerProps {
  topic: TopicWorkspaceItem;
  onNavigateSection: (sec: 'learn' | 'notes' | 'explain' | 'practice' | 'recall' | 'revision') => void;
}

export const TopicProgressTracker: React.FC<TopicProgressTrackerProps> = ({
  topic,
  onNavigateSection,
}) => {
  const metrics = topic.progressMetrics;

  const pipelineStages = [
    { id: 'learn', name: 'Learn', icon: BookOpen, completed: true },
    { id: 'notes', name: 'Notes', icon: FileText, completed: metrics.notesCompleted },
    { id: 'explain', name: 'Explain', icon: Video, completed: metrics.explanationCompleted },
    { id: 'practice', name: 'Practice', icon: HelpCircle, completed: metrics.questionsAttempted > 0 },
    { id: 'mastered', name: 'Mastered', icon: Award, completed: metrics.masteryPercentage >= 80 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-200/90 dark:border-slate-800 p-6 shadow-md space-y-6">
      {/* Title & Mastery Ring */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-100 dark:border-slate-800">
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
            Topic Learning Analytics
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Topic Mastery: {metrics.masteryPercentage}%
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
            metrics.revisionStatus === 'Exam Ready'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : metrics.revisionStatus === 'In Progress'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            {metrics.revisionStatus}
          </span>
        </div>
      </div>

      {/* Visual Pipeline Bar: Learn -> Notes -> Explain -> Practice -> Mastered */}
      <div className="space-y-2">
        <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Learning Stage Progression
        </div>
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {pipelineStages.map((stg, idx) => {
            const Icon = stg.icon;
            return (
              <button
                key={stg.id}
                onClick={() => {
                  if (stg.id !== 'mastered') onNavigateSection(stg.id as any);
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  stg.completed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50/40 dark:bg-slate-800/40 border-amber-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${stg.completed ? 'bg-emerald-200/80 text-emerald-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold truncate w-full">{stg.name}</span>
                {stg.completed && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Activity Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 space-y-1">
          <div className="text-[10px] font-extrabold uppercase text-slate-500">Notes Completed</div>
          <div className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            {metrics.notesCompleted ? (
              <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Completed</span>
            ) : (
              <span className="text-amber-600">Pending Notes</span>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 space-y-1">
          <div className="text-[10px] font-extrabold uppercase text-slate-500">Self Explanation</div>
          <div className="text-sm font-black text-slate-900 dark:text-slate-100">
            {metrics.explanationCompleted ? (
              <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Audited</span>
            ) : (
              <span className="text-amber-600">Not Audited</span>
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 space-y-1">
          <div className="text-[10px] font-extrabold uppercase text-slate-500">Questions Attempted</div>
          <div className="text-sm font-black text-slate-900 dark:text-slate-100">
            {metrics.questionsAttempted} / {metrics.totalQuestions}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 space-y-1">
          <div className="text-[10px] font-extrabold uppercase text-slate-500">Quiz Accuracy</div>
          <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
            {metrics.quizScorePercent}%
          </div>
        </div>
      </div>

      {/* Weak Areas Card */}
      {metrics.weakAreas && metrics.weakAreas.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-2">
          <div className="text-xs font-extrabold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 uppercase">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Targeted Weak Areas for Revision</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {metrics.weakAreas.map((wa, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-bold">
                {wa}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
