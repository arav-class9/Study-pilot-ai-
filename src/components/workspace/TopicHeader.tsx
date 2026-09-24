import React from 'react';
import {
  BookOpen,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Play,
  Layers,
  FileText,
  Video,
  HelpCircle,
  Brain,
  RotateCcw,
  ListFilter,
  CheckCircle2,
  ArrowRight,
  Plus,
  PanelLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { TopicWorkspaceItem } from '../../types/workspace';

interface TopicHeaderProps {
  topic: TopicWorkspaceItem;
  activeSection: string;
  setActiveSection: (sec: 'learn' | 'notes' | 'explain' | 'practice' | 'recall' | 'revision') => void;
  onBookmarkToggle: () => void;
  onOpenTopicDrawer: () => void;
  onCreateNewTopic: () => void;
  onContinueLearning: () => void;
  showLeftSidebar?: boolean;
  onToggleLeftSidebar?: () => void;
  showRightTools?: boolean;
  onToggleRightTools?: () => void;
}

export const TopicHeader: React.FC<TopicHeaderProps> = ({
  topic,
  activeSection,
  setActiveSection,
  onBookmarkToggle,
  onOpenTopicDrawer,
  onCreateNewTopic,
  onContinueLearning,
  showLeftSidebar = false,
  onToggleLeftSidebar,
  showRightTools = false,
  onToggleRightTools,
}) => {
  const mastery = topic.masteryScore || 10;

  const sections = [
    { id: 'learn', label: 'Visual Cards', icon: Sparkles },
    { id: 'notes', label: 'AI Notes', icon: FileText },
    { id: 'explain', label: 'Explain', icon: Video },
    { id: 'practice', label: 'Practice', icon: HelpCircle },
    { id: 'recall', label: 'Active Recall', icon: Brain },
    { id: 'revision', label: 'Revision', icon: RotateCcw },
  ];

  return (
    <div className="sticky top-0 z-30 bg-[#FBF9F5] dark:bg-slate-900 border-b border-amber-200/60 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumbs & Topic Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleLeftSidebar && (
            <button
              onClick={onToggleLeftSidebar}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                showLeftSidebar
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-100/80 dark:bg-slate-800 hover:bg-amber-200/80 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-slate-700'
              }`}
              title="Toggle Topics Sidebar"
            >
              <PanelLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Topics</span>
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800/80 dark:text-amber-400/80 uppercase tracking-wider truncate">
              <span>{topic.classLevel || 'Class 9'}</span>
              <span>•</span>
              <span>{topic.subject || 'Science'}</span>
              <span>•</span>
              <span className="truncate">{topic.chapter || 'Chapter'}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-amber-50 truncate tracking-tight flex items-center gap-2">
              <span>{topic.topicName}</span>
              {topic.isBookmarked && (
                <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              )}
            </h1>
          </div>
        </div>

        {/* Topic Mastery Meter & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Topic Mastery Gauge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-amber-100/60 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-amber-200/60 dark:text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-600 dark:text-amber-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${mastery}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-amber-900 dark:text-amber-200">
                {mastery}%
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800/80 dark:text-amber-400">
                Topic Mastery
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {mastery >= 80 ? '🏆 Mastered' : mastery >= 40 ? '⚡ Learning' : '🌱 Starting'}
              </div>
            </div>
          </div>

          {/* Continue Learning Action */}
          <button
            onClick={onContinueLearning}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Continue Learning</span>
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={onBookmarkToggle}
            className={`p-2 rounded-xl border transition-all ${
              topic.isBookmarked
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-amber-200 dark:border-slate-700 hover:bg-amber-50'
            }`}
            title="Save / Bookmark Topic"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Toggle AI Tools Panel */}
          {onToggleRightTools && (
            <button
              onClick={onToggleRightTools}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showRightTools
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-amber-200/80 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-750'
              }`}
              title="Toggle AI Tools & Study Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">AI Tools</span>
            </button>
          )}

          {/* Create New Topic Shortcut */}
          <button
            onClick={onCreateNewTopic}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="Create New Study Topic"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Topic</span>
          </button>
        </div>
      </div>

      {/* Notebook Tab Bar Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-t border-x transition-all shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-slate-950 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-slate-800 shadow-xs translate-y-[1px]'
                  : 'bg-amber-100/40 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-transparent hover:bg-amber-100/70 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
