import React, { useState, useEffect } from 'react';
import { NCERTUploadedBook, NCERTQuizQuestion, NCERTDetectedChapter } from '../../types/ncert';
import { NCERTService } from '../../services/ncertService';
import { NCERTBookStorage } from '../../services/ncertBookStorage';
import {
  X,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Quote,
} from 'lucide-react';

interface FullBookTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: NCERTUploadedBook;
  selectedChapter?: NCERTDetectedChapter | null;
}

export const NCERTFullBookTestModal: React.FC<FullBookTestModalProps> = ({
  isOpen,
  onClose,
  book,
  selectedChapter,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<NCERTQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load test questions
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setElapsedSeconds(0);

    // Pick representative pages from the book or selected chapter
    const targetPages = selectedChapter
      ? Object.values(book.pages).filter(
          (p) => p.pageNumber >= selectedChapter.startPage && p.pageNumber <= selectedChapter.endPage
        )
      : Object.values(book.pages);

    const sampledPages = targetPages.slice(0, 12).map((p) => ({
      pageNumber: p.pageNumber,
      chapterNumber: p.chapterNumber,
      chapterTitle: p.chapterTitle,
      sectionTitle: p.sectionTitle,
      excerptText: p.rawText.substring(0, 800),
    }));

    if (sampledPages.length === 0) {
      setErrorMsg('No readable pages available in this textbook to generate test.');
      setLoading(false);
      return;
    }

    const testTitle = selectedChapter
      ? `${selectedChapter.title} Chapter Quiz`
      : `${book.title} Full-Book Test`;

    NCERTService.generateFullBookTest({
      bookTitle: testTitle,
      classLevel: book.classLevel,
      subject: book.subjectId,
      pages: sampledPages,
      questionCount: selectedChapter ? 8 : 12,
    })
      .then((res) => {
        if (isMounted) {
          setQuestions(res.questions);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate full book test:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Failed to create test from textbook content.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, book, selectedChapter]);

  // Timer
  useEffect(() => {
    if (!isOpen || isSubmitted || loading) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSubmitted, loading]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    // Record weak topics for every question answered incorrectly
    questions.forEach((q, idx) => {
      const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
      // Extract page number from ncertPageReference
      const pageMatch = q.ncertPageReference.match(/Page\s+(\d+)/i);
      const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : 1;

      NCERTBookStorage.recordTopicAttempt({
        topicName: q.conceptTag || selectedChapter?.title || book.title,
        chapterNumber: selectedChapter?.chapterNumber || 1,
        chapterTitle: selectedChapter?.title || book.title,
        sourcePageNumber: pageNum,
        isCorrect,
      });
    });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate score
  const correctCount = questions.filter(
    (q, idx) => userAnswers[idx] === q.correctAnswerIndex
  ).length;
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {selectedChapter ? `Chapter ${selectedChapter.chapterNumber} Assessment` : 'Full-Book Comprehensive Board Test'}
              </h3>
              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <span>{book.title}</span>
                <span>•</span>
                <span>{book.chapters.length} Chapters Indexed</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!loading && !isSubmitted && (
              <div className="flex items-center space-x-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Compiling Multi-Chapter Examination...
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Sampling key exercises, activities, and board principles across your uploaded NCERT chapters.
              </p>
            </div>
          ) : errorMsg ? (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 text-xs text-center space-y-2">
              <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
              <p className="font-bold">{errorMsg}</p>
            </div>
          ) : !isSubmitted && currentQ ? (
            /* Active Test View */
            <div className="space-y-5">
              {/* Question Navigation Chips */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">
                  Question {currentIndex + 1} of {questions.length}
                </span>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
                  {questions.map((_, idx) => {
                    const isAnswered = userAnswers[idx] !== undefined;
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                            : isAnswered
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source Page Citation Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/60">
                  📖 {currentQ.ncertPageReference}
                </span>
                <span className="text-slate-500 font-semibold uppercase text-[11px]">
                  Tag: {currentQ.conceptTag}
                </span>
              </div>

              {/* Question Text */}
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm flex items-center space-x-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-indigo-300 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center font-bold shrink-0 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav Controls */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((i) => i + 1)}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit &amp; View Results</span>
                  </button>
                )}
              </div>
            </div>
          ) : isSubmitted ? (
            /* Results & Page-by-Page Source Review */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Score Header Banner */}
              <div className="p-5 rounded-2xl bg-linear-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-200 dark:border-indigo-800 text-center">
                <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 block">
                  {scorePercent}%
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  You scored {correctCount} out of {questions.length} questions
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Completed in {formatTime(elapsedSeconds)} • All answers verified against uploaded NCERT source text
                </p>
              </div>

              {/* Detailed Question Review with Exact NCERT Page Citations */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Question Review &amp; Official NCERT Page Citations
                </h5>

                {questions.map((q, qIdx) => {
                  const selected = userAnswers[qIdx];
                  const isCorrect = selected === q.correctAnswerIndex;

                  return (
                    <div
                      key={qIdx}
                      className={`p-4 rounded-xl border space-y-3 ${
                        isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Q{qIdx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] flex items-center space-x-1 shrink-0 ml-2">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[11px] flex items-center space-x-1 shrink-0 ml-2">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Needs Review</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong>Correct Answer:</strong>{' '}
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {q.options[q.correctAnswerIndex]}
                          </span>
                        </p>
                        {!isCorrect && selected !== undefined && (
                          <p className="text-slate-600 dark:text-slate-400">
                            <strong>Your Selection:</strong>{' '}
                            <span className="text-rose-600 dark:text-rose-400">
                              {q.options[selected]}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Source Citation & Verification Quote */}
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                        <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>NCERT Textbook Reference: {q.ncertPageReference}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-sans">
                          {q.explanation}
                        </p>
                        {q.quoteFromPage && (
                          <p className="text-[11px] text-slate-500 italic mt-1">
                            <Quote className="w-3 h-3 inline mr-1" />
                            "{q.quoteFromPage}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/50"
          >
            Close
          </button>

          {isSubmitted && (
            <button
              onClick={() => {
                setIsSubmitted(false);
                setCurrentIndex(0);
                setUserAnswers({});
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Test</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
