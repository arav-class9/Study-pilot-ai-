import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
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
} from 'lucide-react';

export const NCERTBooksPage: React.FC = () => {
  const { user } = useApp();
  const defaultClass = (user?.classLevel && ['6', '7', '8', '9', '10', '11', '12'].includes(user.classLevel)
    ? user.classLevel
    : '10') as NCERTClass;

  const [selectedClass, setSelectedClass] = useState<NCERTClass>(defaultClass);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reader state
  const [activeChapter, setActiveChapter] = useState<NCERTChapter | null>(null);
  const [activeUploadedBook, setActiveUploadedBook] = useState<NCERTUploadedBook | null>(null);
  const [readerPageNumber, setReaderPageNumber] = useState<number>(1);

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

  // Filter chapters
  const filteredChapters = useMemo(() => {
    let chapters = getNCERTChaptersForClass(
      selectedClass,
      selectedSubject === 'all' ? undefined : selectedSubject
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      chapters = chapters.filter(
        (c: NCERTChapter) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.keyThemes.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    return chapters;
  }, [selectedClass, selectedSubject, searchQuery]);

  const handleOpenChapter = (
    chapter: NCERTChapter,
    pageNum: number = 1,
    book?: NCERTUploadedBook
  ) => {
    setActiveChapter(chapter);
    setActiveUploadedBook(book || uploadedBooks[0] || null);
    setReaderPageNumber(pageNum);
  };

  const handleOpenUploadedBook = (book: NCERTUploadedBook) => {
    if (book.chapters && book.chapters.length > 0) {
      const firstCh = book.chapters[0];
      const matchedChapter: NCERTChapter = {
        id: firstCh.id,
        bookTitle: book.title,
        classLevel: book.classLevel,
        subjectId: book.subjectId,
        chapterNumber: firstCh.chapterNumber,
        title: firstCh.title,
        description: `Official NCERT textbook chapter extracted directly from ${book.fileName}`,
        totalPages: firstCh.totalPages,
        highYieldWeightage: 'Board Core',
        keyThemes: firstCh.topics.slice(0, 4),
      };
      setActiveChapter(matchedChapter);
      setActiveUploadedBook(book);
      setReaderPageNumber(firstCh.startPage);
    }
  };

  const handleLaunchQuizFromReader = (pageContent: NCERTPageContent, pageNumber: number) => {
    setQuizPageContent(pageContent);
    setQuizPageNumber(pageNumber);
    setQuizModalOpen(true);
  };

  const handleUploadPageLoaded = (page: NCERTPageContent, customChapterName?: string) => {
    if (activeChapter) {
      setReaderPageNumber(page.pageNumber);
    } else {
      const firstChapter = filteredChapters[0];
      if (firstChapter) {
        setActiveChapter(firstChapter);
        setReaderPageNumber(page.pageNumber);
      }
    }
  };

  const handleDirectQuizFromUpload = (page: NCERTPageContent, pageNumber: number) => {
    const chapterToUse = activeChapter || filteredChapters[0];
    if (chapterToUse) {
      setActiveChapter(chapterToUse);
      setQuizPageContent(page);
      setQuizPageNumber(pageNumber);
      setQuizModalOpen(true);
    }
  };

  const handleBookUploaded = (book: NCERTUploadedBook) => {
    setUploadedBooks((prev) => [book, ...prev.filter((b) => b.id !== book.id)]);
    handleOpenUploadedBook(book);
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-4 h-4" />;
      case 'Globe':
        return <Globe className="w-4 h-4" />;
      case 'Atom':
      default:
        return <Atom className="w-4 h-4" />;
    }
  };

  // If student is actively reading a chapter, show the full NCERTReader!
  if (activeChapter) {
    return (
      <>
        <NCERTReader
          chapter={activeChapter}
          initialPage={readerPageNumber}
          userId={user?.uid || 'guest-student'}
          uploadedBook={activeUploadedBook}
          onLaunchQuiz={handleLaunchQuizFromReader}
          onOpenUpload={() => setUploadModalOpen(true)}
          onOpenUploadPDF={() => setPdfUploadModalOpen(true)}
          onOpenAnalytics={() => setAnalyticsModalOpen(true)}
          onOpenRevision={() => setRevisionDeckOpen(true)}
          onBackToCatalogue={() => setActiveChapter(null)}
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
          />
        )}

        {uploadModalOpen && (
          <NCERTPageUploadModal
            isOpen={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            chapter={activeChapter}
            onPageLoaded={handleUploadPageLoaded}
            onDirectQuiz={handleDirectQuizFromUpload}
          />
        )}

        {pdfUploadModalOpen && (
          <NCERTPDFUploadModal
            isOpen={pdfUploadModalOpen}
            onClose={() => setPdfUploadModalOpen(false)}
            onBookLoaded={handleBookUploaded}
            currentClass={selectedClass}
          />
        )}

        {revisionDeckOpen && (
          <NCERTRevisionDeck
            isOpen={revisionDeckOpen}
            onClose={() => setRevisionDeckOpen(false)}
            userId={user?.uid || 'guest-student'}
            chapter={activeChapter}
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

  // Catalogue View: Browse by Class & Subject + Uploaded Books
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top Hero Banner */}
      <section className="bg-linear-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white pt-10 pb-12 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold tracking-wide backdrop-blur-xs">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>OFFICIAL NCERT TEXTBOOKS &amp; PDF PROCESSOR</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                NCERT Books, PDF Upload &amp; Board Mock Tests
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
                Upload complete NCERT textbook PDFs from the official NCERT portal. Automatically parse chapters, headings, exercises, diagrams, and formulas. Highlight any excerpt to generate notes, explanations, or strict page quizzes!
              </p>
            </div>

            {/* Quick Action Top CTAs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                id="ncert-hero-upload-pdf-btn"
                onClick={() => setPdfUploadModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload NCERT PDF</span>
              </button>

              <button
                id="ncert-hero-fullbook-test-btn"
                onClick={() => {
                  if (uploadedBooks.length > 0) {
                    setActiveUploadedBook(uploadedBooks[0]);
                    setFullBookTestModalOpen(true);
                  } else {
                    setPdfUploadModalOpen(true);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center space-x-2 backdrop-blur-xs transition-colors cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Full-Book Test</span>
              </button>

              <button
                id="ncert-hero-weak-topics-btn"
                onClick={() => setWeakTopicsModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center space-x-2 backdrop-blur-xs transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>Weak Topics</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="ncert-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NCERT textbooks, chapters, chemical reactions, or theorems..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm shadow-sm border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-amber-300 font-medium"
            />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 space-y-6">
        {/* Uploaded & Official Indexed Books Carousel / Grid */}
        {uploadedBooks.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Processed &amp; Indexed NCERT Books ({uploadedBooks.length})
                </h3>
              </div>
              <button
                onClick={() => setPdfUploadModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Another NCERT PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {uploadedBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                        Class {book.classLevel} • {book.subjectId.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {book.totalPages} Pages
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {book.fileName} • {book.chapters.length} Chapters detected
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleOpenUploadedBook(book)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Book</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveUploadedBook(book);
                        setFullBookTestModalOpen(true);
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                      title="Take Full Book Mock Test"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveUploadedBook(book);
                        setSearchModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Search Content Index"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Class Selection Pills */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select NCERT Class:
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              CBSE &amp; State Boards Aligned
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {(['6', '7', '8', '9', '10', '11', '12'] as NCERTClass[]).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Class {cls}
              </button>
            ))}
          </div>

          {/* Subject Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Subjects
            </button>

            {NCERT_SUBJECTS_CATALOG.map((subj: any) => (
              <button
                key={subj.id}
                onClick={() => setSelectedSubject(subj.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  selectedSubject === subj.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {getSubjectIcon(subj.iconName)}
                <span>{subj.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              NCERT Class {selectedClass} Chapters ({filteredChapters.length})
            </h2>
            <span className="text-xs text-slate-500">
              Click any chapter to read page-by-page &amp; take quizzes
            </span>
          </div>

          {filteredChapters.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No chapters found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-slate-500">
                Try searching for another keyword, or click &ldquo;Upload NCERT PDF&rdquo; to process any official book!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChapters.map((chapter: NCERTChapter) => (
                <div
                  key={chapter.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Chapter {chapter.chapterNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {chapter.highYieldWeightage}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {chapter.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {chapter.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {chapter.keyThemes.slice(0, 3).map((theme: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {chapter.totalPages} Textbook Pages
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenChapter(chapter, 1)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>Read Book</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

      {searchModalOpen && activeUploadedBook && (
        <NCERTSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          book={activeUploadedBook}
          onNavigateToPage={(p) => {
            if (activeUploadedBook) {
              handleOpenUploadedBook(activeUploadedBook);
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
                  const firstCh = filteredChapters[0];
                  if (firstCh) {
                    handleOpenChapter(firstCh, p);
                  }
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
