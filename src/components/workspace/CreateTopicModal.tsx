import React, { useState } from 'react';
import {
  Sparkles,
  X,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTopic: (params: {
    topicName: string;
    subject: string;
    classLevel: string;
    chapter: string;
    isBookmarked: boolean;
  }) => void;
}

export const CreateTopicModal: React.FC<CreateTopicModalProps> = ({
  isOpen,
  onClose,
  onCreateTopic,
}) => {
  const [topicName, setTopicName] = useState('');
  const [subject, setSubject] = useState('Science');
  const [classLevel, setClassLevel] = useState('Class 9');
  const [chapter, setChapter] = useState('Tissues');
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) {
      alert('Please enter a topic name!');
      return;
    }

    onCreateTopic({
      topicName: topicName.trim(),
      subject: subject.trim(),
      classLevel: classLevel.trim(),
      chapter: chapter.trim(),
      isBookmarked,
    });

    setTopicName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FBF9F5] dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-amber-300 dark:border-slate-800 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900 dark:text-slate-100">
                Create Study Topic Workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set up a dedicated notebook for any chapter concept
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-amber-100/60 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Example Ribbon */}
        <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <span className="font-extrabold uppercase">Example Hierarchy: </span>
          <span className="font-mono">Class 9 → Science → Tissues → Connective Tissue</span>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                Class / Grade
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full p-3 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
                <option value="Higher Education">Higher Education</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science, Physics, Math"
                className="w-full p-3 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-700 dark:text-slate-300 mb-1">
              Chapter Name
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Tissues, Motion, Chemical Reactions"
              className="w-full p-3 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-amber-900 dark:text-amber-300 mb-1">
              Topic Name *
            </label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. Connective Tissue, Newton's 2nd Law"
              required
              autoFocus
              className="w-full p-3.5 rounded-xl border-2 border-amber-400 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Bookmark Option */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Save & Bookmark Topic</span>
            </span>
            <input
              type="checkbox"
              checked={isBookmarked}
              onChange={(e) => setIsBookmarked(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
          </div>

          {/* Start Learning Action */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all active:scale-[0.99]"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
