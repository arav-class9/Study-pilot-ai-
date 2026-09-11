import React, { useState, useEffect } from 'react';
import { NCERTWeakTopicInfo } from '../../types/ncert';
import { NCERTBookStorage } from '../../services/ncertBookStorage';
import {
  AlertTriangle,
  BookOpen,
  ArrowRight,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface WeakTopicsDashboardProps {
  onNavigateToPage: (pageNumber: number) => void;
  onPracticeTopic?: (topic: NCERTWeakTopicInfo) => void;
}

export const NCERTWeakTopicsDashboard: React.FC<WeakTopicsDashboardProps> = ({
  onNavigateToPage,
  onPracticeTopic,
}) => {
  const [weakTopics, setWeakTopics] = useState<NCERTWeakTopicInfo[]>([]);

  const loadTopics = () => {
    const list = NCERTBookStorage.getWeakTopics();
    setWeakTopics(list);
  };

  useEffect(() => {
    loadTopics();
  }, []);

  if (weakTopics.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          No Critical Weak Topics Detected!
        </h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          As you take chapter quizzes, page assessments, or full-book mock tests, any concepts with under 65% accuracy will automatically be tracked here with their exact NCERT source page citations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              NCERT Weak Topic Recovery &amp; Page Citations
            </h4>
            <p className="text-xs text-slate-500">
              Areas requiring conceptual review based on your textbook quiz attempts
            </p>
          </div>
        </div>

        <button
          onClick={loadTopics}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh stats"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {weakTopics.map((topic, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-amber-900/40 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {topic.topicName}
                </span>
                <span className="text-[11px] text-slate-500">
                  {topic.chapterTitle}
                </span>
              </div>

              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center space-x-1">
                <TrendingDown className="w-3 h-3" />
                <span>{topic.accuracyPercentage}%</span>
              </span>
            </div>

            {/* Source Page Reference & Recovery Button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>NCERT Source: Page {topic.sourcePageNumber}</span>
              </span>

              <button
                onClick={() => onNavigateToPage(topic.sourcePageNumber)}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <span>Read Page {topic.sourcePageNumber}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
