import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translateUI, SupportedLanguage } from '../services/i18n';
import {
  NCERTClass,
  NCERTSubjectId,
  NCERTChapter,
  NCERTPageContent,
  NCERTUploadedBook,
} from '../types/ncert';
import {
  NCERT_SUBJECTS_CATALOG,
  getNCERTChaptersForClass,
  getNCERTChapterById,
} from '../data/ncertBooksData';
import { NCERTReader } from '../components/ncert/NCERTReader';
import { NCERTPageQuizModal } from '../components/ncert/NCERTPageQuizModal';
import { NCERTPageUploadModal } from '../components/ncert/NCERTPageUploadModal';
import { NCERTPDFUploadModal } from '../components/ncert/NCERTPDFUploadModal';
import { NCERTFullBookTestModal } from '../components/ncert/NCERTFullBookTestModal';
import { NCERTSearchModal } from '../components/ncert/NCERTSearchModal';
import { NCERTWeakTopicsDashboard } from '../components/ncert/NCERTWeakTopicsDashboard';
import { NCERTRevisionDeck } from '../components/ncert/NCERTRevisionDeck';
import { NCERTChapterAnalytics } from '../components/ncert/NCERTChapterAnalytics';
import { NCERTBookStorage } from '../services/ncertBookStorage';
import { NCERTBookCover } from '../components/ncert/NCERTBookCover';
import { NCERTBookDetailView, BookDetailModel } from '../components/ncert/NCERTBookDetailView';
import { NCERTAIToolsDrawer, AIToolActionType } from '../components/ncert/NCERTAIToolsDrawer';
import {
  onCitationNavigation,
  getActiveCitationTarget,
  clearActiveCitationTarget,
  CitationNavigationTarget,
} from '../services/citationNavigation';
import {
  BookOpen,
  Search,
  Upload,
  RotateCcw,
  Sparkles,
  BarChart2,
  Atom,
  Calculator,
  Globe,
  Award,
  Layers,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ExternalLink,
  Plus,
  Languages,
  BookMarked,
  Feather,
  ChevronLeft,
  SlidersHorizontal,
  Bookmark,
  Bell,
  Check,
  Play,
  Clock,
  Flame,
} from 'lucide-react';

type FilterCategory = 'all' | 'ncert' | 'my_books' | 'uploaded' | 'recently_studied' | 'favorites';

