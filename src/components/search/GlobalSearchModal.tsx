import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BookOpen, FileText, CheckCircle2, AlertTriangle, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlobalSearchResult } from '../../types';
import { searchCurriculumApi } from '../../services/aiClient';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { notes, setActiveTab, setSelectedChapter } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          const searchBtn = document.getElementById('navbar-search-btn');
          searchBtn?.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCurriculumApi({ query, notes });
        setSearchResults(results);
      } catch (e) {
        console.warn('Search API error:', e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, notes]);

  if (!isOpen) return null;

  const handleSelectResult = (item: GlobalSearchResult) => {
    if (item.category === 'chapter' || item.category === 'topic') {
      if (item.metadata?.chapter) {
        setSelectedChapter(item.metadata.chapter);
      }
    }
    setActiveTab(item.targetTab);
    onClose();
  };

  return (
    <div
      id="global-search-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        id="global-search-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            id="global-search-input"
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters, topics, notes, formulas, mistakes..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-96 overflow-y-auto divide-y divide-slate-100">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Quick Navigation
              </p>
              <p className="text-xs">Type anything to search across StudyPilot AI's entire syllabus.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-slate-500 space-y-1">
              <p className="text-sm font-semibold">No results found for "{query}"</p>
              <p className="text-xs text-slate-400">Try searching for a topic, chapter, or formula.</p>
            </div>
          ) : (
            searchResults.map((item) => {
              let Icon = BookOpen;
              let iconColor = 'text-indigo-600 bg-indigo-50';
              if (item.category === 'note') {
                Icon = FileText;
                iconColor = 'text-sky-600 bg-sky-50';
              } else if (item.category === 'mistake') {
                Icon = AlertTriangle;
                iconColor = 'text-rose-600 bg-rose-50';
              }

              return (
                <div
                  key={item.id}
                  id={`search-result-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50/60 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-indigo-600">
                    <span className="hidden sm:inline">Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Global NCERT Curriculum & Workspace Index</span>
          <span className="flex items-center gap-1 font-semibold">
            Press <CornerDownLeft className="w-3.5 h-3.5 inline" /> to select
          </span>
        </div>
      </div>
    </div>
  );
};
