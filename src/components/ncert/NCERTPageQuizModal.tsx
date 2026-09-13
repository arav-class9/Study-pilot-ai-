import React, { useState, useEffect } from 'react';
import {
  NCERTChapter,
  NCERTPageContent,
  NCERTQuizQuestion,
  NCERTDifficulty,
  NCERTQuizResult,
} from '../../types/ncert';
import { NCERTService } from '../../services/ncertService';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  ArrowRight,
  RotateCcw,
  BookMarked,
  Share2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NCERTPageQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: NCERTChapter;
  pageContent: NCERTPageContent;
  pageNumber: number;
  userId: string;
  onGoToNextPage?: () => void;
}

export const NCERTPageQuizModal: React.FC<NCERTPageQuizModalProps> = ({
  isOpen,
  onClose,
  chapter,
  pageContent,
  pageNumber,
  userId,
  onGoToNextPage,
}) => {
  // Quiz configuration
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('adaptive');
  const [quizState, setQuizState] = useState<'setup' | 'loading' | 'active' | 'completed'>('setup');

  // Active quiz state
  const [questions, setQuestions] = useState<NCERTQuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSecondsElapsed((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  if (!isOpen) return null;

  const getFriendlyQuizErrorMessage = (err: any): string => {
    const code = err?.code;
    switch (code) {
      case 'PAGE_CONTENT_NOT_FOUND':
        return 'The selected NCERT page could not be loaded. Please ensure the page exists and try again.';
      case 'EMPTY_PAGE_CONTENT':
        return 'The selected NCERT page does not contain sufficient textbook content to generate a quiz.';
      case 'INVALID_REQUEST':
        return 'Invalid page number or question parameters. Please select a valid textbook page.';
      case 'AI_RESPONSE_INVALID':
        return 'The quiz could not be generated. Please try again.';
      case 'QUIZ_VALIDATION_FAILED':
        return 'The generated quiz questions failed validation checks. Please try generating again.';
      case 'AI_GENERATION_FAILED':
        return 'The AI tutor encountered an issue generating questions. Please try again in a moment.';
      default:
        return err?.message || 'Unable to generate quiz for this page. Please try again.';
    }
  };

  const startQuiz = async () => {
    if (quizState === 'loading') return;

    const numPage = Number(pageNumber);
    if (!Number.isInteger(numPage) || numPage <= 0) {
      setErrorMsg('Invalid NCERT page number selected.');
      return;
    }

    setQuizState('loading');
    setErrorMsg(null);

    // Concatenate full page content for prompt
    const fullPageText = [
      pageContent?.sectionTitle ? `Section: ${pageContent.sectionTitle}` : '',
      pageContent?.heading ? `Heading: ${pageContent.heading}` : '',
      'Paragraphs:',
      ...(pageContent?.paragraphs || []),
      pageContent?.formulas?.length ? `Formulas & Equations: ${pageContent.formulas.join('; ')}` : '',
      pageContent?.ncertHighlights?.length ? `NCERT Highlights: ${pageContent.ncertHighlights.join('; ')}` : '',
      pageContent?.activities?.length
        ? `Activities: ${pageContent.activities.map((a) => `${a.activityNumber} ${a.title} - Conclusion: ${a.conclusion}`).join('; ')}`
        : '',
      pageContent?.inTextQuestions?.length
        ? `In-Text Questions: ${pageContent.inTextQuestions.map((q) => q.question).join('; ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      const generated = await NCERTService.generateQuizForPage({
        bookId: chapter.bookTitle || chapter.id,
        chapterId: chapter.id,
        chapterName: chapter.title,
        subject: chapter.subjectId,
        classLevel: chapter.classLevel,
        pageNumber: numPage,
        questionCount,
        count: questionCount,
        mode: difficulty === 'adaptive' ? 'adaptive' : 'standard',
        difficulty,
        pageContent: fullPageText,
      });

      if (generated && generated.length > 0) {
        setQuestions(generated);
        setCurrentQIndex(0);
        setSelectedOption(null);
        setUserAnswers({});
        setShowExplanation(false);
        setSecondsElapsed(0);
        setTimerActive(true);
        setQuizState('active');
      } else {
        throw new Error('No questions returned');
      }
    } catch (err: any) {
      console.error('[NCERT QUIZ] Generation error:', err?.code, err?.message, err);
      setErrorMsg(getFriendlyQuizErrorMessage(err));
      setQuizState('setup');
    }
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return; // already answered this question
    setSelectedOption(index);
    setUserAnswers((prev) => ({ ...prev, [currentQIndex]: index }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(userAnswers[currentQIndex + 1] ?? null);
      setShowExplanation(userAnswers[currentQIndex + 1] !== undefined);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setTimerActive(false);
    setQuizState('completed');

    // Calculate score
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });

    const percentage = Math.round((score / questions.length) * 100);

    // Confetti celebration for score >= 80%
    if (percentage >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Record result in Service & Firestore
    const result: NCERTQuizResult = {
      id: `ncert-quiz-${Date.now()}`,
      userId,
      classLevel: chapter.classLevel,
      subjectId: chapter.subjectId,
      chapterId: chapter.id,
      chapterName: chapter.title,
      pageNumber,
      date: new Date().toISOString(),
      totalQuestions: questions.length,
      score,
      percentage,
      timeSpentSeconds: secondsElapsed,
      difficulty,
      questions,
      userAnswers,
    };

    NCERTService.recordQuizResult(result);
  };

  const toggleBookmark = (q: NCERTQuizQuestion) => {
    const nextSet = new Set(bookmarkedQuestions);
    if (nextSet.has(q.id)) {
      nextSet.delete(q.id);
    } else {
      nextSet.add(q.id);
      NCERTService.addQuestionToRevision({
        id: q.id,
        userId,
        classLevel: chapter.classLevel,
        subjectId: chapter.subjectId,
        chapterId: chapter.id,
        chapterName: chapter.title,
        pageNumber,
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        difficulty: q.difficulty,
        conceptTag: q.conceptTag,
        addedAt: new Date().toISOString(),
        reviewCount: 0,
        nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
        mastered: false,
      });
    }
    setBookmarkedQuestions(nextSet);
  };

  const addAllMissedToRevision = () => {
    questions.forEach((q, idx) => {
      if (userAnswers[idx] !== q.correctAnswerIndex) {
        NCERTService.addQuestionToRevision({
          id: q.id,
          userId,
          classLevel: chapter.classLevel,
          subjectId: chapter.subjectId,
          chapterId: chapter.id,
          chapterName: chapter.title,
          pageNumber,
          question: q.question,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          conceptTag: q.conceptTag,
          addedAt: new Date().toISOString(),
          reviewCount: 0,
          nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
          mastered: false,
        });
      }
    });
    alert('All missed questions added to your NCERT Revision Deck!');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Page {pageNumber} Interactive Quiz
              </h3>
              <p className="text-xs text-indigo-100 truncate max-w-sm">
                NCERT Class {chapter.classLevel} • {chapter.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Setup State */}
        {quizState === 'setup' && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Generate Instant Quiz from Page {pageNumber}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Study Pilot AI will craft custom CBSE/NCERT multiple choice questions strictly based on the text, definitions, formulas, and activities of Page {pageNumber}.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Questions count choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Number of MCQs
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 5, 8].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      questionCount === num
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {num} Questions
                    <span className="block text-[10px] font-normal text-slate-500">
                      {num === 3 ? 'Quick Check (~2 min)' : num === 5 ? 'Standard Drill (~4 min)' : 'Deep Mastery (~7 min)'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'easy', label: 'Easy', desc: 'Direct NCERT lines' },
                  { id: 'medium', label: 'Medium', desc: 'Conceptual' },
                  { id: 'hard', label: 'Hard', desc: 'Exam Traps' },
                  { id: 'adaptive', label: 'Adaptive', desc: 'Balanced Mix' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      difficulty === item.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              id="start-page-quiz-now-btn"
              onClick={startQuiz}
              disabled={!Number.isInteger(Number(pageNumber)) || Number(pageNumber) <= 0 || !pageContent}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate &amp; Start Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2. Loading State */}
        {quizState === 'loading' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Generating Page {pageNumber} Quiz...
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Scanning page text, extracting key NCERT definitions, chemical reactions, and formulating board-level MCQs.
            </p>
          </div>
        )}

        {/* 3. Active Quiz State */}
        {quizState === 'active' && currentQ && (
          <div className="p-6 space-y-5">
            {/* Header: Progress, Timer, Difficulty badge, Bookmark */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    currentQ.difficulty === 'easy'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : currentQ.difficulty === 'hard'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {currentQ.difficulty}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(secondsElapsed)}</span>
                </div>
                <button
                  onClick={() => toggleBookmark(currentQ)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    bookmarkedQuestions.has(currentQ.id)
                      ? 'bg-amber-50 border-amber-300 text-amber-600 dark:bg-amber-950 dark:border-amber-700'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                  }`}
                  title="Bookmark question for Revision Deck"
                >
                  <BookMarked className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question}
              </p>
              {currentQ.conceptTag && (
                <span className="inline-block mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  Target Concept: {currentQ.conceptTag}
                </span>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctAnswerIndex;
                const isAnswered = selectedOption !== null;

                let btnStyle = 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700';
                let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500';
                    badgeStyle = 'bg-emerald-600 text-white';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500';
                    badgeStyle = 'bg-rose-600 text-white';
                  } else {
                    btnStyle = 'opacity-60 border-slate-200 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer disabled:cursor-default ${btnStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${badgeStyle}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                      {opt}
                    </span>
                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card (Instant Feedback) */}
            {showExplanation && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>NCERT Page Explanation</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                  {currentQ.explanation}
                </p>
                {currentQ.quoteFromPage && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic border-l-2 border-indigo-400 pl-2">
                    &ldquo;{currentQ.quoteFromPage}&rdquo;
                  </p>
                )}
                <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
                  Reference: {currentQ.ncertPageReference}
                </div>
              </div>
            )}

            {/* Next / Submit Button */}
            {selectedOption !== null && (
              <div className="flex justify-end pt-2">
                <button
                  id="next-quiz-question-btn"
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <span>
                    {currentQIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Completed State */}
        {quizState === 'completed' && (
          <div className="p-6 text-center space-y-6">
            {/* Score Card */}
            <div>
              <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                Page {pageNumber} Quiz Complete!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {chapter.title} • Page {pageNumber}
              </p>
            </div>

            {/* Score & Metrics Grid */}
            {(() => {
              let score = 0;
              questions.forEach((q, idx) => {
                if (userAnswers[idx] === q.correctAnswerIndex) score++;
              });
              const pct = Math.round((score / questions.length) * 100);

              return (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {score}/{questions.length}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Score</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div
                      className={`text-xl font-black ${
                        pct >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : pct >= 50
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {pct}%
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Accuracy</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-xl font-black text-slate-800 dark:text-slate-200">
                      {formatTime(secondsElapsed)}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Time Spent</div>
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={addAllMissedToRevision}
                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <BookMarked className="w-4 h-4 text-emerald-500" />
                <span>Add Missed Questions to Revision Deck</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuizState('setup')}
                  className="flex-1 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>

                {onGoToNextPage && pageNumber < chapter.totalPages && (
                  <button
                    onClick={() => {
                      onClose();
                      onGoToNextPage();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                  >
                    <span>Next Page ({pageNumber + 1})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
