import React, { useState } from 'react';
import {
  X,
  Search,
  Copy,
  Check,
  FlaskConical,
  Calculator,
  BookOpen,
  Sparkles,
  Zap,
} from 'lucide-react';
import { NCERTChapter, NCERTPageContent } from '../../types/ncert';

interface NCERTFormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: NCERTChapter;
  currentPageContent?: NCERTPageContent | null;
  currentPageNumber: number;
}

export const NCERTFormulaSheetModal: React.FC<NCERTFormulaSheetModalProps> = ({
  isOpen,
  onClose,
  chapter,
  currentPageContent,
  currentPageNumber,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'current_page' | 'all_chapter'>('current_page');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  // Compile formulas and reactions
  const currentPageFormulas = currentPageContent?.formulas || [];
  const currentPageConcepts = currentPageContent?.keyConcepts || [];
  const currentPageVocab = currentPageContent?.vocabulary || [];

  // Compile from all available pages in this chapter
  const allChapterFormulas: { page: number; text: string; source: string }[] = [];
  if (chapter.pages) {
    Object.entries(chapter.pages).forEach(([pgNum, pg]) => {
      if (pg.formulas) {
        pg.formulas.forEach((f) => {
          allChapterFormulas.push({ page: Number(pgNum), text: f, source: pg.sectionTitle });
        });
      }
    });
  }

  // Fallback if chapter has no pages recorded with formulas
  if (allChapterFormulas.length === 0 && chapter.keyThemes) {
    chapter.keyThemes.forEach((kt, idx) => {
      allChapterFormulas.push({
        page: 1,
        text: kt,
        source: `${chapter.title} Key Formula / Law`,
      });
    });
  }

  const filteredPageFormulas = currentPageFormulas.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAllFormulas = allChapterFormulas.filter((f) =>
    f.text.toLowerCase().includes(search.toLowerCase()) ||
    f.source.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConcepts = currentPageConcepts.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVocab = currentPageVocab.filter(
    (v) =>
      v.term.toLowerCase().includes(search.toLowerCase()) ||
      v.definition.toLowerCase().includes(search.toLowerCase())
  );

  const isScience =
    chapter.subjectId === 'science' ||
    chapter.subjectId === 'chemistry' ||
    chapter.subjectId === 'physics';

  return (
    <div
      id="ncert-formula-sheet-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-850 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              {isScience ? (
                <FlaskConical className="w-5 h-5 text-indigo-100" />
              ) : (
                <Calculator className="w-5 h-5 text-indigo-100" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  Quick Revision Sheet
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Page {currentPageNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Formulas, Equations &amp; Definitions
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close formula sheet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search equations, formulas, definitions, laws..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('current_page')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'current_page'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              This Page ({currentPageFormulas.length + currentPageVocab.length})
            </button>
            <button
              onClick={() => setActiveTab('all_chapter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all_chapter'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Chapter Formulas ({allChapterFormulas.length})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'current_page' ? (
            <>
              {/* Formulas / Reactions on Current Page */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chemical Equations &amp; Formulas</span>
                </h3>

                {filteredPageFormulas.length > 0 ? (
                  <div className="space-y-2.5">
                    {filteredPageFormulas.map((formula, idx) => {
                      const copyId = `cp_f_${idx}`;
                      return (
                        <div
                          key={idx}
                          className="group p-3 sm:p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                        >
                          <div className="font-mono text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 break-all select-all">
                            {formula}
                          </div>
                          <button
                            onClick={() => handleCopy(formula, copyId)}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors shrink-0 cursor-pointer"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === copyId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    No specific algebraic formulas or balanced equations listed on this page.
                  </p>
                )}
              </div>

              {/* Vocabulary / Definitions on Current Page */}
              {filteredVocab.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>NCERT Definitions &amp; Key Terms</span>
                  </h3>
                  <div className="space-y-2">
                    {filteredVocab.map((voc, idx) => {
                      const copyId = `cp_v_${idx}`;
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                              {voc.term}
                            </span>
                            <button
                              onClick={() => handleCopy(`${voc.term}: ${voc.definition}`, copyId)}
                              className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                              title="Copy definition"
                            >
                              {copiedIndex === copyId ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {voc.definition}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Core Concepts */}
              {filteredConcepts.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>High-Yield Page Concepts</span>
                  </h3>
                  <div className="space-y-2">
                    {filteredConcepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* All Chapter Formulas */
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                All Chapter High-Yield Formulas &amp; Laws
              </h3>

              {filteredAllFormulas.length > 0 ? (
                filteredAllFormulas.map((item, idx) => {
                  const copyId = `ch_f_${idx}`;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-md">
                            Page {item.page}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {item.source}
                          </span>
                        </div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 break-all select-all">
                          {item.text}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopy(item.text, copyId)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors shrink-0 cursor-pointer"
                        title="Copy"
                      >
                        {copiedIndex === copyId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic p-4 text-center">
                  No formulas match your search query.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500">
          <span>Tip: Tap copy to insert any reaction or formula into your notes.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
