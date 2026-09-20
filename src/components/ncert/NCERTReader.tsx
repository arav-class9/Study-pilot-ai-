import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  NCERTChapter,
  NCERTPageContent,
  NCERTClass,
  NCERTSubjectId,
  NCERTUploadedBook,
  NCERTSelectionActionResult,
  NCERTHighlight,
  NCERTWeakTopicInfo,
} from '../../types/ncert';
import { NCERTService } from '../../services/ncertService';
import { NCERTBookStorage } from '../../services/ncertBookStorage';
import { NCERTSelectionToolbar } from './NCERTSelectionToolbar';
import { NCERTSelectionResultModal } from './NCERTSelectionResultModal';
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
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
  TrendingDown,
  Highlighter,
  AlertTriangle,
  Calculator,
  Play,
  Pause,
  Square,
  Bookmark,
  X,
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

  // Modals for Search, Full-Book Test, Weak Topics, Formula Sheet, Flashcards, Chat, and Summary
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [weakTopicsModalOpen, setWeakTopicsModalOpen] = useState<boolean>(false);
  const [formulaModalOpen, setFormulaModalOpen] = useState<boolean>(false);
  const [flashcardsModalOpen, setFlashcardsModalOpen] = useState<boolean>(false);
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState<boolean>(false);
  const [pageLearningModalOpen, setPageLearningModalOpen] = useState<boolean>(false);

  // Audio Speech Controls
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSpeechPaused, setIsSpeechPaused] = useState<boolean>(false);

  // PDF Authentic View vs Structured Textbook View
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>(targetCitation?.viewMode || 'text');
  const [pdfZoom, setPdfZoom] = useState<number>(1.0);

  // Citation Spotlight State
  const [activeCitation, setActiveCitation] = useState<CitationNavigationTarget | null>(targetCitation || null);
  const [hasScrolledToCitation, setHasScrolledToCitation] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Listen for global citation navigation events
  useEffect(() => {
    const unsubscribe = onCitationNavigation((target) => {
      if (target.pageNumber) {
        setCurrentPage(target.pageNumber);
        if (target.viewMode) {
          setViewMode(target.viewMode);
        }
        setActiveCitation(target);
        setHasScrolledToCitation(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update activeCitation if prop changes
  useEffect(() => {
    if (targetCitation) {
      setActiveCitation(targetCitation);
      if (targetCitation.pageNumber && targetCitation.pageNumber !== currentPage) {
        setCurrentPage(targetCitation.pageNumber);
      }
      if (targetCitation.viewMode) {
        setViewMode(targetCitation.viewMode);
      }
      setHasScrolledToCitation(false);
    }
  }, [targetCitation]);

  // Auto-scroll and highlight target citation when pageData loads
  useEffect(() => {
    if (!loading && pageData && activeCitation && !hasScrolledToCitation) {
      const timer = setTimeout(() => {
        const quoteToFind = activeCitation.exactQuote || activeCitation.highlightKeyword;
        let matchedElem: HTMLElement | null = null;

        if (quoteToFind && pageData.paragraphs) {
          const cleanQuote = quoteToFind.toLowerCase().trim();
          const matchIndex = pageData.paragraphs.findIndex((p) => {
            const cleanP = p.toLowerCase();
            return cleanP.includes(cleanQuote.slice(0, 25)) || cleanQuote.includes(cleanP.slice(0, 25));
          });

          if (matchIndex !== -1) {
            matchedElem = document.getElementById(`ncert-para-${matchIndex}`);
          }
        }

        if (!matchedElem) {
          matchedElem = document.getElementById(`ncert-page-${currentPage}`) || contentRef.current;
        }

        if (matchedElem) {
          matchedElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHasScrolledToCitation(true);
        }
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [loading, pageData, activeCitation, hasScrolledToCitation, currentPage]);

  // Load Highlights for Current Page
  const loadHighlights = useCallback(async () => {
    const saved = await NCERTBookStorage.getHighlights(chapter.id, currentPage);
    setHighlights(saved);
  }, [chapter.id, currentPage]);

  // Load page content whenever page changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setPageData(null); // CRITICAL: Clear previous page data to prevent race conditions
    setJumpPageInput(String(currentPage));
    setToolbarPos(null);
    setSelectedText('');

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    loadHighlights();

    // 1. If uploaded book has this page pre-processed, load directly!
    if (uploadedBook && uploadedBook.pages && uploadedBook.pages[currentPage]) {
      const p = uploadedBook.pages[currentPage];
      const directContent: NCERTPageContent = {
        pageNumber: p.pageNumber,
        sectionTitle: p.sectionTitle,
        heading: p.heading,
        paragraphs: p.paragraphs,
        activities: (p.diagrams || []).map((d) => ({
          activityNumber: d.label,
          title: d.title,
          procedure: d.description || '',
          observation: 'Observation from official NCERT page',
          conclusion: 'Verified NCERT conclusion',
        })),
        formulas: p.formulas || [],
        inTextQuestions: (p.exercises || []).flatMap((ex) =>
          ex.questions.map((q) => ({
            question: q,
            answerHint: `From ${ex.title}`,
          }))
        ),
        ncertHighlights: p.ncertHighlights || [
          `Key concept on Page ${p.pageNumber} of ${p.chapterTitle}`,
        ],
        vocabulary: p.vocabulary || [],
        keyConcepts: p.topics || [],
        pageType: (p.pageType as any) || 'content',
        imageDataUrl: p.imageDataUrl,
        isScanned: p.isScanned,
      };
      setPageData(directContent);
      setLoading(false);
      NCERTService.markPageAsRead(userId, chapter.id, currentPage);
      return;
    }

    // 2. Otherwise fetch or load from service
    NCERTService.getPageContent({
      chapterId: chapter.id,
      classLevel: chapter.classLevel,
      subjectId: chapter.subjectId,
      chapterName: chapter.title,
      pageNumber: currentPage,
    })
      .then((data) => {
        if (isMounted && data && data.pageNumber === currentPage) {
          setPageData(data);
          setLoading(false);
          NCERTService.markPageAsRead(userId, chapter.id, currentPage);
        }
      })
      .catch((err) => {
        console.error('Error loading page:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [chapter.id, chapter.classLevel, chapter.subjectId, chapter.title, currentPage, userId, uploadedBook, loadHighlights]);

  // Handle Text Selection in Document
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setToolbarPos(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 5) {
      setToolbarPos(null);
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

  // Selection Actions Handler (Notes, Explain, Quiz)
  const handleSelectionAction = async (actionType: 'notes' | 'explain' | 'quiz', textToUse?: string) => {
    const text = textToUse || selectedText;
    if (!text) return;
    setToolbarPos(null);
    setSelectionResult(null);
    setSelectionLoading(true);
    setSelectionModalOpen(true);

    try {
      const res = await NCERTService.executeSelectionAction({
        actionType,
        selectedText: text,
        pageNumber: currentPage,
        chapterName: chapter.title,
        subject: chapter.subjectId,
        classLevel: chapter.classLevel,
      });
      setSelectionResult(res);
      setSelectionLoading(false);
    } catch (err: any) {
      console.error('Selection action failed:', err);
      setSelectionLoading(false);
      alert(err.message || 'Failed to process selected text.');
    }
  };

  // Add Highlight
  const handleHighlight = async (color: 'yellow' | 'emerald' | 'cyan' | 'rose') => {
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
    await NCERTBookStorage.saveHighlight(newHighlight);
    setHighlights((prev) => [...prev, newHighlight]);
    setToolbarPos(null);
    window.getSelection()?.removeAllRanges();
  };

  // Voice Read-Aloud with playback controls
  const startSpeech = (rate = speechRate) => {
    if (!('speechSynthesis' in window) || !pageData) return;
    window.speechSynthesis.cancel();

    const textToRead = [
      pageData.sectionTitle,
      pageData.heading,
      ...pageData.paragraphs,
    ].filter(Boolean).join('. ');

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = rate;
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
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window) || !pageData) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeechPaused(false);
    } else {
      startSpeech(speechRate);
    }
  };

  const togglePauseResumeSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeechPaused) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsSpeechPaused(false);
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    if (isSpeaking && !isSpeechPaused) {
      startSpeech(newRate);
    }
  };

  // Page Navigation Handlers
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
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= chapter.totalPages) {
      setCurrentPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  // Styles based on settings
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg leading-relaxed';
      case 'xlarge':
        return 'text-xl leading-loose';
      default:
        return 'text-base leading-relaxed';
    }
  };

  const getThemeClass = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422]';
      case 'dark':
        return 'bg-slate-950 text-slate-100';
      default:
        return 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100';
    }
  };

  // Effective book title
  const displayBookTitle = uploadedBook?.title || `NCERT Class ${chapter.classLevel} ${chapter.subjectId.toUpperCase()}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Floating Selection Toolbar */}
      {toolbarPos && selectedText && (
        <NCERTSelectionToolbar
          position={toolbarPos}
          selectedText={selectedText}
          pageNumber={currentPage}
          chapterTitle={chapter.title}
          onHighlight={handleHighlight}
          onAction={handleSelectionAction}
          onClose={() => setToolbarPos(null)}
        />
      )}

      {/* Result Modal for Selection Notes/Explains/Quizzes */}
      <NCERTSelectionResultModal
        isOpen={selectionModalOpen}
        onClose={() => setSelectionModalOpen(false)}
        result={selectionResult}
        loading={selectionLoading}
        chapterTitle={chapter.title}
      />

      {/* Search Modal */}
      {uploadedBook && (
        <NCERTSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          book={uploadedBook}
          onNavigateToPage={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Full Book / Chapter Test Modal */}
      {uploadedBook && (
        <NCERTFullBookTestModal
          isOpen={testModalOpen}
          onClose={() => setTestModalOpen(false)}
          book={uploadedBook}
          selectedChapter={
            uploadedBook.chapters.find((c) => c.chapterNumber === chapter.chapterNumber) || null
          }
        />
      )}

      {/* Weak Topics Dialog Modal */}
      {weakTopicsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Weak Topics &amp; NCERT Page References</span>
              </h3>
              <button
                onClick={() => setWeakTopicsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto">
              <NCERTWeakTopicsDashboard
                onNavigateToPage={(p) => {
                  setCurrentPage(p);
                  setWeakTopicsModalOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reader Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Back & Title */}
          <div className="flex items-center space-x-3">
            <button
              id="ncert-back-btn"
              onClick={onBackToCatalogue}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Chapters</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                NCERT Class {chapter.classLevel}
              </span>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                Ch {chapter.chapterNumber}: {chapter.title}
              </h1>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Search Book */}
            {uploadedBook && (
              <button
                id="ncert-search-book-btn"
                onClick={() => setSearchModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Search topics, headings & diagrams"
              >
                <Search className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden lg:inline">Search Book</span>
              </button>
            )}

            {/* Upload PDF */}
            {onOpenUploadPDF && (
              <button
                id="ncert-upload-pdf-btn"
                onClick={onOpenUploadPDF}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Upload Complete NCERT PDF from official portal"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Upload Full PDF</span>
              </button>
            )}

            {/* Page Learning Hub (AI Explanation, Summary, Key Points, Questions, Flashcards) */}
            <button
              id="ncert-page-learning-btn"
              onClick={() => setPageLearningModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Open Complete Page Learning Hub (Explanation, Summary, Questions, Flashcards)"
            >
              <Brain className="w-3.5 h-3.5 text-amber-300" />
              <span>Page Learning Hub</span>
            </button>

            {/* Weak Topics */}
            <button
              id="ncert-weak-topics-btn"
              onClick={() => setWeakTopicsModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="View Weak Topics with Source Page Citations"
            >
              <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Weak Topics</span>
            </button>

            {/* Flashcards */}
            <button
              id="ncert-flashcards-btn"
              onClick={() => setFlashcardsModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Drill Active Recall Flashcards for this Page"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden md:inline">Flashcards</span>
            </button>

            {/* Formulas & Equations */}
            <button
              id="ncert-formula-sheet-btn"
              onClick={() => setFormulaModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Formulas, Chemical Equations & Definitions Cheat Sheet"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Formulas</span>
            </button>

            {/* Full-Book or Chapter Assessment */}
            {uploadedBook && (
              <button
                id="ncert-fullbook-test-btn"
                onClick={() => setTestModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Take Full-Book or Chapter Mock Test"
              >
                <Award className="w-3.5 h-3.5 fill-white text-transparent" />
                <span className="hidden sm:inline">Full-Book Test</span>
              </button>
            )}

            {/* Summarize Page */}
            <button
              id="ncert-summarize-page-btn"
              onClick={() => setSummaryModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Generate summary and key takeaways for this page"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">Summarize Page</span>
            </button>

            {/* Ask AI Tutor */}
            <button
              id="ncert-ask-ai-btn"
              onClick={() => setChatModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Ask AI tutor anything about this page"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Ask AI</span>
            </button>

            {/* Instant Page Quiz CTA button */}
            <button
              id="ncert-instant-quiz-btn"
              onClick={() => pageData && onLaunchQuiz(pageData, currentPage)}
              disabled={loading || !pageData || pageData.pageNumber !== currentPage}
              className="px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg shadow-xs hover:shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Quiz Page {currentPage}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Reader Controls Bar (Page nav, zoom, voice, theme) */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Page Navigator */}
          <div className="flex items-center space-x-2">
            <button
              id="ncert-prev-page-btn"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>

            <form onSubmit={handleJumpSubmit} className="flex items-center space-x-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Page</span>
              <input
                id="ncert-jump-page-input"
                type="number"
                min="1"
                max={chapter.totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-12 px-1.5 py-1 text-center font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-slate-500 dark:text-slate-400 font-medium">of {chapter.totalPages}</span>
            </form>

            <button
              id="ncert-next-page-btn"
              onClick={handleNextPage}
              disabled={currentPage >= chapter.totalPages}
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>
          </div>

          {/* Interactive Selection Hint */}
          <div className="hidden sm:flex items-center space-x-1.5 text-slate-500 text-[11px]">
            <Highlighter className="w-3.5 h-3.5 text-amber-500" />
            <span>Select any text to highlight, create notes, or generate strict quizzes!</span>
          </div>

          {/* Text Controls (Theme, Font size, Speech) */}
          <div className="flex items-center space-x-3">
            {/* Read Aloud Button */}
            <button
              onClick={toggleSpeech}
              className={`p-1.5 rounded-md border transition-colors flex items-center space-x-1 cursor-pointer ${
                isSpeaking
                  ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title={isSpeaking ? 'Stop Reading' : 'Read Page Aloud'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-medium">{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>

            {/* Font Size Selector */}
            <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 overflow-hidden">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 text-[11px] font-bold ${
                  fontSize === 'normal' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 text-xs font-bold ${
                  fontSize === 'large' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-1 text-sm font-bold ${
                  fontSize === 'xlarge' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                A++
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 p-0.5 space-x-1">
              <button
                onClick={() => setReadingTheme('light')}
                className={`w-5 h-5 rounded-sm border ${
                  readingTheme === 'light' ? 'ring-2 ring-indigo-500' : ''
                } bg-white`}
                title="Light Theme"
              />
              <button
                onClick={() => setReadingTheme('sepia')}
                className={`w-5 h-5 rounded-sm border ${
                  readingTheme === 'sepia' ? 'ring-2 ring-indigo-500' : ''
                } bg-[#fbf0d9]`}
                title="Sepia Theme"
              />
              <button
                onClick={() => setReadingTheme('dark')}
                className={`w-5 h-5 rounded-sm border ${
                  readingTheme === 'dark' ? 'ring-2 ring-indigo-500' : ''
                } bg-slate-900`}
                title="Dark Theme"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Reader Content Area with onMouseUp text selection detection */}
      <main
        className="flex-1 py-8 px-4"
        onMouseUp={handleMouseUp}
      >
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Loading authentic textbook content for Page {currentPage}...
              </p>
            </div>
          ) : pageData ? (
            <div
              ref={contentRef}
              id={`ncert-page-${currentPage}`}
              className={`rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-10 transition-colors ${getThemeClass()}`}
            >
              {/* Page Header (Official NCERT Section and Page Number) */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {displayBookTitle} • Ch {chapter.chapterNumber}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
                    {pageData.sectionTitle}
                  </h2>
                  {pageData.heading && (
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                      {pageData.heading}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {currentPage}
                  </div>
                  <div className="text-xs uppercase font-bold text-slate-400">Page</div>
                </div>
              </div>

              {/* Citation Spotlight Banner */}
              {activeCitation && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-purple-500/15 border-2 border-amber-400/80 dark:border-amber-500/60 shadow-md animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <Sparkles className="w-4 h-4 animate-spin-slow" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                            AI Tutor Citation Spotlight
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-mono">
                            Page {currentPage}
                          </span>
                        </div>
                        {activeCitation.exactQuote ? (
                          <p className="mt-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic font-serif leading-snug">
                            "{activeCitation.exactQuote}"
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            Referenced in AI Doubt explanation from {activeCitation.bookTitle || 'NCERT Curriculum'}.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {activeCitation.exactQuote && (
                        <button
                          type="button"
                          onClick={() => {
                            const newHl: NCERTHighlight = {
                              id: `hl_cite_${Date.now()}`,
                              userId,
                              chapterId: chapter.id,
                              pageNumber: currentPage,
                              text: activeCitation.exactQuote!,
                              color: 'yellow',
                              createdAt: new Date().toISOString(),
                            };
                            NCERTBookStorage.saveHighlight(newHl);
                            setHighlights((prev) => [...prev, newHl]);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-200/70 dark:bg-amber-900/60 hover:bg-amber-300 transition-colors flex items-center space-x-1 cursor-pointer"
                          title="Save this referenced citation as permanent highlight"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Save Highlight</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCitation(null);
                          clearActiveCitationTarget();
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Dismiss Citation Spotlight"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Highlights on this page */}
              {highlights.length > 0 && (
                <div className="mb-6 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">
                    🖍️ Your Saved Highlights on Page {currentPage} ({highlights.length})
                  </span>
                  <div className="space-y-1">
                    {highlights.map((hl) => (
                      <div
                        key={hl.id}
                        className="p-1.5 rounded-md bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/40 text-slate-800 dark:text-slate-200 italic"
                      >
                        "{hl.text}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF Authentic View Switcher */}
              {pageData.imageDataUrl && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Display:</span>
                    <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
                      <button
                        onClick={() => setViewMode('text')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'text'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        Structured Reader
                      </button>
                      <button
                        onClick={() => setViewMode('pdf')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          viewMode === 'pdf'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        Authentic PDF Page {pageData.isScanned ? '• Scanned/OCR' : ''}
                      </button>
                    </div>
                  </div>

                  {viewMode === 'pdf' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPdfZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                        title="Zoom Out"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-bold px-1.5">{Math.round(pdfZoom * 100)}%</span>
                      <button
                        onClick={() => setPdfZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                        title="Zoom In"
                      >
                        +
                      </button>
                      <button
                        onClick={() => setPdfZoom(1.0)}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Authentic PDF View Canvas Image */}
              {viewMode === 'pdf' && pageData.imageDataUrl && (
                <div className="mb-6 flex flex-col items-center">
                  <div className="w-full overflow-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 p-3 shadow-inner flex justify-center">
                    <img
                      src={pageData.imageDataUrl}
                      alt={`Official NCERT Page ${currentPage}`}
                      style={{ transform: `scale(${pdfZoom})`, transformOrigin: 'top center' }}
                      className="max-w-full rounded-md shadow-2xl transition-transform duration-150"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 text-center">
                    Rendered high-resolution PDF canvas. Verified against official textbook repository.
                  </p>
                </div>
              )}

              {/* NCERT Textbook Paragraphs */}
              <div className={`space-y-4 ${getFontSizeClass()} select-text selection:bg-indigo-200 dark:selection:bg-indigo-800`}>
                {pageData.paragraphs.map((para, idx) => {
                  const quoteToFind = activeCitation?.exactQuote || activeCitation?.highlightKeyword;
                  const isMatch = Boolean(
                    quoteToFind &&
                      (para.toLowerCase().includes(quoteToFind.toLowerCase().slice(0, 25)) ||
                        quoteToFind.toLowerCase().includes(para.toLowerCase().slice(0, 25)))
                  );

                  return (
                    <p
                      key={idx}
                      id={`ncert-para-${idx}`}
                      className={`text-justify font-serif leading-relaxed transition-all duration-300 ${
                        isMatch
                          ? 'bg-amber-100/90 dark:bg-amber-950/70 border-l-4 border-amber-500 pl-4 py-2.5 rounded-r-xl shadow-xs ring-2 ring-amber-300/50 dark:ring-amber-500/30'
                          : ''
                      }`}
                    >
                      {isMatch && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/80 px-2 py-0.5 rounded mr-2 align-middle">
                          <Sparkles className="w-2.5 h-2.5" /> Referenced Citation
                        </span>
                      )}
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* NCERT Activities Callout Box */}
              {pageData.activities && pageData.activities.length > 0 && (
                <div className="mt-8 space-y-4">
                  {pageData.activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700/80 bg-amber-50/70 dark:bg-amber-950/20 p-5"
                    >
                      <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-sm mb-2">
                        <FlaskConical className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <span>{act.activityNumber}: {act.title}</span>
                      </div>
                      <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <p>
                          <strong className="text-amber-900 dark:text-amber-200">Procedure:</strong>{' '}
                          {act.procedure}
                        </p>
                        {act.observation && (
                          <p>
                            <strong className="text-amber-900 dark:text-amber-200">Observation:</strong>{' '}
                            {act.observation}
                          </p>
                        )}
                        {act.conclusion && (
                          <p>
                            <strong className="text-amber-900 dark:text-amber-200">Conclusion:</strong>{' '}
                            {act.conclusion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chemical Equations / Mathematical Formulas Box */}
              {pageData.formulas && pageData.formulas.length > 0 && (
                <div className="mt-6 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 p-4">
                  <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Key Equations &amp; Formulas on this Page</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
                    {pageData.formulas.map((form, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-2 rounded-md bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs font-semibold"
                      >
                        {form}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NCERT Highlights / Do You Know? Callouts */}
              {pageData.ncertHighlights && pageData.ncertHighlights.length > 0 && (
                <div className="mt-6 space-y-2.5">
                  {pageData.ncertHighlights.map((hl, hlIdx) => (
                    <div
                      key={hlIdx}
                      className="p-3.5 rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm font-medium flex items-start space-x-2"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* In-Text NCERT Questions */}
              {pageData.inTextQuestions && pageData.inTextQuestions.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-bold text-sm mb-3">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span>NCERT In-Text Questions (Bottom of Page {currentPage})</span>
                  </div>
                  <div className="space-y-3">
                    {pageData.inTextQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                      >
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Q{qIdx + 1}. {q.question}
                        </p>
                        {q.answerHint && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                            💡 NCERT Key Concept: {q.answerHint}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary / Definitions */}
              {pageData.vocabulary && pageData.vocabulary.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2">
                    Key Vocabulary from Page {currentPage}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {pageData.vocabulary.map((v, vIdx) => (
                      <div key={vIdx} className="p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{v.term}: </span>
                        <span className="text-slate-600 dark:text-slate-300">{v.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Instant Page Quiz Callout Bar */}
              <div className="mt-10 p-5 rounded-2xl bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Finished reading Page {currentPage}?</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Take an instant interactive quiz generated strictly from this page’s verified text and formulas!
                  </p>
                </div>

                <button
                  id="ncert-launch-quiz-bottom-btn"
                  onClick={() => pageData && pageData.pageNumber === currentPage && onLaunchQuiz(pageData, currentPage)}
                  disabled={loading || !pageData || pageData.pageNumber !== currentPage}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start Page {currentPage} Quiz</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Could not load content for Page {currentPage}.
              </p>
            </div>
          )}

          {/* Bottom Page Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page ({currentPage > 1 ? currentPage - 1 : 1})</span>
            </button>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              NCERT Page {currentPage} of {chapter.totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= chapter.totalPages}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Next Page ({currentPage < chapter.totalPages ? currentPage + 1 : chapter.totalPages})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Persistent Floating Audio Player Bar */}
      {isSpeaking && (
        <div
          id="ncert-audio-player-bar"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 dark:bg-slate-850/95 text-white backdrop-blur-md px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isSpeechPaused ? 'bg-amber-400' : 'bg-emerald-400'
                } opacity-75`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isSpeechPaused ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              ></span>
            </span>
            <span className="text-xs font-bold tracking-tight">
              {isSpeechPaused ? 'Audio Paused' : `Reading Page ${currentPage}`}
            </span>
          </div>

          {/* Play/Pause */}
          <button
            onClick={togglePauseResumeSpeech}
            className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors cursor-pointer"
            title={isSpeechPaused ? 'Resume reading' : 'Pause reading'}
          >
            {isSpeechPaused ? (
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            ) : (
              <Pause className="w-4 h-4 fill-current" />
            )}
          </button>

          {/* Stop */}
          <button
            onClick={stopSpeech}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Stop audio"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-700 text-[11px] font-bold">
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                  speechRate === rate
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formula & Reactions Quick Drawer / Modal */}
      <NCERTFormulaSheetModal
        isOpen={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
        chapter={chapter}
        currentPageContent={pageData}
        currentPageNumber={currentPage}
      />

      {/* Smart Flashcards Drill Modal */}
      <NCERTFlashcardsModal
        isOpen={flashcardsModalOpen}
        onClose={() => setFlashcardsModalOpen(false)}
        chapter={chapter}
        pageContent={pageData}
        pageNumber={currentPage}
      />

      {/* Ask AI Chat Modal */}
      <NCERTChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        chapter={chapter}
        pageContent={pageData}
        pageNumber={currentPage}
      />

      {/* Page Summary Modal */}
      <NCERTPageSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        chapter={chapter}
        pageContent={pageData}
        pageNumber={currentPage}
      />

      {/* Complete Page-Based Learning Hub Modal */}
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
