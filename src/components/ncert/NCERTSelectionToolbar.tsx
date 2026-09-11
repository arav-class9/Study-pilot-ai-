import React, { useState } from 'react';
import {
  Highlighter,
  FileText,
  Lightbulb,
  Sparkles,
  Volume2,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface SelectionToolbarProps {
  position: { top: number; left: number };
  selectedText: string;
  pageNumber: number;
  chapterTitle: string;
  onHighlight: (color: 'yellow' | 'emerald' | 'cyan' | 'rose') => void;
  onAction: (actionType: 'notes' | 'explain' | 'quiz') => void;
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
  const [copied, setCopied] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleCopyCitation = () => {
    const citation = `"${selectedText.trim()}"\n— NCERT ${chapterTitle}, Page ${pageNumber}`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      id="ncert-selection-toolbar"
      style={{
        top: `${Math.max(10, position.top - 54)}px`,
        left: `${Math.max(16, Math.min(window.innerWidth - 380, position.left))}px`,
      }}
      className="fixed z-50 flex items-center gap-1.5 p-1.5 bg-slate-900/95 dark:bg-slate-800/95 text-white rounded-xl shadow-2xl backdrop-blur-md border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Highlight Button / Color Palette */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-1.5 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-amber-300 transition-colors flex items-center space-x-1"
          title="Highlight Text"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 flex items-center gap-1 p-1 bg-slate-900 border border-slate-700 rounded-lg shadow-lg">
            <button
              onClick={() => {
                onHighlight('yellow');
                setShowColorPicker(false);
              }}
              className="w-5 h-5 rounded-full bg-amber-400 hover:scale-110 transition-transform"
              title="Yellow Highlight"
            />
            <button
              onClick={() => {
                onHighlight('emerald');
                setShowColorPicker(false);
              }}
              className="w-5 h-5 rounded-full bg-emerald-400 hover:scale-110 transition-transform"
              title="Emerald Highlight"
            />
            <button
              onClick={() => {
                onHighlight('cyan');
                setShowColorPicker(false);
              }}
              className="w-5 h-5 rounded-full bg-cyan-400 hover:scale-110 transition-transform"
              title="Cyan Highlight"
            />
            <button
              onClick={() => {
                onHighlight('rose');
                setShowColorPicker(false);
              }}
              className="w-5 h-5 rounded-full bg-rose-400 hover:scale-110 transition-transform"
              title="Rose Highlight"
            />
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-slate-700 mx-0.5" />

      {/* Generate Notes */}
      <button
        id="selection-notes-btn"
        onClick={() => onAction('notes')}
        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
        title="Generate High-Yield Notes Strictly from Selection"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Notes</span>
      </button>

      {/* Explain Concept */}
      <button
        id="selection-explain-btn"
        onClick={() => onAction('explain')}
        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
        title="Explain Concept Simply"
      >
        <Lightbulb className="w-3.5 h-3.5" />
        <span>Explain</span>
      </button>

      {/* Strict Quiz */}
      <button
        id="selection-quiz-btn"
        onClick={() => onAction('quiz')}
        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
        title="Create Strict Quiz from Selected Text"
      >
        <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
        <span>Quiz</span>
      </button>

      <div className="w-px h-4 bg-slate-700 mx-0.5" />

      {/* Read Aloud */}
      <button
        onClick={handleSpeech}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        title="Read Selected Text Aloud"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      {/* Copy Citation */}
      <button
        onClick={handleCopyCitation}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        title="Copy Text with NCERT Citation"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>

      {/* Dismiss */}
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        title="Close Toolbar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
