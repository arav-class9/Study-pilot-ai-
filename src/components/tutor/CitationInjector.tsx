import React from 'react';
import { CitationItem } from '../../types';
import { CitationBadge } from './CitationBadge';
import { BookOpen, Sparkles, ShieldCheck } from 'lucide-react';

export interface CitationInjectorProps {
  text: string;
  citations?: CitationItem[];
  defaultBookTitle?: string;
  defaultChapterName?: string;
  className?: string;
  onNavigate?: () => void;
}

/**
 * Regex to detect common citation patterns in AI Tutor responses:
 * e.g.,
 * - [NCERT Class 10 Science, Ch 1, Page 14]
 * - [NCERT Page 14]
 * - [Page 14] or [p. 14] or [pg. 14]
 * - [Citation: Page 14]
 * - [Source: NCERT Page 14]
 */
const CITATION_REGEX = /\[(?:(?:NCERT\s+)?(?:Class\s+\d+\s+)?(?:[A-Za-z\s]+,\s*)?(?:Ch(?:apter)?\.?\s*\d+,?\s*)?)?(?:Citation|Source:\s*)?(?:Page|pg\.?|p\.?)\s*(\d+)(?:,\s*["']([^"']+)["'])?\]/gi;

export const CitationInjector: React.FC<CitationInjectorProps> = ({
  text,
  citations = [],
  defaultBookTitle = 'NCERT Textbook',
  defaultChapterName,
  className = '',
  onNavigate,
}) => {
  if (!text) return null;

  // Function to render text with injected CitationBadge pills
  const renderTextWithCitations = (content: string) => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Reset regex index
    CITATION_REGEX.lastIndex = 0;

    while ((match = CITATION_REGEX.exec(content)) !== null) {
      const matchIndex = match.index;
      const fullMatch = match[0];
      const pageNumStr = match[1];
      const inlineQuote = match[2];
      const pageNumber = parseInt(pageNumStr, 10);

      // Push text preceding the citation
      if (matchIndex > lastIndex) {
        elements.push(content.substring(lastIndex, matchIndex));
      }

      // Look up matching citation item for richer metadata if available
      const matchedCite = citations.find((c) => c.pageNumber === pageNumber);

      const citationData = {
        citationId: matchedCite?.citationId || `cite-p${pageNumber}`,
        pageNumber,
        bookTitle: matchedCite?.bookTitle || defaultBookTitle,
        chapterName: matchedCite?.chapterName || defaultChapterName,
        exactQuote: inlineQuote || matchedCite?.exactQuote,
        sectionTitle: matchedCite?.sectionTitle,
        relevanceScore: matchedCite?.relevanceScore || 95,
      };

      elements.push(
        <CitationBadge
          key={`citation-${matchIndex}-${pageNumber}`}
          citation={citationData}
          variant="pill"
          onClick={onNavigate}
        />
      );

      lastIndex = matchIndex + fullMatch.length;
    }

    // Push trailing text
    if (lastIndex < content.length) {
      elements.push(content.substring(lastIndex));
    }

    return elements.length > 0 ? elements : content;
  };

  return (
    <div className={`whitespace-pre-wrap leading-relaxed ${className}`}>
      {renderTextWithCitations(text)}
    </div>
  );
};

export interface CitationListPanelProps {
  citations?: CitationItem[];
  bookTitle?: string;
  chapterName?: string;
  onNavigate?: () => void;
  className?: string;
}

export const CitationListPanel: React.FC<CitationListPanelProps> = ({
  citations = [],
  bookTitle,
  chapterName,
  onNavigate,
  className = '',
}) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div
      className={`rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-4 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-indigo-100/80 dark:border-indigo-900/60">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Verified NCERT Textbook Citations
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click any citation to jump directly to the exact page &amp; highlight in the PDF viewer
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Curriculum Grounded</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {citations.map((cite, idx) => (
          <CitationBadge
            key={cite.citationId || `cite-card-${idx}`}
            citation={{
              ...cite,
              bookTitle: cite.bookTitle || bookTitle,
              chapterName: cite.chapterName || chapterName,
            }}
            variant="card"
            onClick={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};
