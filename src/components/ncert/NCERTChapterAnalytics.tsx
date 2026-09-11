import React, { useState, useEffect } from 'react';
import { NCERTChapter, NCERTChapterAnalyticsData } from '../../types/ncert';
import { NCERTService } from '../../services/ncertService';
import {
  X,
  BarChart2,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface NCERTChapterAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: NCERTChapter;
  userId: string;
  onJumpToPage: (pageNumber: number) => void;
}

export const NCERTChapterAnalytics: React.FC<NCERTChapterAnalyticsProps> = ({
  isOpen,
  onClose,
  chapter,
  userId,
  onJumpToPage,
}) => {
  const [data, setData] = useState<NCERTChapterAnalyticsData | null>(null);

  useEffect(() => {
    if (isOpen) {
      const analytics = NCERTService.getChapterAnalytics({
        userId,
        chapterId: chapter.id,
        totalPages: chapter.totalPages,
        chapterName: chapter.title,
        subjectId: chapter.subjectId,
        classLevel: chapter.classLevel,
      });
      setData(analytics);
    }
  }, [isOpen, userId, chapter]);

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-linear-to-r from-sky-600 to-indigo-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <BarChart2 className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Chapter Performance Analytics
              </h3>
              <p className="text-xs text-sky-100 truncate max-w-md">
                Ch {chapter.chapterNumber}: {chapter.title} (Class {chapter.classLevel} NCERT)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Pages Read
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {data.pagesReadCount} / {data.totalPages}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {Math.round((data.pagesReadCount / Math.max(1, data.totalPages)) * 100)}% of chapter
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Quizzes Mastered
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data.pagesMasteredCount} Pages
              </div>
              <div className="text-[10px] text-emerald-600/80 mt-0.5">&ge; 80% accuracy</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Average Accuracy
              </div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {data.averageScorePercentage}%
              </div>
              <div className="text-[10px] text-indigo-500 mt-0.5">
                {data.totalQuizzesTaken} attempts total
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Mastery Score
              </div>
              <div className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">
                {data.masteryLevelPercentage}%
              </div>
              <div className="text-[10px] text-sky-500 mt-0.5">Board readiness</div>
            </div>
          </div>

          {/* Chapter Mastery Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Overall Chapter Mastery Level</span>
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                {data.masteryLevelPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-sky-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${data.masteryLevelPercentage}%` }}
              />
            </div>
          </div>

          {/* Interactive Page-by-Page Progress Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Page-by-Page Progress Map (Click any page to jump)
              </h4>
              <div className="flex items-center space-x-3 text-[11px]">
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-500">Mastered</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-500">Needs Revision</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-slate-500">Read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-slate-500">Unread</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => {
                const prog = data.pageProgressMap[pageNum];
                let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                let scoreText = 'Unread';

                if (prog?.status === 'mastered') {
                  bgClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-500/20';
                  scoreText = `${prog.highestScorePercentage}%`;
                } else if (prog?.status === 'needs_revision') {
                  bgClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700';
                  scoreText = `${prog.highestScorePercentage}%`;
                } else if (prog?.isRead) {
                  bgClass = 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700';
                  scoreText = 'Read';
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      onJumpToPage(pageNum);
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-transform hover:scale-105 cursor-pointer ${bgClass}`}
                  >
                    <div className="text-xs font-black">Page {pageNum}</div>
                    <div className="text-[10px] font-medium mt-0.5 truncate">{scoreText}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Quiz Attempts Log */}
          {data.recentAttempts && data.recentAttempts.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Recent Page Quiz Attempts on this Chapter
              </h4>
              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {data.recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="p-3 bg-white dark:bg-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        Page {attempt.pageNumber} Quiz
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {new Date(attempt.date).toLocaleDateString()} • {attempt.difficulty} mode
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-black px-2 py-0.5 rounded-full text-xs ${
                          attempt.percentage >= 80
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : attempt.percentage >= 50
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                      </span>
                      <button
                        onClick={() => {
                          onJumpToPage(attempt.pageNumber);
                          onClose();
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        Open Page &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
