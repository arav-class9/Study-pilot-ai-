import React from 'react';
import {
  X,
  FileText,
  MessageSquare,
  Sparkles,
  Layers,
  BookMarked,
  Award,
  Lightbulb,
  ChevronRight,
  Brain,
  HelpCircle,
} from 'lucide-react';

export type AIToolActionType =
  | 'notes'
  | 'ask_ai'
  | 'page_quiz'
  | 'chapter_quiz'
  | 'flashcards'
  | 'important_questions'
  | 'explain_page';

interface NCERTAIToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: AIToolActionType) => void;
  bookTitle?: string;
  chapterTitle?: string;
  pageNumber?: number;
}

export const NCERTAIToolsDrawer: React.FC<NCERTAIToolsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  bookTitle,
  chapterTitle,
  pageNumber,
}) => {
  if (!isOpen) return null;

  const tools = [
    {
      id: 'notes' as AIToolActionType,
      title: 'AI Notes',
      desc: 'Generate smart notes from this book',
      icon: FileText,
      iconColor: 'text-[#E11D74]',
      bgTint: 'bg-pink-50/80 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/40',
      badgeBg: 'bg-pink-100 dark:bg-pink-900/60',
    },
    {
      id: 'ask_ai' as AIToolActionType,
      title: 'Ask AI',
      desc: 'Ask any question about this book',
      icon: MessageSquare,
      iconColor: 'text-sky-600 dark:text-sky-400',
      bgTint: 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/40',
      badgeBg: 'bg-sky-100 dark:bg-sky-900/60',
    },
    {
      id: 'page_quiz' as AIToolActionType,
      title: 'Page Quiz',
      desc: pageNumber ? `Create quiz from page ${pageNumber}` : 'Create quiz from current page',
      icon: Sparkles,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgTint: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/40',
      badgeBg: 'bg-purple-100 dark:bg-purple-900/60',
    },
    {
      id: 'chapter_quiz' as AIToolActionType,
      title: 'Chapter Quiz',
      desc: 'Generate quiz from this chapter',
      icon: Layers,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgTint: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    },
    {
      id: 'flashcards' as AIToolActionType,
      title: 'Flashcards',
      desc: 'Make flashcards for better recall',
      icon: BookMarked,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgTint: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/60',
    },
    {
      id: 'important_questions' as AIToolActionType,
      title: 'Important Questions',
      desc: 'Get exam important questions',
      icon: Award,
      iconColor: 'text-rose-600 dark:text-rose-400',
      bgTint: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40',
      badgeBg: 'bg-rose-100 dark:bg-rose-900/60',
    },
    {
      id: 'explain_page' as AIToolActionType,
      title: 'Explain This Page',
      desc: 'Simplify complex concepts',
      icon: Lightbulb,
      iconColor: 'text-pink-600 dark:text-pink-400',
      bgTint: 'bg-pink-50/80 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/40',
      badgeBg: 'bg-pink-100 dark:bg-pink-900/60',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Tools
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Get instant help with AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tools List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between group hover:scale-[1.01] hover:shadow-md cursor-pointer ${tool.bgTint}`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl ${tool.badgeBg} flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    <Icon className={`w-5 h-5 ${tool.iconColor}`} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {tool.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        {(bookTitle || chapterTitle) && (
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="truncate max-w-[280px]">
              Context: {chapterTitle || bookTitle}
            </span>
            {pageNumber && <span>Page {pageNumber}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
