import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  NCERTChapter,
  NCERTPageContent,
  NCERTClass,
  NCERTSubjectId,
  NCERTUploadedBook,
  NCERTSelectionActionResult,
  NCERTHighlight,
} from '../../types/ncert';
import { NCERTService } from '../../services/ncertService';
import { NCERTBookStorage } from '../../services/ncertBookStorage';
import { NCERTSelectionToolbar, SelectionActionType } from './NCERTSelectionToolbar';
import { NCERTSelectionResultModal } from './NCERTSelectionResultModal';
import { NCERTAIToolsDrawer, AIToolActionType } from './NCERTAIToolsDrawer';
import { NCERTSearchModal } from './NCERTSearchModal';
import { NCERTFullBookTestModal } from './NCERTFullBookTestModal';
import { NCERTWeakTopicsDashboard } from './NCERTWeakTopicsDashboard';
import { NCERTFormulaSheetModal } from './NCERTFormulaSheetModal';
import { NCERTFlashcardsModal } from './NCERTFlashcardsModal';
import { NCERTChatModal } from './NCERTChatModal';
import { NCERTPageSummaryModal } from './NCERTPageSummaryModal';
import { NCERTPageLearningModal } from './NCERTPageLearningModal';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  Brain,
  MessageSquare,
  FileText,
  CheckCircle,
  HelpCircle,
  FlaskConical,
  BookMarked,
  Layers,
  ArrowRight,
  Upload,
  BarChart2,
  Search,
  Award,
  Highlighter,
  AlertTriangle,
  Calculator,
  Play,
  Pause,
  Square,
  Bookmark,
  X,
  Lightbulb,
  Check,
  Share2,
  MoreHorizontal,
  Type,
  Sun,
  Moon,
  Compass,
  Atom,
} from 'lucide-react';
import {
  onCitationNavigation,
  CitationNavigationTarget,
  clearActiveCitationTarget,
} from '../../services/citationNavigation';

interface NCERTReaderProps {
  chapter: NCERTChapter;
  initialPage?: number;
  targetCitation?: CitationNavigationTarget | null;
  userId: string;
  uploadedBook?: NCERTUploadedBook | null;
  onLaunchQuiz: (pageContent: NCERTPageContent, pageNumber: number) => void;
  onOpenUpload: () => void;
  onOpenUploadPDF?: () => void;
  onOpenAnalytics: () => void;
  onOpenRevision: () => void;
  onBackToCatalogue: () => void;
}

type ReaderTab = 'read' | 'notes' | 'summary' | 'quiz';

