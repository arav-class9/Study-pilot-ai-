import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BookOpen, FileText, CheckCircle2, AlertTriangle, ArrowRight, CornerDownLeft, Loader2, Sparkles, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlobalSearchResult } from '../../types';
import { searchCurriculumApi } from '../../services/aiClient';
import { DeepResearchModal } from './DeepResearchModal';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDeepResearchOpen, setIsDeepResearchOpen] = useState(false);
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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4"
      onClick={onClose}
    >
      <div
        id="global-search-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-[18px] border border-[#e0e0e0] dark:border-[#38383a] overflow-hidden animate-in fade-in duration-150 sp-product-shadow"
      >
        {/* Apple-spec Pill Search Input Header */}
        <div className="p-4 sm:p-5 border-b border-[#e0e0e0] dark:border-[#2a2a2c] bg-white dark:bg-[#1d1d1f]">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-[#7a7a7a] absolute left-4" />
            <input
              id="global-search-input"
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chapters, topics, notes, formulas, or questions..."
              className="w-full h-12 pl-12 pr-12 rounded-full bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-white placeholder-[#7a7a7a] text-[16px] border border-[#e0e0e0] dark:border-[#38383a] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 p-1 text-[#7a7a7a] hover:text-[#1d1d1f] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Deep Research Engine Launcher Bar (Minimal dark utility) */}
        <div className="bg-[#1d1d1f] dark:bg-[#161617] px-6 py-3 text-white flex items-center justify-between border-b border-[#2a2a2c]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0066cc]"></span>
            <span className="text-[13px] text-[#cccccc]">
              AI Research &amp; Multi-source grounding
            </span>
          </div>

          <button
            id="launch-deep-research-from-modal"
            onClick={() => {
              setIsDeepResearchOpen(true);
            }}
            className="px-4 py-1.5 bg-[#0066cc] hover:bg-[#0071e3] text-white text-[13px] font-normal rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Deep Research</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 max-h-[420px] overflow-y-auto divide-y divide-[#e0e0e0] dark:divide-[#2a2a2c]">
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

      <DeepResearchModal
        isOpen={isDeepResearchOpen}
        onClose={() => setIsDeepResearchOpen(false)}
        initialQuery={query}
      />
    </div>
  );
};
