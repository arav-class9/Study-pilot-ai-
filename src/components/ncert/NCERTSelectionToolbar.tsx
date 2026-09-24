import React, { useState } from 'react';
import {
  Lightbulb,
  Scissors,
  Sparkles,
  FileText,
  MessageSquare,
  Highlighter,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';

export type SelectionActionType = 'explain' | 'simplify' | 'quiz' | 'notes' | 'ask_ai';

interface SelectionToolbarProps {
  position: { top: number; left: number };
  selectedText: string;
  pageNumber: number;
  chapterTitle: string;
  onHighlight: (color: 'yellow' | 'emerald' | 'cyan' | 'rose') => void;
  onAction: (actionType: SelectionActionType) => void;
  onClose: () => void;
}

export const NCERTSelectionToolbar: React.FC<SelectionToolbarProps> = ({
  position,
  selectedText,
  pageNumber,
  chapterTitle,
  onHighlight,
  onAction,
  onClose,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div
      id="ncert-selection-toolbar"
      style={{
        top: `${Math.max(12, position.top - 52)}px`,
        left: `${Math.max(16, Math.min(window.innerWidth - 380, position.left))}px`,
      }}
      className="fixed z-50 flex items-center gap-1 p-1 bg-slate-950/95 text-white rounded-full shadow-2xl backdrop-blur-md border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150"
    >
      {!showMore ? (
        <>
          {/* Explain */}
          <button
            id="selection-explain-btn"
            onClick={() => onAction('explain')}
            className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-xs font-bold text-slate-100 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            <span>Explain</span>
          </button>

          {/* Simplify */}
          <button
            id="selection-simplify-btn"
            onClick={() => onAction('simplify')}
            className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-xs font-bold text-slate-100 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-300" />
            <span>Simplify</span>
          </button>

          {/* Make Quiz */}
          <button
            id="selection-quiz-btn"
            onClick={() => onAction('quiz')}
            className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-xs font-bold text-slate-100 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Make Quiz</span>
          </button>

          {/* More chevron > */}
          <button
            onClick={() => setShowMore(true)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="More actions"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          {/* Back < */}
          <button
            onClick={() => setShowMore(false)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Notes */}
          <button
            onClick={() => onAction('notes')}
            className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-xs font-bold text-slate-100 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Make Notes</span>
          </button>

          {/* Ask AI */}
          <button
            onClick={() => onAction('ask_ai')}
            className="px-3 py-1.5 rounded-full hover:bg-slate-800 text-xs font-bold text-slate-100 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
            <span>Ask AI</span>
          </button>

          {/* Highlight */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 rounded-full hover:bg-slate-800 text-amber-300 transition-colors flex items-center cursor-pointer"
              title="Highlight"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 p-1 bg-slate-900 border border-slate-700 rounded-full shadow-lg">
                <button
                  onClick={() => {
                    onHighlight('yellow');
                    setShowColorPicker(false);
                  }}
                  className="w-4 h-4 rounded-full bg-amber-400 hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => {
                    onHighlight('emerald');
                    setShowColorPicker(false);
                  }}
                  className="w-4 h-4 rounded-full bg-emerald-400 hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => {
                    onHighlight('cyan');
                    setShowColorPicker(false);
                  }}
                  className="w-4 h-4 rounded-full bg-cyan-400 hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => {
                    onHighlight('rose');
                    setShowColorPicker(false);
                  }}
                  className="w-4 h-4 rounded-full bg-rose-400 hover:scale-110 transition-transform"
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Dismiss */}
      <button
        onClick={onClose}
        className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
