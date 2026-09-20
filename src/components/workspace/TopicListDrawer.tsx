import React, { useState } from 'react';
import {
  Layers,
  X,
  Search,
  Plus,
  Bookmark,
  BookmarkCheck,
  Trash2,
  BookOpen,
  Award,
  ChevronRight,
} from 'lucide-react';
import { TopicWorkspaceItem } from '../../types/workspace';

interface TopicListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topics: TopicWorkspaceItem[];
  currentTopicId: string;
  onSelectTopic: (topicId: string) => void;
  onCreateNewTopic: () => void;
  onDeleteTopic: (topicId: string) => void;
}

export const TopicListDrawer: React.FC<TopicListDrawerProps> = ({
  isOpen,
  onClose,
  topics,
  currentTopicId,
  onSelectTopic,
  onCreateNewTopic,
  onDeleteTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBookmarkOnly, setFilterBookmarkOnly] = useState(false);

  if (!isOpen) return null;

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.chapter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBookmark = filterBookmarkOnly ? t.isBookmarked : true;
    return matchesSearch && matchesBookmark;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FBF9F5] dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-amber-200 dark:border-slate-800 transition-all">
        {/* Drawer Header */}
        <div className="p-5 border-b border-amber-200/80 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Study Topics Library
              </h3>
              <p className="text-xs text-slate-500">
                {topics.length} saved topic workspace{topics.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Action Bar */}
        <div className="p-4 space-y-3 bg-amber-50/50 dark:bg-slate-900/50 border-b border-amber-200/60 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              onCreateNewTopic();
            }}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Study Topic</span>
          </button>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, subjects, chapters..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setFilterBookmarkOnly(!filterBookmarkOnly)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                filterBookmarkOnly
                  ? 'bg-amber-100 dark:bg-slate-800 border-amber-400 text-amber-900 dark:text-amber-200'
                  : 'bg-white dark:bg-slate-950 border-amber-200 dark:border-slate-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Bookmarked Only</span>
            </button>
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredTopics.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <div>No study topics match your search.</div>
            </div>
          ) : (
            filteredTopics.map((t) => {
              const isSelected = t.id === currentTopicId;
              const mastery = t.masteryScore || 10;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTopic(t.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 group ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-amber-400 dark:border-amber-500 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-white/80 dark:bg-slate-950/60 border-amber-200/80 dark:border-slate-800 hover:bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold uppercase text-amber-800 dark:text-amber-400 tracking-wider">
                        {t.classLevel} • {t.subject} • {t.chapter}
                      </div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 truncate">
                        {t.topicName}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTopic(t.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Meter */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold">
                    <span className="text-slate-500 text-[11px]">
                      Mastery: <span className="text-amber-700 dark:text-amber-400">{mastery}%</span>
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5 text-[11px] font-extrabold">
                      <span>Open Notebook</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
