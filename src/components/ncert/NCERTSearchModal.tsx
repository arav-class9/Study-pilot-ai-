import React, { useState, useMemo } from 'react';
import { NCERTUploadedBook, NCERTBookSearchIndexEntry } from '../../types/ncert';
import {
  X,
  Search,
  BookOpen,
  ArrowRight,
  Filter,
  FileText,
  Activity,
  HelpCircle,
} from 'lucide-react';

interface NCERTSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: NCERTUploadedBook;
  onNavigateToPage: (pageNumber: number) => void;
}

export const NCERTSearchModal: React.FC<NCERTSearchModalProps> = ({
  isOpen,
  onClose,
  book,
  onNavigateToPage,
}) => {
  const [query, setQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'heading' | 'topic' | 'exercise' | 'diagram'>('all');

  const filteredResults = useMemo(() => {
    if (!book || !book.searchIndex) return [];
    const q = query.trim().toLowerCase();

    return book.searchIndex.filter((entry) => {
      // Type match
      if (filterType !== 'all' && entry.type !== filterType) {
        return false;
      }
      if (!q) return true; // Show initial entries

      return (
        entry.matchSnippet.toLowerCase().includes(q) ||
        entry.sectionTitle.toLowerCase().includes(q) ||
        entry.chapterTitle.toLowerCase().includes(q) ||
        String(entry.pageNumber) === q
      );
    });
  }, [book, query, filterType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search across ${book.totalPages} pages of ${book.title}...`}
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1" />
            Filter:
          </span>
          {(
            [
              { id: 'all', label: 'All Content' },
              { id: 'heading', label: 'Headings & Sections' },
              { id: 'topic', label: 'Key Topics' },
              { id: 'exercise', label: 'Questions & Exercises' },
              { id: 'diagram', label: 'Diagrams & Activities' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterType === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching NCERT sections found for "{query}". Try a different topic or formula.
            </div>
          ) : (
            filteredResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onNavigateToPage(item.pageNumber);
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800/60 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                      Page {item.pageNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.sectionTitle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {item.matchSnippet}
                  </p>

                  <span className="text-[11px] text-slate-400 block">
                    {item.chapterTitle}
                  </span>
                </div>

                <div className="shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredResults.length} searchable items found</span>
          <span>Click any item to jump directly to that page in Reader</span>
        </div>
      </div>
    </div>
  );
};