export const NCERTReader: React.FC<NCERTReaderProps> = ({
  chapter,
  initialPage = 1,
  targetCitation = null,
  userId,
  uploadedBook,
  onLaunchQuiz,
  onOpenUpload,
  onOpenUploadPDF,
  onOpenAnalytics,
  onOpenRevision,
  onBackToCatalogue,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageData, setPageData] = useState<NCERTPageContent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ReaderTab>('read');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [jumpPageInput, setJumpPageInput] = useState<string>(String(initialPage));

  // Selection & Toolbar states
  const [selectedText, setSelectedText] = useState<string>('');
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [selectionModalOpen, setSelectionModalOpen] = useState<boolean>(false);
  const [selectionResult, setSelectionResult] = useState<NCERTSelectionActionResult | null>(null);
  const [selectionLoading, setSelectionLoading] = useState<boolean>(false);
  const [highlights, setHighlights] = useState<NCERTHighlight[]>([]);

  // Bookmark state
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`bookmark_${chapter.id}_${initialPage}`);
      return Boolean(saved);
    } catch (e) {
      return false;
    }
  });

  const toggleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      try {
        if (next) {
          localStorage.setItem(`bookmark_${chapter.id}_${currentPage}`, 'true');
        } else {
          localStorage.removeItem(`bookmark_${chapter.id}_${currentPage}`);
        }
      } catch (e) {}
      return next;
    });
  };

  // Drawer and Modals
  const [aiToolsDrawerOpen, setAiToolsDrawerOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [weakTopicsModalOpen, setWeakTopicsModalOpen] = useState<boolean>(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState<boolean>(false);
  const [flashcardsModalOpen, setFlashcardsModalOpen] = useState<boolean>(false);
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState<boolean>(false);
  const [pageLearningModalOpen, setPageLearningModalOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);

  // Audio Speech Controls
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSpeechPaused, setIsSpeechPaused] = useState<boolean>(false);

  // PDF View vs Structured View
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>(targetCitation?.viewMode || 'text');
  const [pdfZoom, setPdfZoom] = useState<number>(1.0);

  // Citation Spotlight State
  const [activeCitation, setActiveCitation] = useState<CitationNavigationTarget | null>(targetCitation || null);

  const contentRef = useRef<HTMLDivElement>(null);

  // Global citation navigation events
  useEffect(() => {
    const unsubscribe = onCitationNavigation((target) => {
      if (target.pageNumber) {
        setCurrentPage(target.pageNumber);
        if (target.viewMode) {
          setViewMode(target.viewMode);
        }
        setActiveCitation(target);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load Page Data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setJumpPageInput(String(currentPage));

    // Update bookmark status for this page
    try {
      const saved = localStorage.getItem(`bookmark_${chapter.id}_${currentPage}`);
      setIsBookmarked(Boolean(saved));
    } catch (e) {
      setIsBookmarked(false);
    }

    // Load saved highlights
    NCERTBookStorage.getHighlights(chapter.id, currentPage)
      .then((loadedHls) => {
        if (isMounted) setHighlights(loadedHls);
      })
      .catch((err) => {
        console.warn('Could not load highlights:', err);
      });

    NCERTService.getPageContent({
      chapterId: chapter.id,
      classLevel: chapter.classLevel,
      subjectId: chapter.subjectId,
      chapterName: chapter.title,
      pageNumber: currentPage,
    })
      .then((data) => {
        if (isMounted) {
          setPageData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load page content:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [chapter, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < chapter.totalPages) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpPageInput, 10);
    if (!isNaN(target) && target >= 1 && target <= chapter.totalPages) {
      setCurrentPage(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  // Text selection detection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setToolbarPos(null);
      setSelectedText('');
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 4) {
      setToolbarPos(null);
      setSelectedText('');
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedText(text);
    setToolbarPos({
      top: rect.top + window.scrollY,
      left: rect.left + rect.width / 2 - 140,
    });
  };

  const handleHighlight = (color: 'yellow' | 'emerald' | 'cyan' | 'rose') => {
    if (!selectedText) return;
    const newHighlight: NCERTHighlight = {
      id: `hl_${Date.now()}`,
      userId,
      chapterId: chapter.id,
      pageNumber: currentPage,
      text: selectedText,
      color,
      createdAt: new Date().toISOString(),
    };
    NCERTBookStorage.saveHighlight(newHighlight);
    setHighlights((prev) => [...prev, newHighlight]);
    setToolbarPos(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleExecuteSelectionAction = async (actionType: SelectionActionType) => {
    if (!selectedText) return;
    setSelectionLoading(true);
    setSelectionModalOpen(true);
    setToolbarPos(null);

    try {
      const result = await NCERTService.executeSelectionAction({
        actionType,
        selectedText,
        pageNumber: currentPage,
        chapterName: chapter.title,
        subject: chapter.subjectId,
        classLevel: chapter.classLevel,
      });
      setSelectionResult(result);
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setSelectionLoading(false);
    }
  };

  const handleExecuteAITool = (action: AIToolActionType) => {
    setAiToolsDrawerOpen(false);
    if (action === 'notes') {
      setActiveTab('notes');
    } else if (action === 'ask_ai') {
      setChatModalOpen(true);
    } else if (action === 'page_quiz') {
      if (pageData) onLaunchQuiz(pageData, currentPage);
    } else if (action === 'chapter_quiz') {
      if (pageData) onLaunchQuiz(pageData, currentPage);
    } else if (action === 'flashcards') {
      setFlashcardsModalOpen(true);
    } else if (action === 'important_questions') {
      setFormulaModalOpen(true);
    } else if (action === 'explain_page') {
      setPageLearningModalOpen(true);
    }
  };

  // Speech TTS handler
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    } else {
      if (!pageData) return;
      window.speechSynthesis.cancel();
      const textToRead = `${pageData.sectionTitle}. ${pageData.paragraphs.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = speechRate;
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsSpeechPaused(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsSpeechPaused(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsSpeechPaused(false);
    }
  };

  const getThemeClass = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422] border-[#ebd4b3]';
      case 'dark':
        return 'bg-slate-900 text-slate-100 border-slate-800';
      case 'light':
      default:
        return 'bg-white text-slate-900 border-purple-100/70 shadow-sm';
    }
  };

  const displayBookTitle = chapter.bookTitle || `${chapter.subjectId ? chapter.subjectId.toUpperCase() : 'NCERT'} Textbook`;

  return (
    <div className="min-h-screen bg-[#faf7fc] dark:bg-slate-950 flex flex-col font-sans pb-24">
      {/* Selection Floating Toolbar matching Screen 4 */}
      {toolbarPos && selectedText && (
        <NCERTSelectionToolbar
          position={toolbarPos}
          selectedText={selectedText}
          pageNumber={currentPage}
          chapterTitle={chapter.title}
          onHighlight={handleHighlight}
          onAction={handleExecuteSelectionAction}
          onClose={() => {
            setToolbarPos(null);
            setSelectedText('');
          }}
        />
      )}

      {/* Selection Result Modal */}
      {selectionModalOpen && (
        <NCERTSelectionResultModal
          isOpen={selectionModalOpen}
          onClose={() => setSelectionModalOpen(false)}
          result={selectionResult}
          loading={selectionLoading}
          chapterTitle={chapter.title}
        />
      )}

      {/* AI Tools Slide-up Drawer matching Screen 3 */}
      <NCERTAIToolsDrawer
        isOpen={aiToolsDrawerOpen}
        onClose={() => setAiToolsDrawerOpen(false)}
        chapterTitle={chapter.title}
        pageNumber={currentPage}
        onSelectTool={handleExecuteAITool}
      />

      {/* Top Bar matching Screen 4 */}
      <header className="sticky top-0 z-30 bg-[#faf7fc]/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-purple-100/70 dark:border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Back button & Book Header */}
          <div className="flex items-center space-x-3 truncate">
            <button
              onClick={onBackToCatalogue}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="truncate">
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                {displayBookTitle} - Class {chapter.classLevel}
              </h1>
            </div>
          </div>

          {/* Right Action Controls: Bookmark, AI Tools, Font size, Theme */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Bookmark Toggle */}
            <button
              onClick={toggleBookmark}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-purple-100 dark:bg-purple-950 text-[#E11D74] border-pink-300'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-purple-100 dark:border-slate-800 hover:bg-slate-50'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Bookmark this page'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#E11D74]' : ''}`} />
            </button>

            {/* AI Tools Drawer Button */}
            <button
              onClick={() => setAiToolsDrawerOpen(true)}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E11D74] to-[#9333ea] text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-pink-500/20 hover:scale-105 transition-all cursor-pointer"
              title="Open AI Tools"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Tools</span>
            </button>

            {/* Font Size Toggle */}
            <button
              onClick={() => {
                if (fontSize === 'normal') setFontSize('large');
                else if (fontSize === 'large') setFontSize('xlarge');
                else setFontSize('normal');
              }}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-black"
              title="Adjust font size"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                if (readingTheme === 'light') setReadingTheme('sepia');
                else if (readingTheme === 'sepia') setReadingTheme('dark');
                else setReadingTheme('light');
              }}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Toggle reading theme"
            >
              {readingTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-purple-400" />
              ) : readingTheme === 'sepia' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Sun className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4 space-y-4" onMouseUp={handleMouseUp}>
        {/* Chapter Hero Card matching Screen 4 */}
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-[#20053b] via-[#3b0764] to-[#581c87] text-white shadow-xl shadow-purple-950/15 flex items-center space-x-4 sm:space-x-5">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Atom className="w-7 h-7 text-pink-300 animate-spin-slow" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs sm:text-sm font-extrabold text-pink-300 uppercase tracking-wider">
              Chapter {chapter.chapterNumber}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
              {chapter.title}
            </h2>
          </div>
        </div>

        {/* Mode Tabs matching Screen 4: Read, Notes, Summary, Quiz */}
        <div className="flex items-center border-b border-purple-100 dark:border-slate-800 pt-1">
          {(['read', 'notes', 'summary', 'quiz'] as ReaderTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const labels: Record<ReaderTab, string> = {
              read: 'Read',
              notes: 'Notes',
              summary: 'Summary',
              quiz: 'Quiz',
            };
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'summary') setSummaryModalOpen(true);
                  if (tab === 'quiz' && pageData) onLaunchQuiz(pageData, currentPage);
                  if (tab === 'notes') setPageLearningModalOpen(true);
                }}
                className={`flex-1 py-3 text-center text-xs sm:text-sm font-extrabold transition-all relative cursor-pointer ${
                  isActive
                    ? 'text-[#E11D74]'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <span>{labels[tab]}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E11D74] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Text Area & Cards */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center space-y-4 border border-purple-100 dark:border-slate-800 shadow-sm">
            <div className="w-10 h-10 border-3 border-[#E11D74] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              Loading textbook content for Page {currentPage}...
            </p>
          </div>
        ) : pageData ? (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 ${getThemeClass()}`}>
            {/* Section Heading */}
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                {pageData.sectionTitle || `${chapter.chapterNumber}.1 Introduction`}
              </h3>
              {pageData.heading && (
                <p className="text-xs font-bold text-slate-500">{pageData.heading}</p>
              )}
            </div>

            {/* Paragraphs with Font Size & Theme */}
            <div
              className={`space-y-4 leading-relaxed font-sans text-slate-800 dark:text-slate-200 select-text ${
                fontSize === 'large'
                  ? 'text-base sm:text-lg'
                  : fontSize === 'xlarge'
                  ? 'text-lg sm:text-xl'
                  : 'text-xs sm:text-sm'
              }`}
            >
              {pageData.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="text-justify leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Molecular Concept Illustration Card matching Screen 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Atom Card */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                  <Atom className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Atom (Building Block)</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Smallest constituent unit of ordinary matter.
                  </p>
                </div>
              </div>

              {/* Molecule Card */}
              <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Molecule (Compound)</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Group of two or more atoms held by chemical bonds.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Points Card matching Screen 4 */}
            <div className="rounded-2xl p-5 bg-[#f5effc] dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950 text-[#E11D74] flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  Key Points
                </h4>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pl-2 font-medium">
                <li className="flex items-start space-x-2">
                  <span className="text-[#E11D74] font-black leading-tight">•</span>
                  <span>
                    Law of Conservation of Mass: Mass can neither be created nor destroyed in a chemical reaction.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#E11D74] font-black leading-tight">•</span>
                  <span>
                    Law of Constant Proportions: In a chemical substance elements are always present in definite proportions by mass.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#E11D74] font-black leading-tight">•</span>
                  <span>
                    Dalton&apos;s Atomic Theory states all matter is composed of tiny indivisible particles called atoms.
                  </span>
                </li>
              </ul>
            </div>

            {/* Page Navigator matching Screen 4: "< Previous   4 / 12   Next >" */}
            <div className="pt-4 border-t border-purple-50 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {currentPage} / {chapter.totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= chapter.totalPages}
                className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </main>

      {/* Bottom Reader Toolbar matching Screen 4 */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-purple-100/70 dark:border-slate-800/80 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* AI Tools */}
          <button
            onClick={() => setAiToolsDrawerOpen(true)}
            className="flex flex-col items-center space-y-1 text-slate-600 dark:text-slate-400 hover:text-[#E11D74] transition-colors cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-[#E11D74]" />
            <span className="text-[10px] font-bold">AI Tools</span>
          </button>

          {/* Highlight */}
          <button
            onClick={() => {
              if (selectedText) {
                handleHighlight('yellow');
              } else {
                setPageLearningModalOpen(true);
              }
            }}
            className="flex flex-col items-center space-y-1 text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
          >
            <Highlighter className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-bold">Highlight</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className={`flex flex-col items-center space-y-1 transition-colors cursor-pointer ${
              isBookmarked ? 'text-[#E11D74]' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-[#E11D74]' : ''}`} />
            <span className="text-[10px] font-bold">Bookmark</span>
          </button>

          {/* More */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className="flex flex-col items-center space-y-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 transition-colors cursor-pointer relative"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-bold">More</span>
          </button>
        </div>
      </nav>

      {/* More Options Popover */}
      {moreMenuOpen && (
        <div className="fixed bottom-16 right-4 sm:right-1/4 z-40 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-purple-100 dark:border-slate-800 p-2 w-52 space-y-1 animate-in slide-in-from-bottom-2">
          <button
            onClick={() => {
              setMoreMenuOpen(false);
              toggleSpeech();
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center space-x-2"
          >
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <span>{isSpeaking ? 'Stop Read Aloud' : 'Read Page Aloud'}</span>
          </button>

          <button
            onClick={() => {
              setMoreMenuOpen(false);
              setFormulaModalOpen(true);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center space-x-2"
          >
            <Calculator className="w-4 h-4 text-emerald-500" />
            <span>Formula Sheet</span>
          </button>

          <button
            onClick={() => {
              setMoreMenuOpen(false);
              setFlashcardsModalOpen(true);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center space-x-2"
          >
            <Layers className="w-4 h-4 text-pink-500" />
            <span>Flashcards Drill</span>
          </button>

          <button
            onClick={() => {
              setMoreMenuOpen(false);
              onOpenAnalytics();
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-800 flex items-center space-x-2"
          >
            <BarChart2 className="w-4 h-4 text-cyan-500" />
            <span>Chapter Analytics</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <NCERTChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        chapter={chapter}
        pageContent={pageData}
        pageNumber={currentPage}
      />

      <NCERTFormulaSheetModal
        isOpen={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
        chapter={chapter}
        currentPageContent={pageData}
        currentPageNumber={currentPage}
      />

      <NCERTFlashcardsModal
        isOpen={flashcardsModalOpen}
        onClose={() => setFlashcardsModalOpen(false)}
        chapter={chapter}
        pageContent={pageData}
        pageNumber={currentPage}
      />

      <NCERTPageSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        chapter={chapter}
        pageContent={pageData}
        pageNumber={currentPage}
      />

      <NCERTPageLearningModal
        isOpen={pageLearningModalOpen}
        onClose={() => setPageLearningModalOpen(false)}
        chapter={chapter}
        pageContent={pageData}
        pageNumber={currentPage}
        onStartQuiz={() => {
          if (pageData) {
            onLaunchQuiz(pageData, currentPage);
          }
        }}
      />
    </div>
  );
};
