import React, { useState } from 'react';
import { BookOpen, ExternalLink, Sparkles, Check, Bookmark } from 'lucide-react';
import { CitationItem } from '../../types';
import { navigateToCitation, CitationNavigationTarget } from '../../services/citationNavigation';

export interface CitationBadgeProps {
  citation: CitationItem | {
    pageNumber: number;
    bookTitle?: string;
    chapterName?: string;
    chapterId?: string;
    subjectId?: string;
    classLevel?: string;
    exactQuote?: string;
    sectionTitle?: string;
    relevanceScore?: number;
  };
  onClick?: () => void;
  className?: string;
  variant?: 'inline' | 'card' | 'compact' | 'pill';
  showQuote?: boolean;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({
  citation,
  onClick,
  className = '',
  variant = 'inline',
  showQuote = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const pageNum = citation.pageNumber;
  const bookTitle = citation.bookTitle || 'NCERT Textbook';
  const chapterName = citation.chapterName || 'Textbook Source';
  const quote = citation.exactQuote;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const target: CitationNavigationTarget = {
      bookTitle,
      chapterName,
      chapterId: (citation as any).chapterId,
      subjectId: (citation as any).subjectId,
      classLevel: (citation as any).classLevel,
      pageNumber: pageNum,
      exactQuote: quote,
      highlightKeyword: quote ? quote.slice(0, 40) : undefined,
      viewMode: 'pdf',
      source: 'AI Tutor Citation',
    };

    navigateToCitation(target);

    if (onClick) {
      onClick();
    }
  };

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quote) {
      navigator.clipboard.writeText(quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  if (variant === 'pill' || variant === 'inline') {
    return (
      <span className="relative inline-flex items-center align-middle mx-1 my-0.5">
        <button
          type="button"
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer border select-none ${
            'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 dark:text-indigo-300 dark:border-indigo-800/80'
          } ${className}`}
          title={`Click to jump to NCERT Page ${pageNum} and highlight reference in PDF viewer`}
        >
          <BookOpen className="w-3 h-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Page {pageNum}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Hover Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-1 text-[10px] text-indigo-300 font-semibold mb-1">
              <span className="truncate">{bookTitle}</span>
              <span className="font-mono bg-indigo-950 px-1.5 py-0.5 rounded text-indigo-200">
                P.{pageNum}
              </span>
            </div>
            {quote ? (
              <p className="text-slate-200 text-[11px] italic line-clamp-3 leading-snug">
                "{quote}"
              </p>
            ) : (
              <p className="text-slate-300 text-[11px]">
                Click to open NCERT PDF viewer on Page {pageNum} with instant text spotlight.
              </p>
            )}
            <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[9px] text-indigo-400 flex items-center justify-between font-medium">
              <span>📍 Jump to PDF page &amp; highlight</span>
              <span>Click to view</span>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
          </div>
        )}
      </span>
    );
  }

  // Card Variant
  return (
    <div
      onClick={handleClick}
      className={`group relative p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 to-slate-50/70 dark:from-indigo-950/40 dark:to-slate-900/40 hover:from-indigo-100 hover:to-indigo-50 dark:hover:from-indigo-900/50 dark:hover:to-slate-800 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {bookTitle}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                Page {pageNum}
              </span>
            </div>
            {chapterName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {chapterName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {quote && (
            <button
              type="button"
              onClick={handleCopyQuote}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Copy quote"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
            <span>Open PDF</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>

      {showQuote && quote && (
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-indigo-50 dark:border-indigo-950/80 leading-relaxed">
          "{quote}"
        </div>
      )}
    </div>
  );
};
