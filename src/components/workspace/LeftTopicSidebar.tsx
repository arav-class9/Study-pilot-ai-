import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Bookmark,
  BookmarkCheck,
  Layers,
  Trash2,
  Sparkles,
  TrendingUp,
  Brain,
  HelpCircle,
  Award,
} from 'lucide-react';
import { TopicWorkspaceItem } from '../../types/workspace';

interface LeftTopicSidebarProps {
  topics: TopicWorkspaceItem[];
  currentTopic: TopicWorkspaceItem;
  onSelectTopic: (id: string) => void;
  onCreateNewTopic: () => void;
  onDeleteTopic: (id: string) => void;
  onBookmarkToggle: () => void;
}

export const LeftTopicSidebar: React.FC<LeftTopicSidebarProps> = ({
  topics,
  currentTopic,
  onSelectTopic,
  onCreateNewTopic,
  onDeleteTopic,
  onBookmarkToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'bookmarked'>('all');

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterMode === 'bookmarked') {
      return matchesSearch && t.isBookmarked;
    }
    return matchesSearch;
  });

  const mastery = currentTopic.masteryScore || 10;
  const metrics = currentTopic.progressMetrics;

  return (
    <aside className="w-80 shrink-0 space-y-5 hidden lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pr-1">
      {/* Topics Header & Create Button */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Study Topics ({topics.length})
              </h3>
              <p className="text-[11px] font-semibold text-slate-500">Quick Navigation</p>
            </div>
          </div>

          <button
            onClick={onCreateNewTopic}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs"
            title="Create New Topic"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or chapter..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-amber-200/80 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-amber-100/50 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={`flex-1 py-1 rounded-lg transition-all text-center ${
              filterMode === 'all'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-amber-50'
            }`}
          >
            All ({topics.length})
          </button>
          <button
            onClick={() => setFilterMode('bookmarked')}
            className={`flex-1 py-1 rounded-lg transition-all text-center ${
              filterMode === 'bookmarked'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-amber-50'
            }`}
          >
            Bookmarked ({topics.filter((t) => t.isBookmarked).length})
          </button>
        </div>

        {/* Topic List */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No topics found.
            </div>
          ) : (
            filteredTopics.map((item) => {
              const isSelected = item.id === currentTopic.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectTopic(item.id)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                    isSelected
                      ? 'bg-amber-100/90 dark:bg-slate-800 border-amber-400 dark:border-amber-500 text-slate-900 dark:text-amber-100 shadow-2xs'
                      : 'bg-white dark:bg-slate-950/50 border-amber-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800/80 dark:text-amber-400">
                      <span>{item.classLevel}</span>
                      <span>•</span>
                      <span className="truncate">{item.subject}</span>
                    </div>
                    <div className="text-xs font-black truncate text-slate-900 dark:text-slate-100">
                      {item.topicName}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200/60 dark:bg-slate-700 text-amber-900 dark:text-amber-200">
                      {item.masteryScore || 10}%
                    </span>
                    {topics.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTopic(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-100 rounded-lg transition-all"
                        title="Delete Topic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Topic Chapter Breadcrumbs & Mastery Progress Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-amber-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Topic Mastery Tracker
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {metrics.revisionStatus}
          </span>
        </div>

        {/* Chapter Breadcrumb Display */}
        <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-slate-950 border border-amber-200/60 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-amber-800 dark:text-amber-400 tracking-wider">
            Curriculum Path
          </span>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-1">
            <span>{currentTopic.classLevel}</span>
            <span className="text-slate-400">/</span>
            <span>{currentTopic.subject}</span>
            <span className="text-slate-400">/</span>
            <span className="text-amber-700 dark:text-amber-300">{currentTopic.chapter}</span>
          </div>
        </div>

        {/* Visual Progress Gauge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">Current Mastery Level</span>
            <span className="text-amber-800 dark:text-amber-300">{mastery}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-amber-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-amber-200 dark:border-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>

        {/* Quick Metrics Breakdown */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <HelpCircle className="w-3 h-3 text-indigo-500" />
              <span>Questions</span>
            </div>
            <div className="font-extrabold text-slate-900 dark:text-slate-100">
              {metrics.questionsAttempted} / {metrics.totalQuestions}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Brain className="w-3 h-3 text-amber-500" />
              <span>Quiz Score</span>
            </div>
            <div className="font-extrabold text-slate-900 dark:text-slate-100">
              {metrics.quizScorePercent}%
            </div>
          </div>
        </div>

        {/* Weak Areas Tags */}
        {metrics.weakAreas.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-amber-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold uppercase text-rose-700 dark:text-rose-400 tracking-wider">
              Focus Areas for Review:
            </span>
            <div className="flex flex-wrap gap-1">
              {metrics.weakAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[10px] font-bold border border-rose-200 dark:border-rose-900"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
