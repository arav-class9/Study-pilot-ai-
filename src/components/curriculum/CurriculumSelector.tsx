import React, { useMemo } from 'react';
import {
  getCurriculumChapters,
  getCurriculumSubjects,
  SUPPORTED_BOARDS,
  ALL_CLASSES,
} from '../../data/curriculumDatabase';
import { SubjectId, ClassLevel } from '../../types';
import { Compass, ChevronDown } from 'lucide-react';

interface CurriculumSelectorProps {
  selectedBoard: string;
  selectedClass: ClassLevel;
  selectedSubject: SubjectId;
  selectedChapterId?: string;
  selectedTopicId?: string;
  onSelect: (selection: {
    board: string;
    classLevel: ClassLevel;
    subject: SubjectId;
    chapterId?: string;
    topicId?: string;
    chapterName?: string;
    topicName?: string;
  }) => void;
  compact?: boolean;
}

export const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({
  selectedBoard,
  selectedClass,
  selectedSubject,
  selectedChapterId,
  selectedTopicId,
  onSelect,
  compact = false,
}) => {
  const availableSubjects = useMemo(() => {
    return getCurriculumSubjects(selectedClass, selectedBoard);
  }, [selectedClass, selectedBoard]);

  const filteredChapters = useMemo(() => {
    return getCurriculumChapters(selectedClass, selectedBoard, selectedSubject);
  }, [selectedClass, selectedBoard, selectedSubject]);

  const currentChapter =
    filteredChapters.find((c) => c.id === selectedChapterId) || filteredChapters[0];
  const availableTopics = currentChapter?.topics || [];
  const currentTopic =
    availableTopics.find((t) => t.id === selectedTopicId) || availableTopics[0];

  return (
    <div
      id="curriculum-hierarchy-selector"
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs transition-all ${
        compact ? 'p-3' : 'p-4 sm:p-5'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Compass className="w-4 h-4 text-indigo-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Verified Curriculum Hierarchy
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Board Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Board</label>
          <div className="relative">
            <select
              id="curriculum-board-select"
              value={selectedBoard}
              onChange={(e) =>
                onSelect({
                  board: e.target.value,
                  classLevel: selectedClass,
                  subject: selectedSubject,
                  chapterId: currentChapter?.id,
                  topicId: currentTopic?.id,
                  chapterName: currentChapter?.name,
                  topicName: currentTopic?.name,
                })
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
            >
              {SUPPORTED_BOARDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.country})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* 2. Class Level */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Class Level</label>
          <div className="relative">
            <select
              id="curriculum-class-select"
              value={selectedClass}
              onChange={(e) =>
                onSelect({
                  board: selectedBoard,
                  classLevel: e.target.value as ClassLevel,
                  subject: selectedSubject,
                  chapterId: undefined,
                  topicId: undefined,
                })
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
            >
              {ALL_CLASSES.map((c) => (
                <option key={c.level} value={c.level}>
                  {c.label} ({c.stage})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* 3. Subject */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject</label>
          <div className="relative">
            <select
              id="curriculum-subject-select"
              value={selectedSubject}
              onChange={(e) =>
                onSelect({
                  board: selectedBoard,
                  classLevel: selectedClass,
                  subject: e.target.value as SubjectId,
                  chapterId: undefined,
                  topicId: undefined,
                })
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
            >
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* 4. Chapter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Chapter</label>
          <div className="relative">
            <select
              id="curriculum-chapter-select"
              value={currentChapter?.id || ''}
              onChange={(e) => {
                const chap = filteredChapters.find((c) => c.id === e.target.value);
                onSelect({
                  board: selectedBoard,
                  classLevel: selectedClass,
                  subject: selectedSubject,
                  chapterId: chap?.id,
                  topicId: chap?.topics[0]?.id,
                  chapterName: chap?.name,
                  topicName: chap?.topics[0]?.name,
                });
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 appearance-none focus:bg-white focus:border-indigo-500 focus:outline-hidden truncate pr-8 cursor-pointer"
            >
              {filteredChapters.length > 0 ? (
                filteredChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              ) : (
                <option value="">General Syllabus</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {currentTopic && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Selected Topic:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {currentTopic.name}
            </span>
          </div>
          {currentChapter?.bookName && (
            <span className="text-[11px] text-slate-400 font-medium">
              Source: {currentChapter.bookName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