export const NCERTBooksPage: React.FC = () => {
  const { user, language } = useApp();
  const currentLang = (language as SupportedLanguage) || 'en';
  const defaultClass = (user?.classLevel && ['6', '7', '8', '9', '10', '11', '12'].includes(user.classLevel)
    ? user.classLevel
    : '9') as NCERTClass;

  const [selectedClass, setSelectedClass] = useState<NCERTClass>(defaultClass);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Navigation states: Library (default), Detail View (Screen 2), or Reader (Screen 4 & 5)
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<BookDetailModel | null>(null);
  const [activeChapter, setActiveChapter] = useState<NCERTChapter | null>(null);
  const [activeUploadedBook, setActiveUploadedBook] = useState<NCERTUploadedBook | null>(null);
  const [readerPageNumber, setReaderPageNumber] = useState<number>(1);
  const [targetCitation, setTargetCitation] = useState<CitationNavigationTarget | null>(null);

  // Favorites tracking
  const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('studypilot_fav_books');
      return saved ? new Set(JSON.parse(saved)) : new Set(['book-9-science', 'book-9-math']);
    } catch (e) {
      return new Set(['book-9-science', 'book-9-math']);
    }
  });

  const toggleFavoriteBook = (bookId: string) => {
    setFavoriteBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      try {
        localStorage.setItem('studypilot_fav_books', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  // Uploaded Books collection
  const [uploadedBooks, setUploadedBooks] = useState<NCERTUploadedBook[]>([]);

  // Modals state
  const [quizModalOpen, setQuizModalOpen] = useState<boolean>(false);
  const [quizPageContent, setQuizPageContent] = useState<NCERTPageContent | null>(null);
  const [quizPageNumber, setQuizPageNumber] = useState<number>(1);

  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [pdfUploadModalOpen, setPdfUploadModalOpen] = useState<boolean>(false);
  const [fullBookTestModalOpen, setFullBookTestModalOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [revisionDeckOpen, setRevisionDeckOpen] = useState<boolean>(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState<boolean>(false);
  const [weakTopicsModalOpen, setWeakTopicsModalOpen] = useState<boolean>(false);
  const [aiToolsDrawerOpen, setAiToolsDrawerOpen] = useState<boolean>(false);

  // Load uploaded books
  const refreshUploadedBooks = async () => {
    try {
      const books = await NCERTBookStorage.getAllBooks();
      setUploadedBooks(books);
    } catch (e) {
      console.warn('Failed to load uploaded books:', e);
    }
  };

  useEffect(() => {
    refreshUploadedBooks();
  }, []);

  // Citation Navigation Listener
  useEffect(() => {
    const handleTarget = (target: CitationNavigationTarget) => {
      setTargetCitation(target);
      const pageToOpen = target.pageNumber || 1;
      setReaderPageNumber(pageToOpen);

      // Find best matching chapter
      const targetClass = (target.classLevel as NCERTClass) || selectedClass;
      const allClassChapters = getNCERTChaptersForClass(targetClass);

      let matchedChapter: NCERTChapter | undefined;
      if (target.chapterId) {
        matchedChapter = getNCERTChapterById(target.chapterId);
      }
      if (!matchedChapter && target.chapterName) {
        const cleanName = target.chapterName.toLowerCase();
        matchedChapter = allClassChapters.find(
          (c) =>
            c.title.toLowerCase().includes(cleanName) ||
            cleanName.includes(c.title.toLowerCase())
        );
      }
      if (!matchedChapter && target.subjectId) {
        matchedChapter = allClassChapters.find((c) => c.subjectId === target.subjectId);
      }
      if (!matchedChapter && allClassChapters.length > 0) {
        matchedChapter = allClassChapters[0];
      }

      if (matchedChapter) {
        setActiveChapter(matchedChapter);
      }
    };

    const existing = getActiveCitationTarget();
    if (existing) {
      handleTarget(existing);
    }

    const unsubscribe = onCitationNavigation((target) => {
      handleTarget(target);
    });

    return () => unsubscribe();
  }, [selectedClass]);

  // Construct Book Models for the current selected class
  const allBooksList = useMemo<BookDetailModel[]>(() => {
    const list: BookDetailModel[] = [];

    // Predefined curriculum books for this class
    const subjectsForClass = NCERT_SUBJECTS_CATALOG.filter((s) =>
      s.classes.includes(selectedClass)
    );

    // Mock/stored sample progress percentages & last chapters matching the reference showcase
    const sampleBookData: Record<string, { pct: number; lastChapter: string }> = {
      science: { pct: 65, lastChapter: 'Ch 5 – The Fundamental Units of Life' },
      math: { pct: 32, lastChapter: 'Ch 3 – Linear Equations in Two Variables' },
      mathematics: { pct: 32, lastChapter: 'Ch 3 – Linear Equations in Two Variables' },
      social: { pct: 18, lastChapter: 'Ch 2 – Physical Features of India' },
      'social-science': { pct: 18, lastChapter: 'Ch 2 – Physical Features of India' },
      english: { pct: 42, lastChapter: 'Ch 4 – The Little Girl' },
      hindi: { pct: 25, lastChapter: 'Ch 1 – Do Bailon Ki Katha' },
    };

    for (const subj of subjectsForClass) {
      const chapters = subj.chapters.filter((c) => c.classLevel === selectedClass);
      if (chapters.length === 0) continue;

      const bookId = `book-${selectedClass}-${subj.id}`;
      const defaultInfo = sampleBookData[subj.id] || { pct: 20, lastChapter: `Ch 1 – ${chapters[0]?.title || 'Introduction'}` };

      // Check if user has progress saved
      let progressPct = defaultInfo.pct;
      try {
        const storedPct = localStorage.getItem(`ncert_book_pct_${bookId}`);
        if (storedPct !== null) {
          progressPct = parseInt(storedPct, 10);
        }
      } catch (e) {}

      list.push({
        id: bookId,
        title: subj.name,
        classLevel: selectedClass,
        subjectId: subj.id,
        board: 'NCERT',
        progressPercentage: progressPct,
        lastOpenedChapterTitle: defaultInfo.lastChapter,
        isFavorite: favoriteBookIds.has(bookId),
        isUploaded: false,
        chapters,
      });
    }

    // Add user uploaded books for this class
    for (const upBook of uploadedBooks) {
      if (upBook.classLevel === selectedClass || selectedCategory === 'uploaded') {
        list.push({
          id: upBook.id,
          title: upBook.title,
          classLevel: upBook.classLevel,
          subjectId: upBook.subjectId,
          board: 'Uploaded PDF',
          progressPercentage: 10,
          lastOpenedChapterTitle: upBook.chapters[0]?.title || 'Chapter 1',
          isFavorite: favoriteBookIds.has(upBook.id),
          isUploaded: true,
          uploadedBookRef: upBook,
          chapters: (upBook.chapters || []).map((ch) => ({
            id: ch.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            subjectId: upBook.subjectId,
            classLevel: upBook.classLevel,
            bookTitle: upBook.title,
            totalPages: ch.totalPages,
            description: `Extracted from ${upBook.fileName}`,
            highYieldWeightage: 'User Upload',
            keyThemes: ch.topics || [],
          })),
        });
      }
    }

    return list;
  }, [selectedClass, uploadedBooks, favoriteBookIds, selectedCategory]);

  // Filter books by search & category
  const filteredBooks = useMemo(() => {
    let result = allBooksList;

    // Filter category
    if (selectedCategory === 'ncert') {
      result = result.filter((b) => !b.isUploaded);
    } else if (selectedCategory === 'uploaded') {
      result = result.filter((b) => b.isUploaded);
    } else if (selectedCategory === 'favorites') {
      result = result.filter((b) => b.isFavorite);
    } else if (selectedCategory === 'recently_studied' || selectedCategory === 'my_books') {
      result = result.filter((b) => b.progressPercentage > 0);
    }

    // Filter search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.lastOpenedChapterTitle.toLowerCase().includes(q) ||
          b.chapters.some((c) => c.title.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allBooksList, selectedCategory, searchQuery]);

  const handleOpenBook = (book: BookDetailModel) => {
    setSelectedBookForDetail(book);
  };

  const handleContinueReadingBook = (book: BookDetailModel) => {
    const firstCh = book.chapters[0];
    if (firstCh) {
      setActiveChapter(firstCh);
      setActiveUploadedBook(book.uploadedBookRef || null);
      setReaderPageNumber(1);
    }
  };

  const handleOpenChapterFromDetail = (chapter: NCERTChapter, pageNum: number = 1) => {
    setActiveChapter(chapter);
    setActiveUploadedBook(selectedBookForDetail?.uploadedBookRef || null);
    setReaderPageNumber(pageNum);
  };

  const handleSelectAIToolFromDetail = (tool: AIToolActionType, chapter?: NCERTChapter) => {
    const targetCh = chapter || selectedBookForDetail?.chapters[0];
    if (!targetCh) return;

    if (tool === 'notes' || tool === 'explain_page') {
      setActiveChapter(targetCh);
      setReaderPageNumber(1);
    } else if (tool === 'ask_ai') {
      setActiveChapter(targetCh);
      setReaderPageNumber(1);
    } else if (tool === 'page_quiz' || tool === 'chapter_quiz') {
      setActiveChapter(targetCh);
      setReaderPageNumber(1);
    } else if (tool === 'flashcards' || tool === 'important_questions') {
      setActiveChapter(targetCh);
      setReaderPageNumber(1);
    }
  };

  const handleLaunchQuizFromReader = (pageContent: NCERTPageContent, pageNumber: number) => {
    setQuizPageContent(pageContent);
    setQuizPageNumber(pageNumber);
    setQuizModalOpen(true);
  };

  const handleUploadPageLoaded = (page: NCERTPageContent) => {
    if (activeChapter) {
      setReaderPageNumber(page.pageNumber);
    }
  };

  const handleDirectQuizFromUpload = (page: NCERTPageContent, pageNumber: number) => {
    const chapterToUse = activeChapter || (allBooksList[0]?.chapters[0]);
    if (chapterToUse) {
      setActiveChapter(chapterToUse);
      setQuizPageContent(page);
      setQuizPageNumber(pageNumber);
      setQuizModalOpen(true);
    }
  };

  const handleBookUploaded = (book: NCERTUploadedBook) => {
    setUploadedBooks((prev) => [book, ...prev.filter((b) => b.id !== book.id)]);
    refreshUploadedBooks();
  };

  // -------------------------------------------------------------
  // RENDER LEVEL 1: Fullscreen Interactive Reader (Screen 4 & 5)
  // -------------------------------------------------------------
  if (activeChapter) {
    return (
      <>
        <NCERTReader
          chapter={activeChapter}
          initialPage={readerPageNumber}
          targetCitation={targetCitation}
          userId={user?.uid || 'guest-student'}
          uploadedBook={activeUploadedBook}
          onLaunchQuiz={handleLaunchQuizFromReader}
          onOpenUpload={() => setUploadModalOpen(true)}
          onOpenUploadPDF={() => setPdfUploadModalOpen(true)}
          onOpenAnalytics={() => setAnalyticsModalOpen(true)}
          onOpenRevision={() => setRevisionDeckOpen(true)}
          onBackToCatalogue={() => {
            setActiveChapter(null);
            setTargetCitation(null);
          }}
        />

        {quizModalOpen && quizPageContent && (
          <NCERTPageQuizModal
            isOpen={quizModalOpen}
            onClose={() => setQuizModalOpen(false)}
            chapter={activeChapter}
            pageContent={quizPageContent}
            pageNumber={quizPageNumber}
            userId={user?.uid || 'guest-student'}
            onGoToNextPage={() => {
              if (readerPageNumber < activeChapter.totalPages) {
                setReaderPageNumber((p) => p + 1);
              }
            }}
            onViewSourcePage={(p: number) => {
              setReaderPageNumber(p);
            }}
          />
        )}

        {analyticsModalOpen && (
          <NCERTChapterAnalytics
            isOpen={analyticsModalOpen}
            onClose={() => setAnalyticsModalOpen(false)}
            chapter={activeChapter}
            userId={user?.uid || 'guest-student'}
            onJumpToPage={(p: number) => setReaderPageNumber(p)}
          />
        )}
      </>
    );
  }

  // -------------------------------------------------------------
  // RENDER LEVEL 2: Book Detail View (Screen 2)
  // -------------------------------------------------------------
  if (selectedBookForDetail) {
    return (
      <>
        <NCERTBookDetailView
          book={selectedBookForDetail}
          onBack={() => setSelectedBookForDetail(null)}
          onOpenChapter={(ch, pageNum) => handleOpenChapterFromDetail(ch, pageNum)}
          onContinueReading={() => handleContinueReadingBook(selectedBookForDetail)}
          onSelectAITool={(tool, ch) => handleSelectAIToolFromDetail(tool, ch)}
          onOpenUploadModal={() => setPdfUploadModalOpen(true)}
          onToggleFavorite={toggleFavoriteBook}
        />

        {pdfUploadModalOpen && (
          <NCERTPDFUploadModal
            isOpen={pdfUploadModalOpen}
            onClose={() => setPdfUploadModalOpen(false)}
            onBookLoaded={handleBookUploaded}
            currentClass={selectedClass}
          />
        )}
      </>
    );
  }

  // -------------------------------------------------------------
  // RENDER LEVEL 3: Library Home (Screen 1)
  // -------------------------------------------------------------
  const categoryTabs = [
    { id: 'all' as FilterCategory, label: 'All' },
    { id: 'ncert' as FilterCategory, label: 'NCERT', icon: BookOpen },
    { id: 'my_books' as FilterCategory, label: 'My Books', icon: Layers },
    { id: 'uploaded' as FilterCategory, label: 'Uploaded', icon: Upload },
    { id: 'recently_studied' as FilterCategory, label: 'Recently Studied', icon: Clock },
    { id: 'favorites' as FilterCategory, label: 'Favorites', icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-[#faf7fc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24">
      {/* Top Main Navigation Bar matching Screen 1 */}
      <header className="sticky top-0 z-30 bg-[#faf7fc]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-purple-100/60 dark:border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E11D74] via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                StudyPilot AI
              </h1>
              <p className="text-[11px] font-semibold text-slate-400 leading-none">
                Learn Smarter • Grow Faster
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E11D74] ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* User Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-[#E11D74] text-white font-black text-xs flex items-center justify-center shadow-2xs">
              {(user?.name || user?.email || 'S').slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Library Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {/* Hero Card: "My Learning Library" matching Screen 1 */}
        <div className="relative rounded-3xl p-6 sm:p-7 overflow-hidden bg-gradient-to-r from-[#20053b] via-[#3b0764] to-[#581c87] text-white shadow-xl shadow-purple-950/20">
          {/* Subtle star/sparkle background elements */}
          <div className="absolute -right-6 -bottom-10 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
          <div className="absolute top-4 right-1/3 w-2 h-2 rounded-full bg-amber-300 animate-ping opacity-60" />
          <div className="absolute bottom-6 left-1/4 w-1.5 h-1.5 rounded-full bg-pink-300 opacity-50" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                My Learning Library
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 font-medium leading-relaxed">
                Your NCERT, Books &amp; Notes — All in One Place
              </p>

              {/* Class Selector Badges */}
              <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                {(['6', '7', '8', '9', '10', '11', '12'] as NCERTClass[]).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      selectedClass === cls
                        ? 'bg-white text-purple-950 shadow-md ring-2 ring-pink-400'
                        : 'bg-white/10 text-white/90 hover:bg-white/20'
                    }`}
                  >
                    Class {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Stack of Books Isometric Graphic */}
            <div className="relative shrink-0 flex items-center justify-center self-center sm:self-auto">
              <div className="relative w-32 h-28 sm:w-40 sm:h-36 flex items-center justify-center">
                {/* Glowing Aura */}
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 to-purple-400/30 blur-xl rounded-full" />

                {/* Stack of colorful isometric books */}
                <svg className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-2xl" viewBox="0 0 160 140" fill="none">
                  {/* Bottom Book (Cyan) */}
                  <g transform="translate(10, 50)">
                    <polygon points="70,10 130,35 70,60 10,35" fill="#0284c7" />
                    <polygon points="10,35 70,60 70,72 10,47" fill="#0369a1" />
                    <polygon points="70,60 130,35 130,47 70,72" fill="#075985" />
                    {/* Pages */}
                    <polygon points="12,37 68,60 68,69 12,46" fill="#f8fafc" opacity="0.9" />
                  </g>

                  {/* Middle Book (Magenta/Pink) */}
                  <g transform="translate(15, 30)">
                    <polygon points="70,10 130,35 70,60 10,35" fill="#E11D74" />
                    <polygon points="10,35 70,60 70,72 10,47" fill="#be123c" />
                    <polygon points="70,60 130,35 130,47 70,72" fill="#9f1239" />
                    {/* Pages */}
                    <polygon points="12,37 68,60 68,69 12,46" fill="#fdf2f8" opacity="0.9" />
                  </g>

                  {/* Top Open Book (Amber/Violet) */}
                  <g transform="translate(20, 10)">
                    <polygon points="70,10 130,35 70,60 10,35" fill="#a855f7" />
                    <polygon points="10,35 70,60 70,72 10,47" fill="#7e22ce" />
                    <polygon points="70,60 130,35 130,47 70,72" fill="#6b21a8" />
                    {/* Pages */}
                    <polygon points="12,37 68,60 68,69 12,46" fill="#ffffff" />
                  </g>

                  {/* Sparkle Stars */}
                  <path d="M 30 15 Q 35 15 35 10 Q 35 15 40 15 Q 35 15 35 20 Q 35 15 30 15" fill="#fbbf24" />
                  <path d="M 125 15 Q 130 15 130 10 Q 130 15 135 15 Q 130 15 130 20 Q 130 15 125 15" fill="#fbbf24" />
                  <path d="M 140 55 Q 143 55 143 52 Q 143 55 146 55 Q 143 55 143 58 Q 143 55 140 55" fill="#f472b6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar + Filter Icon matching Screen 1 */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, chapters or topics..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 shadow-xs text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#E11D74]"
            />
          </div>

          <button
            onClick={() => {}}
            className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 shadow-xs flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Sort & Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Chips matching Screen 1 */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E11D74] text-white shadow-md shadow-pink-500/25 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-800 border border-purple-100/80 dark:border-slate-800'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Header: "Your Books" with "View All" */}
        <div className="flex items-center justify-between pt-2 px-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Your Books
          </h3>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs font-extrabold text-[#E11D74] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Book Cards Grid matching Screen 1 */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-purple-100 dark:border-slate-800 space-y-3">
            <BookOpen className="w-10 h-10 text-purple-400 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No books found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, selecting another class, or upload a textbook PDF.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleOpenBook(book)}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-purple-100/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:border-pink-300 dark:hover:border-pink-800 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  {/* Book Cover Container */}
                  <div className="flex justify-center pt-1">
                    <NCERTBookCover
                      title={book.title}
                      subjectId={book.subjectId}
                      classLevel={book.classLevel}
                      size="md"
                      isUploaded={book.isUploaded}
                    />
                  </div>

                  {/* Title & Class */}
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#E11D74] transition-colors leading-snug truncate">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Class {book.classLevel} • {book.board}
                    </p>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#E11D74]">{book.progressPercentage}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#E11D74] via-purple-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${Math.max(5, Math.min(100, book.progressPercentage))}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Chapter Studied */}
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    Last: {book.lastOpenedChapterTitle}
                  </p>
                </div>

                {/* Continue Reading Button */}
                <div className="pt-3 mt-2 border-t border-purple-50 dark:border-slate-800/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContinueReadingBook(book);
                    }}
                    className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#E11D74] via-[#c026d3] to-[#8b5cf6] hover:from-[#c026d3] hover:to-[#7c3aed] text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-pink-500/20 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Continue Reading</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating "+ Upload Book" Button matching Screen 1 */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setPdfUploadModalOpen(true)}
          className="px-5 py-3.5 rounded-full bg-gradient-to-r from-[#E11D74] to-[#a855f7] hover:from-[#c026d3] hover:to-[#9333ea] text-white font-black text-xs sm:text-sm shadow-xl shadow-pink-500/35 hover:shadow-2xl flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Upload Book</span>
        </button>
      </div>

      {/* Global Modals */}
      {pdfUploadModalOpen && (
        <NCERTPDFUploadModal
          isOpen={pdfUploadModalOpen}
          onClose={() => setPdfUploadModalOpen(false)}
          onBookLoaded={handleBookUploaded}
          currentClass={selectedClass}
        />
      )}

      {uploadModalOpen && (
        <NCERTPageUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onPageLoaded={handleUploadPageLoaded}
          onDirectQuiz={handleDirectQuizFromUpload}
        />
      )}

      {fullBookTestModalOpen && (
        <NCERTFullBookTestModal
          isOpen={fullBookTestModalOpen}
          onClose={() => setFullBookTestModalOpen(false)}
          book={activeUploadedBook || uploadedBooks[0]}
        />
      )}

      {searchModalOpen && (
        <NCERTSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          book={activeUploadedBook || uploadedBooks[0]}
          onNavigateToPage={(p) => {
            if (activeUploadedBook) {
              setReaderPageNumber(p);
            }
          }}
        />
      )}

      {weakTopicsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Weak Topics &amp; NCERT Source Page Citations</span>
              </h3>
              <button
                onClick={() => setWeakTopicsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto">
              <NCERTWeakTopicsDashboard
                onNavigateToPage={(p) => {
                  setWeakTopicsModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {revisionDeckOpen && (
        <NCERTRevisionDeck
          isOpen={revisionDeckOpen}
          onClose={() => setRevisionDeckOpen(false)}
          userId={user?.uid || 'guest-student'}
        />
      )}
    </div>
  );
};
